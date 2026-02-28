// Parse date string (YYYY-MM-DD) as local date, avoiding timezone shift
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Calculate days remaining from now to a date
export const getDaysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const dueDate = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format days remaining as a readable string (accepts optional translate function)
export const formatDaysRemaining = (days, t) => {
  if (days === null) return t ? t('no_date_set') : 'No date set';
  if (days === 0) return t ? t('due_today') : 'Due today';
  if (days > 0) return `${days} ${t ? t('days_remaining') : 'days remaining'}`;
  return `${Math.abs(days)} ${t ? t('days_overdue') : 'days overdue'}`;
};

// Format date as DD/MM/YYYY
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseLocalDate(dateInput) : dateInput;
  if (!date || isNaN(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
