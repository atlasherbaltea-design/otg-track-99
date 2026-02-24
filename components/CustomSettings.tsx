
import React, { useState } from 'react';
import { AppConfig, ColumnConfig, CustomFieldDefinition } from '../types';
import { Palette, Image, Layout, ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Cpu, FileText, Truck, Mail, BellRing } from 'lucide-react';
import { generateId } from '../utils';

interface CustomSettingsProps {
  config: AppConfig;
  onUpdate: (newConfig: AppConfig) => void;
}

export const CustomSettings: React.FC<CustomSettingsProps> = ({ config, onUpdate }) => {
  const [newMachine, setNewMachine] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date'>('text');
  const [newEmail, setNewEmail] = useState('');

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', value: string) => {
    onUpdate({ ...config, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ ...config, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addMachine = () => {
    if (!newMachine || config.machines.includes(newMachine)) return;
    onUpdate({
      ...config,
      machines: [...config.machines, newMachine],
      machineColors: { ...config.machineColors, [newMachine]: '#94a3b8' }
    });
    setNewMachine('');
  };

  const removeMachine = (m: string) => {
    const { [m]: removed, ...rest } = config.machineColors;
    onUpdate({
      ...config,
      machines: config.machines.filter(item => item !== m),
      machineColors: rest
    });
  };

  const updateMachineColor = (m: string, color: string) => {
    onUpdate({
      ...config,
      machineColors: { ...config.machineColors, [m]: color }
    });
  };

  const addSupplier = () => {
    if (!newSupplier || config.suppliers.includes(newSupplier)) return;
    onUpdate({
      ...config,
      suppliers: [...config.suppliers, newSupplier.toUpperCase()]
    });
    setNewSupplier('');
  };

  const removeSupplier = (s: string) => {
    onUpdate({
      ...config,
      suppliers: config.suppliers.filter(item => item !== s)
    });
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@') || config.notificationEmails.includes(newEmail)) return;
    onUpdate({
      ...config,
      notificationEmails: [...config.notificationEmails, newEmail.toLowerCase()]
    });
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    onUpdate({
      ...config,
      notificationEmails: config.notificationEmails.filter(e => e !== email)
    });
  };

  const toggleEmailAlerts = () => {
    onUpdate({ ...config, enableEmailAlerts: !config.enableEmailAlerts });
  };

  const addCustomField = () => {
    if (!newFieldLabel) return;
    const fieldId = `custom_${generateId()}`;
    const newField: CustomFieldDefinition = { id: fieldId, label: newFieldLabel, type: newFieldType };
    const newCol: ColumnConfig = { id: fieldId, label: newFieldLabel, visible: true };
    
    onUpdate({
      ...config,
      customFieldDefinitions: [...config.customFieldDefinitions, newField],
      columnOrder: [...config.columnOrder, newCol]
    });
    setNewFieldLabel('');
  };

  const removeCustomField = (id: string) => {
    onUpdate({
      ...config,
      customFieldDefinitions: config.customFieldDefinitions.filter(f => f.id !== id),
      columnOrder: config.columnOrder.filter(c => c.id !== id)
    });
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.columnOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      onUpdate({ ...config, columnOrder: newOrder });
    }
  };

  const toggleColumn = (index: number) => {
    const newOrder = [...config.columnOrder];
    newOrder[index].visible = !newOrder[index].visible;
    onUpdate({ ...config, columnOrder: newOrder });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Visual Identity Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl"><Palette className="w-8 h-8" /></div>
          <div><h2 className="text-2xl font-black text-secondary dark:text-blue-200">Identité Visuelle</h2><p className="text-gray-500 dark:text-slate-400 font-medium">Couleurs et logo de l'interface.</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
              <span className="font-bold text-gray-700 dark:text-slate-200 text-sm">Couleur Primaire</span>
              <input type="color" value={config.primaryColor} onChange={(e) => handleColorChange('primaryColor', e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none" />
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
              <span className="font-bold text-gray-700 dark:text-slate-200 text-sm">Couleur Secondaire</span>
              <input type="color" value={config.secondaryColor} onChange={(e) => handleColorChange('secondaryColor', e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none" />
            </div>
          </div>
          <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center gap-4">
            <img src={config.logo} alt="Preview" className="h-12 object-contain" />
            <label className="cursor-pointer px-6 py-3 bg-secondary dark:bg-blue-600 text-white font-black rounded-xl text-xs hover:scale-105 transition-all flex items-center gap-2">
              <Image className="w-4 h-4" /> CHANGER LOGO
              <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Email Alert Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl"><Mail className="w-8 h-8" /></div>
            <div>
              <h2 className="text-2xl font-black text-secondary dark:text-blue-200">Alertes Emails</h2>
              <p className="text-gray-500 dark:text-slate-400 font-medium">Notifications automatiques lors d'un retard de production.</p>
            </div>
          </div>
          <button 
            onClick={toggleEmailAlerts}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-all ${config.enableEmailAlerts ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}
          >
            <BellRing className={`w-5 h-5 ${config.enableEmailAlerts ? 'animate-bounce' : ''}`} />
            {config.enableEmailAlerts ? 'ALERTES ACTIVES' : 'ALERTES DÉSACTIVÉES'}
          </button>
        </div>
        
        <div className={`space-y-6 transition-all ${!config.enableEmailAlerts ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex gap-4">
            <input 
              type="Email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
              placeholder="ADRESSE EMAIL DU DESTINATAIRE" 
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:border-primary outline-none transition-colors" 
            />
            <button onClick={addEmail} className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
              <Plus className="w-5 h-5" /> AJOUTER
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {config.notificationEmails.map(email => (
              <div key={email} className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 group transition-all">
                <span className="font-black text-blue-700 dark:text-blue-300 text-xs">{email}</span>
                <button onClick={() => removeEmail(email)} className="p-1 text-blue-300 dark:text-blue-900 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {config.notificationEmails.length === 0 && (
              <p className="text-xs text-slate-400 font-bold italic py-2">Aucun destinataire configuré. Ajoutez une adresse email pour activer les notifications.</p>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl"><Truck className="w-8 h-8" /></div>
          <div><h2 className="text-2xl font-black text-secondary dark:text-blue-200">Gestion des Fournisseurs</h2><p className="text-gray-500 dark:text-slate-400 font-medium">Configurez la liste des prestataires (Clichés & Formes).</p></div>
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              value={newSupplier} 
              onChange={(e) => setNewSupplier(e.target.value)} 
              placeholder="NOM DU NOUVEAU FOURNISSEUR" 
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:border-primary outline-none transition-colors" 
            />
            <button onClick={addSupplier} className="px-8 py-4 bg-amber-600 text-white font-black rounded-2xl shadow-lg shadow-amber-600/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-5 h-5" /> AJOUTER
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {config.suppliers.map(s => (
              <div key={s} className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-amber-200 dark:hover:border-amber-500 transition-all">
                <span className="font-black text-secondary dark:text-slate-200 text-xs">{s}</span>
                <button onClick={() => removeSupplier(s)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Machine Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Cpu className="w-8 h-8" /></div>
          <div><h2 className="text-2xl font-black text-secondary dark:text-blue-200">Gestion du Parc Machine</h2><p className="text-gray-500 dark:text-slate-400 font-medium">Ajoutez ou modifiez les postes de travail.</p></div>
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <input type="text" value={newMachine} onChange={(e) => setNewMachine(e.target.value.toUpperCase())} placeholder="NOM NOUVELLE MACHINE" className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:border-primary outline-none transition-colors" />
            <button onClick={addMachine} className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /> AJOUTER</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.machines.map(m => (
              <div key={m} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group transition-colors">
                <div className="flex items-center gap-4">
                  <input type="color" value={config.machineColors[m]} onChange={(e) => updateMachineColor(m, e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent" />
                  <span className="font-black text-secondary dark:text-slate-200 text-sm">{m}</span>
                </div>
                <button onClick={() => removeMachine(m)} className="p-2 text-red-300 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Fields Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl"><FileText className="w-8 h-8" /></div>
          <div><h2 className="text-2xl font-black text-secondary dark:text-blue-200">Champs Personnalisés</h2><p className="text-gray-500 dark:text-slate-400 font-medium">Ajoutez de nouveaux attributs aux dossiers de production.</p></div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} placeholder="LIBELLÉ DU CHAMP" className="px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold transition-colors" />
            <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)} className="px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold outline-none transition-colors">
              <option value="text">TEXTE</option>
              <option value="number">NOMBRE</option>
              <option value="date">DATE</option>
            </select>
            <button onClick={addCustomField} className="bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /> CRÉER CHAMP</button>
          </div>
          <div className="space-y-2">
            {config.customFieldDefinitions.map(f => (
              <div key={f.id} className="flex items-center justify-between p-4 bg-indigo-50/30 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase border border-indigo-100 dark:border-indigo-800">{f.type}</div>
                  <span className="font-black text-secondary dark:text-slate-200">{f.label}</span>
                </div>
                <button onClick={() => removeCustomField(f.id)} className="p-2 text-red-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Organization */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 text-secondary dark:text-blue-200 rounded-2xl"><Layout className="w-8 h-8" /></div>
          <div><h2 className="text-2xl font-black text-secondary dark:text-blue-200">Organisation du Tableau</h2><p className="text-gray-500 dark:text-slate-400 font-medium">Gérez l'ordre et la visibilité des colonnes.</p></div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {config.columnOrder.map((col, idx) => (
            <div key={col.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${col.visible ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-600 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveColumn(idx, 'down')} disabled={idx === config.columnOrder.length - 1} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-600 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 font-bold text-gray-800 dark:text-slate-200 text-sm">{col.label}</div>
              <button onClick={() => toggleColumn(idx)} className={`p-2 rounded-xl transition-colors ${col.visible ? 'text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40' : 'text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900'}`}>
                {col.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
