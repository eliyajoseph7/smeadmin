export const formatCurrency = (amount: number, currency: string = 'TZS'): string => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Basic phone number formatting for display
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  return `+${phoneNumber}`;
};
