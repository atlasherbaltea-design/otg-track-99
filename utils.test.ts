import { describe, it, expect } from 'vitest';
import { calculateStatus } from './utils';
import { ItemStatus, InventoryItem } from './types';

describe('calculateStatus', () => {
  // Fix: updated baseItem to include all required fields for asset tracking
  const baseItem: InventoryItem = {
    id: '1', 
    codeCliche: 'C1', 
    codeForme: '', 
    machine: 'M1', 
    reference: 'R1',
    client: 'Test', 
    element: 'E1', 
    supplierCliche: 'S1', 
    supplierForme: '', 
    poses: 1, 
    dateCreation: '2025-01-01',
    dateCreationCliche: '2025-01-01',
    isOrderedCliche: false,
    dateOrderCliche: '',
    dateExpectedCliche: '',
    dateDeliveryCliche: '',
    dateCreationForme: '2025-01-01',
    isOrderedForme: false,
    dateOrderForme: '',
    dateExpectedForme: '',
    dateDeliveryForme: '',
    comments: '', 
    nonConformity: ''
  };

  it('should return NotOrdered when isOrderedCliche is false', () => {
    // Fix: use isOrderedCliche as per defined schema
    expect(calculateStatus(baseItem)).toBe(ItemStatus.NotOrdered);
  });

  it('should return Received when dateDeliveryCliche is present', () => {
    // Fix: use isOrderedCliche and dateDeliveryCliche instead of generic non-existent fields
    const item = { ...baseItem, isOrderedCliche: true, dateDeliveryCliche: '2025-01-05' };
    expect(calculateStatus(item)).toBe(ItemStatus.Received);
  });

  it('should return Delayed if today is past expected date and not received', () => {
    // Fix: use isOrderedCliche and dateExpectedCliche instead of generic non-existent fields
    const pastDate = '2020-01-01';
    const item = { ...baseItem, isOrderedCliche: true, dateExpectedCliche: pastDate };
    expect(calculateStatus(item)).toBe(ItemStatus.Delayed);
  });
});