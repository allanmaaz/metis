// ====================================================================
// METIS Financial & Data Formatting Utilities
// Indian Numbering System: Thousands, Lakhs, Crores
// ====================================================================

/**
 * Formats a number into Indian Rupee representation
 * Example:
 * 184200000 -> ₹18.42 Cr
 * 725000 -> ₹7.25 L
 * 50000 -> ₹50,000
 * 145 -> ₹145
 */
export function formatCurrency(
  value: number | string | null | undefined,
  compact: boolean = false
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '₹0';
  }

  const num = Number(value);
  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  if (compact) {
    if (absNum >= 10000000) {
      // 1 Crore = 1,00,00,000
      const cr = absNum / 10000000;
      return `${sign}₹${cr >= 100 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
    }
    if (absNum >= 100000) {
      // 1 Lakh = 1,00,000
      const lk = absNum / 100000;
      return `${sign}₹${lk >= 100 ? lk.toFixed(1) : lk.toFixed(2)} L`;
    }
  }

  // Exact Indian formatted currency
  return `${sign}₹${absNum.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: absNum % 1 === 0 ? 0 : 2,
  })}`;
}

/**
 * Compact wealth formatter for banners and headlines
 */
export function formatWealth(value: number | string | null | undefined): string {
  return formatCurrency(value, true);
}

/**
 * Standard Indian format for share quantities
 * Example: 100000 -> 1,00,000
 */
export function formatQuantity(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  const num = Number(value);
  return num.toLocaleString('en-IN');
}

/**
 * Formats a percentage change with sign and arrow
 * Example: 12.4 -> +12.4%
 */
export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00%';
  }
  const num = Number(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

/**
 * Formats relative time (e.g. "2 min ago", "Just now")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  return past.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/**
 * Formats timestamps into readable clock time (e.g. "10:04 AM")
 */
export function formatClockTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Normalizes participant name for lookup (removes extra spaces, lowercase)
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
