
import { InventoryItem, ItemStatus } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substring(2, 11);

const getStatusForAsset = (isOrdered: boolean, dateExpected: string, dateDelivery: string): ItemStatus => {
  if (!isOrdered) return ItemStatus.NotOrdered;
  if (dateDelivery && dateDelivery.trim() !== '') return ItemStatus.Received;
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (dateExpected && dateExpected < todayStr) return ItemStatus.Delayed;
  return ItemStatus.Ordered;
};

export const calculateStatus = (item: InventoryItem): ItemStatus => {
  const needsCliche = !!(item.codeCliche && item.codeCliche.trim());
  const needsForme = !!(item.codeForme && item.codeForme.trim());

  if (!needsCliche && !needsForme) return ItemStatus.NotOrdered;

  const clicheStatus = needsCliche 
    ? getStatusForAsset(item.isOrderedCliche, item.dateExpectedCliche, item.dateDeliveryCliche) 
    : ItemStatus.Received;
    
  const formeStatus = needsForme 
    ? getStatusForAsset(item.isOrderedForme, item.dateExpectedForme, item.dateDeliveryForme) 
    : ItemStatus.Received;

  // Priority: Delayed > Not Ordered > Ordered > Received
  if (clicheStatus === ItemStatus.Delayed || Array.from([clicheStatus, formeStatus]).includes(ItemStatus.Delayed)) {
    return ItemStatus.Delayed;
  }
  
  if (clicheStatus === ItemStatus.Received && formeStatus === ItemStatus.Received) {
    return ItemStatus.Received;
  }
  
  if (clicheStatus === ItemStatus.NotOrdered && formeStatus === ItemStatus.NotOrdered) {
    return ItemStatus.NotOrdered;
  }

  return ItemStatus.Ordered;
};

export const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  } catch (e) {
    return dateString;
  }
};

export const getStatusColor = (status: ItemStatus) => {
  switch (status) {
    case ItemStatus.NotOrdered:
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700';
    case ItemStatus.Ordered:
      return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case ItemStatus.Received:
      return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case ItemStatus.Delayed:
      return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400';
  }
};
