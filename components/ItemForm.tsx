
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryItem, AppConfig } from '../types';
import { generateId } from '../utils';
import { X, Save, Layers, Copy, FileText, Settings2, Zap, ZapOff, MessageSquare, AlertOctagon } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: InventoryItem[]) => void;
  config: AppConfig;
  items: InventoryItem[];
  initialData?: InventoryItem | null;
}

const MACHINE_CODE_STRUCTURES: Record<string, {
  cliche: { prefix: string, suffix: string },
  forme: { prefix: string, suffix: string }
}> = {
  'MACARBOX': { cliche: { prefix: 'F', suffix: 'M' }, forme: { prefix: 'F', suffix: 'MR' } },
  'ASAHI CELMACH': { cliche: { prefix: 'F', suffix: 'AC' }, forme: { prefix: 'F', suffix: 'P' } },
  'DRO': { cliche: { prefix: 'F', suffix: 'D' }, forme: { prefix: 'F', suffix: 'R' } },
  'CHROMA HQP': { cliche: { prefix: 'F', suffix: 'CH' }, forme: { prefix: 'F', suffix: 'CC' } }
};

const getNextCode = (machine: string, type: 'cliche' | 'forme', items: InventoryItem[]) => {
  const struct = MACHINE_CODE_STRUCTURES[machine]?.[type];
  const prefix = struct?.prefix || (type === 'cliche' ? 'CL-' : 'FR-');
  const suffix = struct?.suffix || '';
  
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escapedPrefix}(\\d{5})${escapedSuffix}$`);
  
  let maxSeq = 0;
  items.forEach(item => {
    const code = type === 'cliche' ? item.codeCliche : item.codeForme;
    if (!code) return;
    const match = code.trim().match(regex);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  
  return `${prefix}${(maxSeq + 1).toString().padStart(5, '0')}${suffix}`;
};

const getInitialFormData = (config: AppConfig, items: InventoryItem[], initialData?: InventoryItem | null): InventoryItem => {
  const today = new Date().toISOString().split('T')[0];
  const defaultMachine = config.machines[0] || '';
  
  const emptyItem: InventoryItem = {
    id: generateId(),
    codeCliche: getNextCode(defaultMachine, 'cliche', items),
    codeForme: getNextCode(defaultMachine, 'forme', items),
    machine: defaultMachine,
    reference: '',
    client: '',
    element: '',
    supplierCliche: '',
    supplierForme: '',
    poses: 1,
    dateCreation: today,
    dateCreationCliche: today,
    isOrderedCliche: false,
    dateOrderCliche: '',
    dateExpectedCliche: '',
    dateDeliveryCliche: '',
    dateCreationForme: today,
    isOrderedForme: false,
    dateOrderForme: '',
    dateExpectedForme: '',
    dateDeliveryForme: '',
    comments: '',
    nonConformity: '',
    customFields: config.customFieldDefinitions.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {})
  };

  if (initialData) {
    return {
      ...emptyItem,
      ...initialData,
      customFields: {
        ...emptyItem.customFields,
        ...(initialData.customFields || {})
      }
    };
  }
  return emptyItem;
};

export const ItemForm: React.FC<ItemFormProps> = ({ isOpen, onClose, onSave, config, items, initialData }) => {
  const t = TRANSLATIONS[config.language || 'fr'];
  const [formData, setFormData] = useState<InventoryItem>(() => getInitialFormData(config, items, initialData));
  const [hasCliche, setHasCliche] = useState(true);
  const [hasForme, setHasForme] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(config, items, initialData));
      setHasCliche(initialData ? !!initialData.codeCliche : true);
      setHasForme(initialData ? !!initialData.codeForme : false);
      setIsAutoMode(!initialData);
    }
  }, [isOpen, initialData, config, items]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'poses' ? Math.max(1, parseInt(value) || 0) : value;
               
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'machine' && isAutoMode) {
        next.codeCliche = getNextCode(value as string, 'cliche', items);
        next.codeForme = getNextCode(value as string, 'forme', items);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItem: InventoryItem = {
        ...formData,
        codeCliche: hasCliche ? formData.codeCliche : '',
        codeForme: hasForme ? formData.codeForme : '',
        supplierCliche: hasCliche ? formData.supplierCliche : '',
        supplierForme: hasForme ? formData.supplierForme : '',
    };
    onSave([finalItem]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[95vh] border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-[2.5rem]">
          <div>
            <h2 className="text-2xl font-black text-secondary dark:text-blue-200">
                {initialData ? (config.language === 'fr' ? 'Modifier Dossier' : 'Edit Dossier') : (config.language === 'fr' ? 'Nouveau Dossier' : 'New Dossier')}
            </h2>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{config.language === 'fr' ? 'Suivi granulaire Cliché & Forme' : 'Granular Tracking'}</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                type="button"
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${isAutoMode ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
             >
                {isAutoMode ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                {isAutoMode ? t.auto_mode : t.manual_mode}
             </button>
             <button onClick={onClose} type="button" className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-12">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{config.language === 'fr' ? 'Composition du dossier' : 'Composition'}</label>
              <div className="flex gap-6 w-full max-w-lg">
                  <button type="button" onClick={() => setHasCliche(!hasCliche)} className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-4 transition-all ${hasCliche ? 'bg-white dark:bg-slate-800 border-primary text-primary shadow-lg scale-105' : 'opacity-40 border-slate-200'}`}>
                    <Layers className="w-8 h-8" /><span className="font-black text-lg">{t.cliche.toUpperCase()}</span>
                  </button>
                  <button type="button" onClick={() => setHasForme(!hasForme)} className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-4 transition-all ${hasForme ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 shadow-lg scale-105' : 'opacity-40 border-slate-200'}`}>
                    <Copy className="w-8 h-8" /><span className="font-black text-lg">{t.forme.toUpperCase()}</span>
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> {config.language === 'fr' ? 'Détails Article' : 'Article Details'}</h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.client}</label><input required name="client" value={formData.client} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" /></div>
                      <div><label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.reference}</label><input required name="reference" value={formData.reference} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" /></div>
                  </div>
                  <div><label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.element}</label><input required name="element" value={formData.element} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.machine}</label>
                          <select required name="machine" value={formData.machine} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                              {config.machines.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                      </div>
                      <div><label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.poses}</label><input type="number" min="1" name="poses" value={formData.poses} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" /></div>
                  </div>
              </div>
            </div>

            {config.customFieldDefinitions.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><Settings2 className="w-4 h-4"/> SPECIFICATIONS</h3>
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                        {config.customFieldDefinitions.map(f => (
                            <div key={f.id}>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">{f.label}</label>
                                <input 
                                  type={f.type} 
                                  value={formData.customFields?.[f.id] || ''} 
                                  onChange={(e) => setFormData(prev => ({...prev, customFields: {...prev.customFields, [f.id]: e.target.value}}))} 
                                  className="w-full rounded-xl border-2 border-white dark:border-slate-700 p-3 font-bold text-sm shadow-sm" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Cliché Section */}
            <div className={`space-y-4 transition-all ${!hasCliche ? 'opacity-30 pointer-events-none' : ''}`}>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 pb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> IDENTIFICATION {t.cliche}</h3>
                <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900 rounded-3xl space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] font-black text-blue-400 mb-1 uppercase">CODE {t.cliche}</label>
                            <input required={hasCliche} name="codeCliche" value={formData.codeCliche} onChange={handleChange} readOnly={isAutoMode} className={`w-full rounded-xl border-2 p-3 font-bold text-sm ${isAutoMode ? 'border-dashed border-primary bg-primary/5 text-primary' : 'bg-white'}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-blue-400 mb-1 uppercase">{t.supplier}</label>
                            <select required={hasCliche} name="supplierCliche" value={formData.supplierCliche} onChange={handleChange} className="w-full rounded-xl border-2 border-white dark:border-slate-800 p-3 font-bold text-sm bg-white dark:bg-slate-800">
                                <option value="">-- SELECTION --</option>
                                {config.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-blue-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[9px] font-black text-blue-400 mb-1 uppercase">{t.date_creation}</label><input type="date" name="dateCreationCliche" value={formData.dateCreationCliche} onChange={handleChange} className="w-full rounded-xl border-2 border-white dark:border-slate-800 p-2 font-bold text-xs" /></div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-3 cursor-pointer p-2 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 w-full">
                                    <input type="checkbox" checked={formData.isOrderedCliche} onChange={(e) => setFormData(prev => ({...prev, isOrderedCliche: e.target.checked}))} className="w-4 h-4 accent-blue-600" />
                                    <span className="font-black uppercase text-[9px] text-blue-700 dark:text-blue-300">COMMANDE</span>
                                </label>
                            </div>
                        </div>
                        {formData.isOrderedCliche && (
                            <div className="grid grid-cols-3 gap-3 animate-fade-in">
                                <div><label className="block text-[8px] font-black text-blue-400 mb-1 uppercase">ORDER</label><input type="date" name="dateOrderCliche" value={formData.dateOrderCliche} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                                <div><label className="block text-[8px] font-black text-blue-400 mb-1 uppercase">EST.</label><input type="date" name="dateExpectedCliche" value={formData.dateExpectedCliche} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                                <div><label className="block text-[8px] font-black text-blue-400 mb-1 uppercase">REC.</label><input type="date" name="dateDeliveryCliche" value={formData.dateDeliveryCliche} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Forme Section */}
            <div className={`space-y-4 transition-all ${!hasForme ? 'opacity-30 pointer-events-none' : ''}`}>
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100 pb-3 flex items-center gap-2"><Copy className="w-4 h-4"/> IDENTIFICATION {t.forme}</h3>
                <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900 rounded-3xl space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] font-black text-indigo-400 mb-1 uppercase">CODE {t.forme}</label>
                            <input required={hasForme} name="codeForme" value={formData.codeForme} onChange={handleChange} readOnly={isAutoMode} className={`w-full rounded-xl border-2 p-3 font-bold text-sm ${isAutoMode ? 'border-dashed border-indigo-500 bg-indigo-500/5 text-indigo-500' : 'bg-white'}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-indigo-400 mb-1 uppercase">{t.supplier}</label>
                            <select required={hasForme} name="supplierForme" value={formData.supplierForme} onChange={handleChange} className="w-full rounded-xl border-2 border-white dark:border-slate-800 p-3 font-bold text-sm bg-white dark:bg-slate-800">
                                <option value="">-- SELECTION --</option>
                                {config.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-indigo-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[9px] font-black text-indigo-400 mb-1 uppercase">{t.date_creation}</label><input type="date" name="dateCreationForme" value={formData.dateCreationForme} onChange={handleChange} className="w-full rounded-xl border-2 border-white dark:border-slate-800 p-2 font-bold text-xs" /></div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-3 cursor-pointer p-2 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 w-full">
                                    <input type="checkbox" checked={formData.isOrderedForme} onChange={(e) => setFormData(prev => ({...prev, isOrderedForme: e.target.checked}))} className="w-4 h-4 accent-indigo-600" />
                                    <span className="font-black uppercase text-[9px] text-indigo-700 dark:text-indigo-300">COMMANDE</span>
                                </label>
                            </div>
                        </div>
                        {formData.isOrderedForme && (
                            <div className="grid grid-cols-3 gap-3 animate-fade-in">
                                <div><label className="block text-[8px] font-black text-indigo-400 mb-1 uppercase">ORDER</label><input type="date" name="dateOrderForme" value={formData.dateOrderForme} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                                <div><label className="block text-[8px] font-black text-indigo-400 mb-1 uppercase">EST.</label><input type="date" name="dateExpectedForme" value={formData.dateExpectedForme} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                                <div><label className="block text-[8px] font-black text-indigo-400 mb-1 uppercase">REC.</label><input type="date" name="dateDeliveryForme" value={formData.dateDeliveryForme} onChange={handleChange} className="w-full rounded-lg border border-white dark:border-slate-800 p-1.5 font-bold text-[10px]" /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t.obs_quality}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.notes}</label>
                <textarea name="comments" value={formData.comments} onChange={handleChange} rows={4} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm outline-none focus:border-primary resize-none" placeholder="Instructions particulières..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest">{t.non_conformity}</label>
                <textarea name="nonConformity" value={formData.nonConformity} onChange={handleChange} rows={4} className="w-full rounded-2xl border-2 border-red-50 dark:border-red-950/20 p-4 font-bold text-sm outline-none focus:border-red-500 resize-none" placeholder="Description du défaut SAV..." />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-8 py-4 font-black text-slate-400 hover:text-red-500 transition-all">{t.cancel}</button>
            <button type="submit" className="flex items-center gap-3 px-12 py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all"><Save className="w-6 h-6" /> {t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
