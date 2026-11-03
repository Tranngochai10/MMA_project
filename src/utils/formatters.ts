export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const generateVoucherCode = (brandPrefix = 'VCHR'): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${brandPrefix.substring(0, 4).toUpperCase()}-${p1}-${p2}`;
};

export const generateOrderId = (): string => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${num}`;
};
