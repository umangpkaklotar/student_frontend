import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const DEFAULT_PROD_API_URL = 'https://student-backend-hyrr.onrender.com/api';
const DEFAULT_DEV_API_URL = 'http://localhost:8000/api';

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const resolvedRawUrl = (
  envApiUrl ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL)
).replace(/\/+$/, '');

const isValidHttpUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(resolvedRawUrl);
export const API_BASE_URL = isValidHttpUrl
  ? resolvedRawUrl.endsWith('/api')
    ? resolvedRawUrl
    : `${resolvedRawUrl}/api`
  : '';

export const API_CONFIG_STATUS = {
  isValid: Boolean(API_BASE_URL),
  envApiUrlPresent: Boolean(envApiUrl),
  apiBaseUrl: API_BASE_URL,
  platform: Capacitor.getPlatform(),
  isNative: Capacitor.isNativePlatform(),
};

const STATUS_FALLBACK_MESSAGES = {
  400: 'Invalid request. Please check your details and try again.',
  401: 'Session expired. Please login again.',
  403: 'You do not have permission to access this page.',
  404: 'Requested resource was not found.',
  422: 'Please check your input and try again.',
  500: 'Server error. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service is temporarily unavailable. Please try again later.',
};

const debugState = {
  ...API_CONFIG_STATUS,
  lastError: null,
  lastSuccess: null,
};

const recordDiagnostic = (entry, isError = true) => {
  const safeEntry = {
    category: entry.category,
    status: entry.status ?? null,
    method: (entry.method || 'GET').toUpperCase(),
    endpoint: entry.endpoint || '',
    apiBaseUrl: API_BASE_URL || '(missing)',
    isNative: API_CONFIG_STATUS.isNative,
    platform: API_CONFIG_STATUS.platform,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : null,
    message: entry.message || '',
    timestamp: new Date().toISOString(),
  };

  if (isError) {
    debugState.lastError = safeEntry;
  } else {
    debugState.lastSuccess = safeEntry;
  }

  if (typeof window !== 'undefined') {
    window.__ACADEMYFLOW_API_DEBUG__ = {
      ...debugState,
      getDiagnostics: () => ({ ...debugState }),
      testConnection: testApiConnection,
    };
  }
  return safeEntry;
};

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL) {
      const err = new Error('VITE_API_URL is missing or invalid.');
      err.apiDiagnostic = recordDiagnostic({
        category: 'API_URL_MISSING',
        method: config.method,
        endpoint: config.url,
        message: 'Production API URL is missing or invalid.',
      });
      return Promise.reject(err);
    }

    const token =
      localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const contentType = String(
      response.headers?.['content-type'] || response.headers?.['Content-Type'] || ''
    ).toLowerCase();

    if (
      response.config?.responseType !== 'blob' &&
      typeof response.data === 'string' &&
      (!contentType.includes('application/json') || response.data.trim().startsWith('<'))
    ) {
      const invalidJsonErr = new Error('Invalid non-JSON response from server.');
      invalidJsonErr.response = response;
      invalidJsonErr.apiDiagnostic = recordDiagnostic({
        category: 'INVALID_JSON',
        status: response.status,
        method: response.config?.method,
        endpoint: response.config?.url,
        message: 'Server returned HTML or non-JSON content instead of JSON.',
      });
      return Promise.reject(invalidJsonErr);
    }

    recordDiagnostic(
      {
        category: 'OK',
        status: response.status,
        method: response.config?.method,
        endpoint: response.config?.url,
        message: 'Request succeeded',
      },
      false
    );
    return response;
  },
  (error) => {
    if (error?.apiDiagnostic?.category === 'API_URL_MISSING') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const method = error.config?.method;
    const endpoint = error.config?.url;
    const isAuthPublicEndpoint = endpoint?.includes('/auth/login');

    if (!error.response) {
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        /timeout/i.test(error.message || '');
      const isOffline =
        typeof navigator !== 'undefined' && navigator.onLine === false;

      let category = 'NETWORK_FAILURE';
      let message =
        'Unable to reach the server. Please check your internet connection and try again.';

      if (isTimeout) {
        category = 'TIMEOUT';
        message =
          'Request timed out while waiting for the server. Please try again.';
      } else if (isOffline) {
        category = 'NETWORK_FAILURE';
        message =
          'No internet connection. Please check your internet connection and try again.';
      } else if (!API_CONFIG_STATUS.isNative) {
        category = 'CORS_OR_NETWORK_FAILURE';
        message =
          'Unable to reach the server (network error or blocked by CORS policy).';
      }

      error.apiDiagnostic = recordDiagnostic({
        category,
        method,
        endpoint,
        message,
      });
      return Promise.reject(error);
    }

    const contentType = String(
      error.response.headers?.['content-type'] ||
        error.response.headers?.['Content-Type'] ||
        ''
    ).toLowerCase();

    if (
      typeof error.response.data === 'string' &&
      !contentType.includes('application/json')
    ) {
      const isHtml = error.response.data.trim().startsWith('<');
      error.response.data = {};
      if (isHtml && status < 500) {
        error.apiDiagnostic = recordDiagnostic({
          category: 'INVALID_JSON',
          status,
          method,
          endpoint,
          message: 'Server returned an unexpected HTML response instead of JSON.',
        });
        return Promise.reject(error);
      }
    } else if (typeof error.response.data !== 'object' || error.response.data === null) {
      error.response.data = {};
    }

    if (status === 401 && !isAuthPublicEndpoint) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      error.response.data = {
        ...error.response.data,
        detail: STATUS_FALLBACK_MESSAGES[401],
      };
      if (window.location.pathname !== '/login') {
        window.dispatchEvent(
          new CustomEvent('academyflow:unauthorized', {
            detail: { message: STATUS_FALLBACK_MESSAGES[401] },
          })
        );
      }
    } else if (status === 422 && Array.isArray(error.response?.data?.errors)) {
      const firstMsg = error.response.data.errors[0]?.msg;
      if (firstMsg) {
        error.response.data.detail = firstMsg.replace(/^Value error,\s*/i, '');
      } else if (!error.response.data.detail) {
        error.response.data.detail = STATUS_FALLBACK_MESSAGES[422];
      }
    } else if (status >= 500) {
      error.response.data = {
        ...error.response.data,
        detail:
          STATUS_FALLBACK_MESSAGES[status] || STATUS_FALLBACK_MESSAGES[500],
      };
    } else if (status && STATUS_FALLBACK_MESSAGES[status] && !error.response?.data?.detail) {
      error.response.data = {
        ...error.response.data,
        detail: STATUS_FALLBACK_MESSAGES[status],
      };
    }

    const category = status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX';
    error.apiDiagnostic = recordDiagnostic({
      category,
      status,
      method,
      endpoint,
      message: error.response?.data?.detail || STATUS_FALLBACK_MESSAGES[status] || '',
    });

    return Promise.reject(error);
  }
);

export async function testApiConnection() {
  if (!API_BASE_URL) {
    return {
      ok: false,
      category: 'API_URL_MISSING',
      status: null,
      apiBaseUrl: '(missing)',
      latencyMs: 0,
      detail: 'VITE_API_URL is missing or invalid.',
    };
  }

  const startedAt = Date.now();
  try {
    const res = await api.get('/health', { timeout: 30000 });
    return {
      ok: true,
      category: 'OK',
      status: res.status,
      apiBaseUrl: API_BASE_URL,
      latencyMs: Date.now() - startedAt,
      detail: res.data?.status || 'healthy',
    };
  } catch (err) {
    const diag = err?.apiDiagnostic || {};
    let category = diag.category || 'NETWORK_FAILURE';

    if (category === 'CORS_OR_NETWORK_FAILURE' && typeof fetch === 'function') {
      try {
        await fetch(`${API_BASE_URL}/health`, { mode: 'no-cors' });
        category = 'CORS_FAILURE';
      } catch {
        category = 'NETWORK_FAILURE';
      }
    }

    return {
      ok: false,
      category,
      status: diag.status ?? err?.response?.status ?? null,
      apiBaseUrl: API_BASE_URL,
      latencyMs: Date.now() - startedAt,
      detail: diag.message || err?.message || 'Health check failed.',
    };
  }
}

export function getApiDiagnostics() {
  return { ...debugState };
}

if (typeof window !== 'undefined') {
  window.__ACADEMYFLOW_API_DEBUG__ = {
    ...debugState,
    getDiagnostics: getApiDiagnostics,
    testConnection: testApiConnection,
  };
}

export default api;
