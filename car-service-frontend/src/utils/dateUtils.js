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

// Format days remaining as a readable string
export const formatDaysRemaining = (days) => {
  if (days === null) return 'No date set';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day remaining';
  if (days > 1) return `${days} days remaining`;
  if (days === -1) return '1 day overdue';
  return `${Math.abs(days)} days overdue`;
};
