
export enum ItemStatus {
  NotOrdered = 'Not Ordered',
  Ordered = 'Ordered',
  Received = 'Received',
  Delayed = 'Delayed',
}

export type Theme = 'light' | 'dark';
export type Language = 'fr' | 'en';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
}

export interface InventoryItem {
  id: string;
  codeCliche: string;
  codeForme: string;
  machine: string;
  reference: string;
  client: string;
  element: string;
  supplierCliche: string;
  supplierForme: string;
  poses: number;
  dateCreation: string; // Global creation
  
  // Cliché specific tracking
  dateCreationCliche: string;
  isOrderedCliche: boolean;
  dateOrderCliche: string;
  dateExpectedCliche: string;
  dateDeliveryCliche: string;

  // Forme specific tracking
  dateCreationForme: string;
  isOrderedForme: boolean;
  dateOrderForme: string;
  dateExpectedForme: string;
  dateDeliveryForme: string;

  comments: string;
  nonConformity: string;
  customFields?: Record<string, any>;
}

// OTG Repair Types
export enum OTGRepairType {
  Cliche = 'A – CLICHÉ',
  Forme = 'B – FORME',
}

export enum OTGRepairStatus {
  Reparation = 'Réparation',
  AbimeNouveau = 'Abîmé nouveau',
  Conception = 'Conception',
}

export enum OTGRepairKind {
  Ext = 'Réparation EXT',
  Int = 'Réparation INT',
}

export interface OTGRepair {
  id: string;
  type: OTGRepairType;
  linkedCode: string; // The specific code selected from inventory
  conducteur: string;
  machine: string;
  etat: OTGRepairStatus;
  repairKind: OTGRepairKind;
  supplier?: string;
  declarationDate: string;
  repairDate?: string;
  problemDescription: string;
  correctiveAction?: string;
  status: 'Open' | 'Closed';
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface UserPermissions {
  dashboard: boolean;
  inventory: boolean;
  calculator: boolean;
  otgRepairs: boolean; // New permission
  custom: boolean;
  admin: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  photo: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
}

export interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  columnOrder: ColumnConfig[];
  machines: string[];
  machineColors: Record<string, string>;
  customFieldDefinitions: CustomFieldDefinition[];
  suppliers: string[];
  theme: Theme;
  language: Language;
  // Email Notification Settings
  enableEmailAlerts: boolean;
  notificationEmails: string[];
}

export type SortField = keyof InventoryItem;
export type SortOrder = 'asc' | 'desc';
