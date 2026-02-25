
import { InventoryItem, User, AppConfig, ColumnConfig } from './types';

const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

// Updated Logo to a reliable direct direct link format
export const LOGO_BASE64 = "https://lh3.googleusercontent.com/d/1KWQvJ5QZhIhPYin1VvAFMtgkuJ7oGILl";

export const DEFAULT_USER_PHOTO = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

export const OTG_OPERATORS = [
  "HILALI", "MOHAMED", "REDA", "LAHCEN", "ABDERAHIM", 
  "RACHID", "SAMIR", "ADIL", "ANASS", "MERYEM", 
  "YOUSSEF", "SALMA"
];

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'RACHID ECHAHMANI',
  username: 'rachid',
  password: '1994@AZQSWX',
  photo: DEFAULT_USER_PHOTO,
  role: 'admin',
  permissions: {
    dashboard: true, inventory: true, calculator: true, otgRepairs: true, custom: true, admin: true,
  }
};

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'element', label: 'Élément', visible: true },
  { id: 'codes', label: 'Cliché / Forme', visible: true },
  { id: 'client', label: 'Client & Réf', visible: true },
  { id: 'machine', label: 'Machine', visible: true },
  { id: 'supplier', label: 'Fournisseur(s)', visible: true },
  { id: 'poses', label: 'Poses', visible: true },
  { id: 'dateOrder', label: 'Date Commande', visible: true },
  { id: 'dateExpected', label: 'Date Prévue', visible: true },
  { id: 'dateDelivery', label: 'Réception Réelle', visible: true },
];

export const DEFAULT_CONFIG: AppConfig = {
  primaryColor: '#009CDF',
  secondaryColor: '#002855',
  logo: LOGO_BASE64,
  columnOrder: DEFAULT_COLUMNS,
  machines: ['MACARBOX', 'ASAHI CELMACH', 'DRO', 'CHROMA HQP'],
  machineColors: {
    'MACARBOX': '#2563eb',
    'ASAHI CELMACH': '#059669',
    'DRO': '#d97706',
    'CHROMA HQP': '#7c3aed'
  },
  customFieldDefinitions: [],
  suppliers: ['LTE', 'GRABALFA', 'CHIMO', 'SANCHEZ', 'AMGM', 'MILLER'],
  theme: 'light',
  language: 'fr',
  enableEmailAlerts: true,
  notificationEmails: []
};

export const TRANSLATIONS = {
  fr: {
    dashboard: "Tableau de Bord",
    inventory: "Dossiers Production",
    calculator: "Calculateur Clichés",
    otg_repairs: "Réparations OTG",
    interface: "Interface",
    users: "Utilisateurs",
    settings: "Maintenance",
    logout: "Déconnexion",
    new_dossier: "Nouveau Dossier",
    new_repair: "Nouvelle Réparation",
    save: "Enregistrer",
    cancel: "Annuler",
    client: "Client",
    reference: "Référence",
    element: "Désignation Élément",
    machine: "Machine",
    poses: "Nombre de Poses",
    cliche: "Cliché",
    forme: "Forme",
    supplier: "Fournisseur",
    date_creation: "Date Création",
    date_order: "Date Commande",
    date_expected: "Date Prévue",
    date_delivery: "Réception Réelle",
    status_not_ordered: "Non Commandé",
    status_ordered: "En Commande",
    status_received: "Reçu",
    status_delayed: "En Retard",
    total_jobs: "Total Dossiers",
    delayed_items: "Articles en Retard",
    completed: "Terminé",
    search: "RECHERCHER...",
    all_status: "TOUS STATUTS",
    notes: "Notes & Instructions",
    non_conformity: "Non-Conformité (SAV)",
    obs_quality: "Observations & Qualité",
    auto_mode: "MODE AUTO",
    manual_mode: "MODE MANU",
    ai_insights: "INSIGHTS IA",
    export: "EXPORTER",
    import: "IMPORTER",
    danger_zone: "Zone de Danger",
    clear_data: "EFFACER TOUT",
    width: "Laize (mm)",
    circumference: "Coupe (mm)",
    quantity: "Quantité (Plaques)",
    price_m2: "Prix au m² (DH)",
    results: "Résultats de l'estimation",
    cost_total: "Coût Total Estimé",
    visual_identity: "Identité Visuelle",
    email_alerts: "Alertes Emails",
    operator: "Conducteur",
    type: "Type",
    etat: "État",
    repair_kind: "Type de Réparation",
    declaration_date: "Date Déclaration",
    repair_date: "Date Réparation",
    problem: "Problème",
    action: "Action Corrective",
    repair_status: "Statut OTG"
  },
  en: {
    dashboard: "Dashboard",
    inventory: "Production Files",
    calculator: "Stereo Calculator",
    otg_repairs: "OTG Repairs",
    interface: "Interface",
    users: "User Access",
    settings: "Maintenance",
    logout: "Logout",
    new_dossier: "New Dossier",
    new_repair: "New Repair",
    save: "Save",
    cancel: "Cancel",
    client: "Client",
    reference: "Reference",
    element: "Item Designation",
    machine: "Machine",
    poses: "Number of Ups",
    cliche: "Stereo (Cliche)",
    forme: "Die-Cut (Forme)",
    supplier: "Supplier",
    date_creation: "Creation Date",
    date_order: "Order Date",
    date_expected: "Expected Date",
    date_delivery: "Actual Delivery",
    status_not_ordered: "Not Ordered",
    status_ordered: "On Order",
    status_received: "Received",
    status_delayed: "Delayed",
    total_jobs: "Total Files",
    delayed_items: "Delayed Items",
    completed: "Completed",
    search: "SEARCH...",
    all_status: "ALL STATUSES",
    notes: "Notes & Instructions",
    non_conformity: "Non-Conformity (After-Sales)",
    obs_quality: "Observations & Quality",
    auto_mode: "AUTO MODE",
    manual_mode: "MANUAL MODE",
    ai_insights: "AI INSIGHTS",
    export: "EXPORT",
    import: "IMPORT",
    danger_zone: "Danger Zone",
    clear_data: "CLEAR ALL",
    width: "Width (mm)",
    circumference: "Cyl. Circumference (mm)",
    quantity: "Quantity (Plates)",
    price_m2: "Price per m² (DH)",
    results: "Estimation Results",
    cost_total: "Estimated Total Cost",
    visual_identity: "Visual Identity",
    email_alerts: "Email Alerts",
    operator: "Operator",
    type: "Type",
    etat: "Status State",
    repair_kind: "Repair Kind",
    declaration_date: "Decl. Date",
    repair_date: "Repair Date",
    problem: "Problem",
    action: "Corrective Action",
    repair_status: "Repair Status"
  }
};

export const MOCK_ITEMS: InventoryItem[] = [
  {
    id: '1',
    codeCliche: 'C-24-998',
    codeForme: 'F-24-102',
    machine: 'MACARBOX',
    reference: 'NEST-24-001',
    client: 'Nestlé',
    element: 'Etui 1kg Choco',
    supplierCliche: 'GRABALFA',
    supplierForme: 'SANCHEZ',
    poses: 4,
    dateCreation: daysFromNow(-10),
    
    dateCreationCliche: daysFromNow(-10),
    isOrderedCliche: true,
    dateOrderCliche: daysFromNow(-8),
    dateExpectedCliche: daysFromNow(-2),
    dateDeliveryCliche: '',

    dateCreationForme: daysFromNow(-10),
    isOrderedForme: true,
    dateOrderForme: daysFromNow(-8),
    dateExpectedForme: daysFromNow(-2),
    dateDeliveryForme: '',

    comments: 'Qualité standard',
    nonConformity: ''
  }
];
