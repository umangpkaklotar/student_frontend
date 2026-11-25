export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatClassLabel = (classType) => {
  if (!classType) return '—';
  const normalized = classType.toLowerCase();
  if (normalized === 'karate') return 'Karate';
  if (normalized === 'skating') return 'Skating';
  return classType;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatLongDate = (dateStr) => {
  if (!dateStr) return '—';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatMonthLabel = (monthStr) => {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-').map(Number);
  if (!year || !month) return monthStr;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const formatShortMonthLabel = (monthStr) => {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-').map(Number);
  if (!year || !month) return monthStr;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const getErrorDiagnosticText = (error) => {
  const diag = error?.apiDiagnostic;
  if (!diag?.category) return '';
  const statusPart = diag.status ? ` (${diag.status})` : '';
  const urlPart = diag.apiBaseUrl ? ` · ${diag.apiBaseUrl}` : '';
  return `${diag.category}${statusPart}${urlPart}`;
};

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;

  const category = error?.apiDiagnostic?.category;
  if (category === 'API_URL_MISSING') {
    return 'API URL is missing or invalid in app configuration.';
  }
  if (category === 'TIMEOUT') {
    return 'Server took too long to respond (timeout). Please try again.';
  }
  if (category === 'INVALID_JSON') {
    return 'Server returned an unexpected response format instead of JSON.';
  }
  if (category === 'CORS_FAILURE') {
    return 'Request blocked by backend CORS policy.';
  }
  if (category === 'CORS_OR_NETWORK_FAILURE') {
    return 'Unable to reach the backend server (network or CORS issue). Please try again.';
  }

  if (!error.response) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'No internet connection. Please check your internet connection and try again.';
    }
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 502 || status === 503) {
    return 'Server is temporarily unavailable. Please try again later.';
  }
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }
  if (status === 401) {
    return typeof data?.detail === 'string' && data.detail
      ? data.detail
      : 'Session expired. Please login again.';
  }
  if (status === 403) {
    return typeof data?.detail === 'string' && data.detail
      ? data.detail
      : 'You do not have permission to access this page.';
  }
  if (status === 404) {
    return typeof data?.detail === 'string' && data.detail
      ? data.detail
      : 'Requested resource was not found.';
  }

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail.replace(/^Value error,\s*/i, '');
  }
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return (data.errors[0]?.msg || fallback).replace(/^Value error,\s*/i, '');
  }
  return fallback;
};

export const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getCurrentMonthISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'present':
    case 'paid':
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
    case 'absent':
    case 'inactive':
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
    case 'partial':
      return 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20';
    case 'karate':
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20';
    case 'skating':
      return 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20';
  }
};

export const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];
