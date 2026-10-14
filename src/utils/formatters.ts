export function formatCurrency(amount: number, symbol = 'PKR '): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;
  const rounded = Math.round(amount);
  return `${symbol}${rounded.toLocaleString('en-PK')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parts[2];
      return `${day} ${month} ${year}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length >= 2) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
    return `${month} ${parts[0]}`;
  }
  return monthStr;
}

export function formatMonthYearUrdu(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length >= 2) {
    const monthNamesUrdu = [
      'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
      'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
    ];
    const month = monthNamesUrdu[parseInt(parts[1], 10) - 1] || parts[1];
    return `${month} ${parts[0]}`;
  }
  return monthStr;
}

export function generateNextMemberId(existingIds: string[]): string {
  let maxNum = 0;
  for (const id of existingIds) {
    const match = id.match(/AFB-(\d+)/i) || id.match(/M-(\d+)/i) || id.match(/(\d+)/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `AFB-${String(nextNum).padStart(3, '0')}`;
}

export function generateReceiptNumber(year: number, count: number, prefix = 'AFB-REC'): string {
  const padded = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${padded}`;
}

export function amountToWordsUrdu(amount: number): string {
  if (amount === 0) return 'صفر روپے فقط';
  if (amount === 100) return 'ایک سو روپے فقط';
  if (amount === 200) return 'دو سو روپے فقط';
  if (amount === 300) return 'تین سو روپے فقط';
  if (amount === 400) return 'چار سو روپے فقط';
  if (amount === 500) return 'پانچ سو روپے فقط';
  if (amount === 600) return 'چھ سو روپے فقط';
  if (amount === 1000) return 'ایک ہزار روپے فقط';
  return `${Math.round(amount).toLocaleString('en-PK')} روپے فقط`;
}

export function amountToWordsEnglish(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';
  if (rounded === 100) return 'One Hundred Rupees Only';
  if (rounded === 200) return 'Two Hundred Rupees Only';
  if (rounded === 300) return 'Three Hundred Rupees Only';
  if (rounded === 400) return 'Four Hundred Rupees Only';
  if (rounded === 500) return 'Five Hundred Rupees Only';
  if (rounded === 600) return 'Six Hundred Rupees Only';
  if (rounded === 1000) return 'One Thousand Rupees Only';
  return `${rounded.toLocaleString('en-US')} Rupees Only`;
}
