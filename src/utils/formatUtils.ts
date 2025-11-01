/**
 * Format number with thousands separator for Vietnamese locale
 * Example: 1000000 → "1,000,000"
 */
export const formatNumber = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('vi-VN');
};

/**
 * Parse formatted number string to number
 * Example: "1,000,000" → 1000000
 */
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format input as user types (with thousands separator)
 * Example: User types "1000000" → Shows "1,000,000"
 */
export const handleNumberInput = (
  value: string,
  setter: (val: number) => void,
  displaySetter: (val: string) => void
) => {
  // Remove all formatting
  const cleaned = value.replace(/[^\d]/g, '');
  
  if (cleaned === '') {
    setter(0);
    displaySetter('');
    return;
  }
  
  // Parse to number
  const numValue = parseInt(cleaned, 10);
  setter(numValue);
  
  // Format for display
  displaySetter(formatNumber(numValue));
};

