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

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (!error.response) {
    return 'Network error. Please check your connection and make sure the backend server is running.';
  }
  const data = error.response?.data;
  if (typeof data?.detail === 'string') {
    return data.detail.replace(/^Value error,\s*/i, '');
  }
  if (typeof data?.message === 'string') {
    return data.message;
  }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return (data.errors[0]?.msg || fallback).replace(/^Value error,\s*/i, '');
  }
  return error.message || fallback;
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
