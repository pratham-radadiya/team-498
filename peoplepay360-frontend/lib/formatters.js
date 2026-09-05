export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return dateTimeString;
  }
}

export function formatWorkedHours(hours) {
  if (hours === null || hours === undefined || isNaN(hours)) return '0.0h';
  return `${Number(hours).toFixed(1)}h`;
}

export function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'running':
    case 'present':
    case 'approved':
    case 'paid':
    case 'validated':
      return 'badge-success';

    case 'pending':
    case 'draft':
      return 'badge-warning';

    case 'inactive':
    case 'expired':
    case 'absent':
    case 'refused':
      return 'badge-danger';

    default:
      return 'badge-info';
  }
}

export const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' },
];

export function formatDaysOrHours(value, unit = 'Days') {
  if (value === null || value === undefined || isNaN(value)) {
    return unit === 'Hours' ? '0.0h' : '0 days';
  }
  const num = Number(value);
  if (unit === 'Hours') {
    return `${num.toFixed(1)}h`;
  }
  return `${num} ${num === 1 ? 'day' : 'days'}`;
}

export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function sanitizeDateInput(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
    return parts.join('-');
  }
  return value;
}

