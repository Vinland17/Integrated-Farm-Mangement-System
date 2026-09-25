export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (val: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
  }).format(val);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatPercent = (val: number): string => {
  return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
};
