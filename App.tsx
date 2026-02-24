
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, List, Plus, Settings, Menu, X, Download, Upload, Calculator, Palette, LogOut, Users as UsersIcon, Globe, Moon, Sun, Wrench, CheckCircle2, FileDown, FileUp, AlertCircle } from 'lucide-react';
import { InventoryItem, ItemStatus, AppConfig, User, OTGRepair, OTGRepairType, OTGRepairStatus, OTGRepairKind } from './types';
import { MOCK_ITEMS, DEFAULT_CONFIG, INITIAL_ADMIN, TRANSLATIONS, LOGO_BASE64 } from './constants';
import { Dashboard } from './components/Dashboard';
import { InventoryTable } from './components/InventoryTable';
import { ItemForm } from './components/ItemForm';
import { ClicheCalculator } from './components/ClicheCalculator';
import { CustomSettings } from './components/CustomSettings';
import { UserManagement } from './components/UserManagement';
import { OTGRepairTable } from './components/OTGRepairTable';
import { OTGRepairForm } from './components/OTGRepairForm';
import { GoogleGenAI } from '@google/genai';
import { calculateStatus, generateId } from './utils';
import * as XLSX from 'xlsx';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-black uppercase tracking-tight ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
    {label}
  </button>
);

const STORAGE_KEY = 'otgtrack_inventory_v1';
const REPAIRS_STORAGE_KEY = 'otgtrack_repairs_v1';
const CONFIG_KEY = 'otgtrack_config_v1';
const USERS_KEY = 'otgtrack_users_v1';
const CURRENT_USER_KEY = 'otgtrack_active_user_v1';

const safeParse = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined") return defaultValue;
    const parsed = JSON.parse(saved);
    
    // Auto-update logo if it looks like an old or broken Google Drive link
    if (key === CONFIG_KEY && parsed && (parsed.logo?.includes('drive.google.com/uc') || !parsed.logo)) {
        parsed.logo = LOGO_BASE64;
    }
    
    return parsed;
  } catch (e) {
    console.error(`Error parsing storage for ${key}`, e);
    return defaultValue;
  }
};

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(() => safeParse(STORAGE_KEY, MOCK_ITEMS));
  const [repairs, setRepairs] = useState<OTGRepair[]>(() => safeParse(REPAIRS_STORAGE_KEY, []));
  const [config, setConfig] = useState<AppConfig>(() => safeParse(CONFIG_KEY, DEFAULT_CONFIG));
  const [users, setUsers] = useState<User[]>(() => safeParse(USERS_KEY, [INITIAL_ADMIN]));
  const [currentUser, setCurrentUser] = useState<User | null>(() => safeParse(CURRENT_USER_KEY, null));

  const [view, setView] = useState<'dashboard' | 'inventory' | 'calculator' | 'settings' | 'custom' | 'users' | 'otg_repairs'>('dashboard');
  const [machineFilter, setMachineFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingRepair, setEditingRepair] = useState<OTGRepair | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'error' | 'info' }>({ message: '', show: false, type: 'info' });
  
  const fileProdInputRef = useRef<HTMLInputElement>(null);
  const fileRepairsInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[config.language || 'fr'];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(REPAIRS_STORAGE_KEY, JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    if (config.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [config]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(CURRENT_USER_KEY);
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, show: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const analyzeWithGemini = async () => {
    const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
    if (!apiKey) {
      showToast("API Key missing", 'error');
      return;
    }
    setIsAnalyzing(true);
    try {
        const delayed = items.filter(i => calculateStatus(i) === ItemStatus.Delayed);
        const nonConform = items.filter(i => i.nonConformity && i.nonConformity.trim());
        const openRepairs = repairs.filter(r => r.status === 'Open');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Data: Total=${items.length}, Delays=${delayed.length}, SAV=${nonConform.length}, Open Repairs=${openRepairs.length}. Tasks: Provide 3 ultra-concise priority actions. Language: ${config.language === 'fr' ? 'French' : 'English'}.`,
            config: { systemInstruction: 'You are an Expert Production Manager.' }
        });
        showToast(response.text || "Analyse terminée", 'success');
    } catch (error) {
        showToast("Error analyzing data.", 'error');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const normalizeDate = (val: any) => {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'number') {
      const date = XLSX.SSF.parse_date_code(val);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    return String(val).trim();
  };

  const handleExportProductionExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const prodData = items.map(item => ({
        [t.element]: item.element,
        [t.client]: item.client,
        [t.reference]: item.reference,
        [t.machine]: item.machine,
        [t.cliche]: item.codeCliche,
        [t.forme]: item.codeForme,
        'Fournisseur Cliché': item.supplierCliche,
        'Fournisseur Forme': item.supplierForme,
        'Poses': item.poses,
        'Date Création': item.dateCreation,
        'Cliché Commandé': item.isOrderedCliche ? 'OUI' : 'NON',
        'Date Commande Cliché': item.dateOrderCliche,
        'Date Prévue Cliché': item.dateExpectedCliche,
        'Date Réception Cliché': item.dateDeliveryCliche,
        'Forme Commandée': item.isOrderedForme ? 'OUI' : 'NON',
        'Date Commande Forme': item.dateOrderForme,
        'Date Prévue Forme': item.dateExpectedForme,
        'Date Réception Forme': item.dateDeliveryForme,
        'Notes': item.comments,
        'SAV': item.nonConformity,
        'Statut Actuel': calculateStatus(item)
      }));
      const ws = XLSX.utils.json_to_sheet(prodData);
      XLSX.utils.book_append_sheet(wb, ws, "PRODUCTION");
      XLSX.writeFile(wb, `Production_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Export Production réussi", 'success');
    } catch (e) {
      showToast("Export failed", 'error');
    }
  };

  const handleExportRepairsExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const repairData = repairs.map(repair => ({
        'Type Outillage': repair.type,
        'Code Outillage': repair.linkedCode,
        'Conducteur': repair.conducteur,
        'Machine': repair.machine,
        'État Signalé': repair.etat,
        'Type Réparation': repair.repairKind,
        'Fournisseur': repair.supplier || '',
        'Date Déclaration': repair.declarationDate,
        'Date Réparation Effectuée': repair.repairDate || '',
        'Problème': repair.problemDescription,
        'Action Corrective': repair.correctiveAction || '',
        'Statut OTG': repair.status === 'Open' ? 'OUVERT' : 'CLÔTURÉ'
      }));
      const ws = XLSX.utils.json_to_sheet(repairData);
      XLSX.utils.book_append_sheet(wb, ws, "REPARATIONS_OTG");
      XLSX.writeFile(wb, `Reparations_OTG_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Export Réparations réussi", 'success');
    } catch (e) {
      showToast("Export failed", 'error');
    }
  };

  const handleImportProductionExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
          showToast("Fichier vide", 'error');
          return;
        }

        const imported: InventoryItem[] = data.map(row => ({
          id: generateId(),
          element: String(row[t.element] || row['Désignation Élément'] || row['element'] || '').trim(),
          client: String(row[t.client] || row['Client'] || '').trim(),
          reference: String(row[t.reference] || row['Référence'] || '').trim(),
          machine: String(row[t.machine] || row['Machine'] || config.machines[0]).trim(),
          codeCliche: String(row[t.cliche] || row['Cliché'] || '').trim(),
          codeForme: String(row[t.forme] || row['Forme'] || '').trim(),
          supplierCliche: String(row['Fournisseur Cliché'] || '').trim(),
          supplierForme: String(row['Fournisseur Forme'] || '').trim(),
          poses: parseInt(row['Poses']) || 1,
          dateCreation: normalizeDate(row['Date Création'] || row['dateCreation']),
          
          dateCreationCliche: normalizeDate(row['Date Création'] || row['dateCreation']),
          isOrderedCliche: String(row['Cliché Commandé']).toUpperCase() === 'OUI',
          dateOrderCliche: normalizeDate(row['Date Commande Cliché']),
          dateExpectedCliche: normalizeDate(row['Date Prévue Cliché']),
          dateDeliveryCliche: normalizeDate(row['Date Réception Cliché']),

          dateCreationForme: normalizeDate(row['Date Création'] || row['dateCreation']),
          isOrderedForme: String(row['Forme Commandée']).toUpperCase() === 'OUI',
          dateOrderForme: normalizeDate(row['Date Commande Forme']),
          dateExpectedForme: normalizeDate(row['Date Prévue Forme']),
          dateDeliveryForme: normalizeDate(row['Date Réception Forme']),

          comments: String(row['Notes'] || '').trim(),
          nonConformity: String(row['SAV'] || '').trim(),
          customFields: {}
        }));

        setItems(imported);
        showToast(`Importé ${imported.length} dossiers avec succès`, 'success');
      } catch (err) {
        showToast("Erreur lors de l'import Production", 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const handleImportRepairsExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
          showToast("Fichier vide", 'error');
          return;
        }

        const imported: OTGRepair[] = data.map(row => ({
          id: generateId(),
          type: String(row['Type Outillage']).includes('FORME') ? OTGRepairType.Forme : OTGRepairType.Cliche,
          linkedCode: String(row['Code Outillage'] || '').trim(),
          conducteur: String(row['Conducteur'] || 'Inconnu').trim(),
          machine: String(row['Machine'] || config.machines[0]).trim(),
          etat: (row['État Signalé'] as OTGRepairStatus) || OTGRepairStatus.Reparation,
          repairKind: String(row['Type Réparation']).includes('EXT') ? OTGRepairKind.Ext : OTGRepairKind.Int,
          supplier: String(row['Fournisseur'] || '').trim(),
          declarationDate: normalizeDate(row['Date Déclaration']),
          repairDate: normalizeDate(row['Date Réparation Effectuée']),
          problemDescription: String(row['Problème'] || '').trim(),
          correctiveAction: String(row['Action Corrective'] || '').trim(),
          status: String(row['Statut OTG']).toUpperCase().includes('CLÔTURÉ') ? 'Closed' : 'Open'
        }));

        setRepairs(prev => [...imported, ...prev].slice(0, 5000));
        showToast(`Importé ${imported.length} fiches de réparation`, 'success');
      } catch (err) {
        showToast("Erreur lors de l'import Réparations", 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) { setCurrentUser(user); setLoginError(''); }
    else { setLoginError(config.language === 'fr' ? 'Identifiants invalides' : 'Invalid credentials'); }
  };

  if (!currentUser) {
    return (
        <div className="fixed inset-0 bg-[#002855] dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-center border border-white/10">
                <div className="h-20 flex items-center justify-center mb-10 overflow-hidden">
                    <img src={config.logo} className="max-h-full max-w-full object-contain" alt="Logo" />
                </div>
                <h1 className="text-2xl font-black text-secondary dark:text-blue-100 mb-8 uppercase tracking-widest">OTG Track Login</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <input type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-primary transition-all dark:text-white" placeholder="Username" />
                    <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-primary transition-all dark:text-white" placeholder="••••••••" />
                    {loginError && <p className="text-red-500 text-xs font-black uppercase">{loginError}</p>}
                    <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">ACCÉDER</button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {toast.show && (
        <div className="fixed top-8 right-8 z-[100] animate-fade-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 ${toast.type === 'error' ? 'bg-red-600' : 'bg-secondary'} text-white`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <p className="text-sm font-black uppercase tracking-widest">{toast.message}</p>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex-1 flex flex-col">
          <div className="px-2 py-4 mb-10 shrink-0 h-20 flex items-center justify-center overflow-hidden">
            <img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain mx-auto" />
          </div>
          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {currentUser.permissions.dashboard && <SidebarItem icon={LayoutDashboard} label={t.dashboard} active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} />}
            {currentUser.permissions.inventory && <SidebarItem icon={List} label={t.inventory} active={view === 'inventory'} onClick={() => { setView('inventory'); setIsSidebarOpen(false); }} />}
            {currentUser.permissions.calculator && <SidebarItem icon={Calculator} label={t.calculator} active={view === 'calculator'} onClick={() => { setView('calculator'); setIsSidebarOpen(false); }} />}
            {currentUser.permissions.otgRepairs && <SidebarItem icon={Wrench} label={t.otg_repairs} active={view === 'otg_repairs'} onClick={() => { setView('otg_repairs'); setIsSidebarOpen(false); }} />}
            {currentUser.permissions.custom && <SidebarItem icon={Palette} label={t.interface} active={view === 'custom'} onClick={() => { setView('custom'); setIsSidebarOpen(false); }} />}
            {currentUser.permissions.admin && (
                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <SidebarItem icon={UsersIcon} label={t.users} active={view === 'users'} onClick={() => { setView('users'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={Settings} label={t.settings} active={view === 'settings'} onClick={() => { setView('settings'); setIsSidebarOpen(false); }} />
                </div>
            )}
          </nav>
          <div className="mt-auto pt-6">
             <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-4 border border-slate-100 dark:border-slate-700">
                <img src={currentUser.photo} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="Profile" />
                <div className="overflow-hidden">
                    <p className="text-xs font-black text-secondary dark:text-blue-100 truncate uppercase">{currentUser.name}</p>
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">{currentUser.role}</span>
                </div>
             </div>
             <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-xs font-black text-red-500 hover:bg-red-50 transition-all uppercase"><LogOut className="w-4 h-4" /> {t.logout}</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-24 flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 hover:bg-slate-50 rounded-2xl transition-colors"><Menu className="w-6 h-6 text-secondary dark:text-blue-200" /></button>
            <h2 className="text-xl font-black text-secondary dark:text-blue-100 uppercase tracking-tighter">
                {view === 'inventory' ? t.inventory : view === 'dashboard' ? t.dashboard : view === 'otg_repairs' ? t.otg_repairs : view === 'settings' ? t.settings : t.interface}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setConfig(p => ({...p, language: p.language === 'fr' ? 'en' : 'fr'}))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 font-black text-xs"><Globe className="w-5 h-5" /></button>
            <button onClick={() => setConfig(p => ({...p, theme: p.theme === 'light' ? 'dark' : 'light'}))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">{config.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}</button>
            {view === 'otg_repairs' ? (
                <button onClick={() => { setEditingRepair(null); setIsRepairModalOpen(true); }} className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /> <span className="hidden sm:inline">NOUVELLE RÉPARATION</span></button>
            ) : (
                <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /> <span className="hidden sm:inline">NOUVEAU DOSSIER</span></button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {view === 'dashboard' && <Dashboard items={items} repairs={repairs} onAnalyze={analyzeWithGemini} isAnalyzing={isAnalyzing} config={config} />}
            {view === 'inventory' && <InventoryTable items={items} machineFilter={machineFilter} onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))} columnConfig={config.columnOrder} config={config} />}
            {view === 'otg_repairs' && <OTGRepairTable repairs={repairs} onEdit={(repair) => { setEditingRepair(repair); setIsRepairModalOpen(true); }} onDelete={(id) => setRepairs(prev => prev.filter(r => r.id !== id))} config={config} />}
            {view === 'calculator' && <ClicheCalculator config={config} />}
            {view === 'custom' && <CustomSettings config={config} onUpdate={setConfig} />}
            {view === 'users' && <UserManagement users={users} onUpdateUsers={setUsers} currentUser={currentUser} config={config} />}
            {view === 'settings' && (
                <div className="max-w-5xl mx-auto space-y-16 animate-fade-in pb-20">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Gestion Dossiers Production</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button onClick={handleExportProductionExcel} className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-primary transition-all text-center flex flex-col items-center group shadow-sm">
                                <div className="p-4 bg-primary/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><Download className="w-8 h-8 text-primary" /></div>
                                <span className="font-black text-secondary dark:text-blue-100 text-xs tracking-widest uppercase">Télécharger Production</span>
                            </button>
                            <button onClick={() => fileProdInputRef.current?.click()} className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-green-500 transition-all text-center flex flex-col items-center group shadow-sm">
                                <div className="p-4 bg-green-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-green-500" /></div>
                                <span className="font-black text-secondary dark:text-blue-100 text-xs tracking-widest uppercase">Importer Production</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-4">Gestion Réparations OTG</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button onClick={handleExportRepairsExcel} className="p-10 bg-[#1e293b] dark:bg-slate-800 border-2 border-slate-700 rounded-[2.5rem] shadow-xl hover:border-amber-400 transition-all text-center flex flex-col items-center group">
                                <div className="p-5 bg-amber-400/10 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                                  <FileDown className="w-10 h-10 text-amber-400" />
                                </div>
                                <span className="font-black text-white text-sm tracking-widest uppercase">Télécharger Réparations (Export)</span>
                            </button>
                            <button onClick={() => fileRepairsInputRef.current?.click()} className="p-10 bg-[#0f172a] dark:bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] shadow-xl hover:border-amber-400 transition-all text-center flex flex-col items-center group">
                                <div className="p-5 bg-amber-400/20 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                                  <FileUp className="w-10 h-10 text-amber-400" />
                                </div>
                                <span className="font-black text-white text-sm tracking-widest uppercase">Insérer Réparations (Import)</span>
                            </button>
                        </div>
                    </div>
                    <input type="file" ref={fileProdInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportProductionExcel} />
                    <input type="file" ref={fileRepairsInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportRepairsExcel} />
                </div>
            )}
          </div>
        </div>
      </main>

      <ItemForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} config={config} items={items} onSave={(newItems) => { if (editingItem) setItems(prev => prev.map(i => i.id === editingItem.id ? newItems[0] : i)); else setItems(prev => [newItems[0], ...prev]); }} initialData={editingItem} />
      <OTGRepairForm isOpen={isRepairModalOpen} onClose={() => setIsRepairModalOpen(false)} config={config} items={items} onSave={(repair) => { if (editingRepair) setRepairs(prev => prev.map(r => r.id === editingRepair.id ? repair : r)); else setRepairs(prev => [repair, ...prev]); }} initialData={editingRepair} />
    </div>
  );
};

export default App;
