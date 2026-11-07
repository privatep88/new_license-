
import { RecordStatus } from './types';

export const formatCost = (cost: number) => new Intl.NumberFormat('en-US').format(cost || 0);

export const getStatusClass = (status: RecordStatus) => {
  switch (status) {
    case RecordStatus.Active:
      return 'bg-green-100 text-green-800 border border-green-200';
    case RecordStatus.SoonToExpire:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case RecordStatus.Expired:
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export const getStatusWeight = (status: string | RecordStatus | undefined | null): number => {
    if (!status) return 4;
    switch (status) {
        case RecordStatus.Expired: return 1;
        case RecordStatus.SoonToExpire: return 2;
        case RecordStatus.Active: return 3;
        default: return 4;
    }
};

export const calculateRemainingDays = (expiryDate: string | undefined): number | null => {
    if (!expiryDate) return null;
    
    // Create Date objects set to midnight local time to avoid timezone offsets causing +/- 1 day errors
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parts = expiryDate.split('-');
    if (parts.length !== 3) return null;
    
    // Parse input date: YYYY-MM-DD
    const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    if (isNaN(expiry.getTime())) return null;
    
    // Calculate difference in milliseconds
    const diffTime = expiry.getTime() - today.getTime();
    
    // Convert to days (Math.floor is safe here because we normalized to midnight)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateRemainingPeriod = (expiryDate: string | undefined): string => {
    const diffDays = calculateRemainingDays(expiryDate);

    if (diffDays === null) return '-';

    if (diffDays < 0) {
        return `منتهي منذ ${Math.abs(diffDays)} يوم`;
    }
    if (diffDays === 0) {
        return 'ينتهي اليوم';
    }
    return `${diffDays} يوم`;
};

export const getRemainingPeriodClass = (expiryDate: string | undefined): string => {
    const diffDays = calculateRemainingDays(expiryDate);
    
    if (diffDays === null) return '';

    if (diffDays < 0) {
        return 'text-red-600 font-bold';
    }
    if (diffDays <= 120) { // 4 months warning
        return 'text-yellow-600 font-bold';
    }
    return 'text-green-600 font-medium';
};
