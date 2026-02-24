
import React, { useState, useEffect, useMemo } from 'react';
import { OTGRepair, AppConfig, OTGRepairType, OTGRepairStatus, OTGRepairKind, InventoryItem } from '../types';
import { generateId } from '../utils';
import { X, Save, Wrench, User, Cpu, AlertTriangle, FileText, Calendar, Truck, Hash, Search } from 'lucide-react';
import { TRANSLATIONS, OTG_OPERATORS } from '../constants';

interface OTGRepairFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (repair: OTGRepair) => void;
  config: AppConfig;
  items: InventoryItem[];
  initialData?: OTGRepair | null;
}

const getInitialFormData = (config: AppConfig, initialData?: OTGRepair | null): OTGRepair => {
  const today = new Date().toISOString().split('T')[0];
  
  if (initialData) return { ...initialData };

  return {
    id: generateId(),
    type: OTGRepairType.Cliche,
    linkedCode: '',
    conducteur: OTG_OPERATORS[0],
    machine: config.machines[0] || '',
    etat: OTGRepairStatus.Reparation,
    repairKind: OTGRepairKind.Int,
    supplier: '',
    declarationDate: today,
    repairDate: '',
    problemDescription: '',
    correctiveAction: '',
    status: 'Open'
  };
};

export const OTGRepairForm: React.FC<OTGRepairFormProps> = ({ isOpen, onClose, onSave, config, items, initialData }) => {
  const t = TRANSLATIONS[config.language || 'fr'];
  const [formData, setFormData] = useState<OTGRepair>(() => getInitialFormData(config, initialData));
  const [codeSearch, setCodeSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(config, initialData));
      setCodeSearch('');
    }
  }, [isOpen, initialData, config]);

  const availableCodes = useMemo(() => {
    const isClicheType = formData.type === OTGRepairType.Cliche;
    const codes = items
      .map(item => isClicheType ? item.codeCliche : item.codeForme)
      .filter(code => code && code.trim() !== '')
      .filter((v, i, a) => a.indexOf(v) === i); // Unique codes
    
    if (!codeSearch) return codes;
    return codes.filter(c => c.toLowerCase().includes(codeSearch.toLowerCase()));
  }, [items, formData.type, codeSearch]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const next = { ...prev, [name]: value };
        
        // If type changes, clear linked code
        if (name === 'type') {
            next.linkedCode = '';
        }

        // Auto-fill machine if linked code is selected and exists in inventory
        if (name === 'linkedCode' && value) {
            const foundItem = items.find(i => 
                (prev.type === OTGRepairType.Cliche && i.codeCliche === value) || 
                (prev.type === OTGRepairType.Forme && i.codeForme === value)
            );
            if (foundItem) {
                next.machine = foundItem.machine;
            }
        }
        
        return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.linkedCode) {
        alert(config.language === 'fr' ? 'Veuillez sélectionner un code outillage.' : 'Please select a tool code.');
        return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[95vh] border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl"><Wrench className="w-8 h-8 text-primary" /></div>
             <div>
                <h2 className="text-2xl font-black text-secondary dark:text-blue-200">
                    {initialData ? 'Modifier Réparation' : 'Nouvelle Réparation OTG'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Traçabilité technique des outillages</p>
             </div>
          </div>
          <button onClick={onClose} type="button" className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> INFOS OUTILLAGE</h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.type}</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                                {Object.values(OTGRepairType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> CODE OUTILLAGE</label>
                            <div className="relative group">
                                <input 
                                    required 
                                    type="text"
                                    name="linkedCode" 
                                    value={formData.linkedCode} 
                                    onChange={handleChange} 
                                    list="tool-codes-list"
                                    placeholder="Saisir ou sélectionner..."
                                    className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800 focus:border-primary outline-none transition-all"
                                />
                                <datalist id="tool-codes-list">
                                    {availableCodes.map(code => (
                                        <option key={code} value={code} />
                                    ))}
                                </datalist>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <p className="mt-1 text-[9px] font-bold text-slate-400 italic">Saisissez le code manuellement ou choisissez parmi les dossiers existants.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><User className="w-3.5 h-3.5" /> {t.operator}</label>
                        <select name="conducteur" value={formData.conducteur} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                            {OTG_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> {t.machine}</label>
                        <select name="machine" value={formData.machine} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                            {config.machines.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> ÉTAT & TYPE</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.etat}</label>
                        <select name="etat" value={formData.etat} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                            {Object.values(OTGRepairStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase">{t.repair_kind}</label>
                        <select name="repairKind" value={formData.repairKind} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800">
                            {Object.values(OTGRepairKind).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>

                    <div className={`transition-all ${formData.repairKind === OTGRepairKind.Ext ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> {t.supplier}</label>
                        <select 
                            required={formData.repairKind === OTGRepairKind.Ext} 
                            name="supplier" 
                            value={formData.supplier} 
                            onChange={handleChange} 
                            className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-black text-sm bg-white dark:bg-slate-800"
                        >
                            <option value="">-- SÉLECTIONNER FOURNISSEUR --</option>
                            {config.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {t.declaration_date}</label>
                        <input type="date" name="declarationDate" value={formData.declarationDate} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {t.repair_date}</label>
                        <input type="date" name="repairDate" value={formData.repairDate} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase">{t.repair_status}</label>
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setFormData(p => ({...p, status: 'Open'}))} 
                            className={`flex-1 p-3 rounded-xl border-2 font-black text-xs transition-all ${formData.status === 'Open' ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                            OUVERT
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setFormData(p => ({...p, status: 'Closed'}))} 
                            className={`flex-1 p-3 rounded-xl border-2 font-black text-xs transition-all ${formData.status === 'Closed' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                            CLÔTURÉ
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase">{t.problem}</label>
                    <textarea 
                        name="problemDescription" 
                        value={formData.problemDescription} 
                        onChange={handleChange} 
                        rows={2} 
                        className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm outline-none focus:border-primary resize-none" 
                        placeholder="Description de l'incident..." 
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase">{t.action}</label>
                    <textarea 
                        name="correctiveAction" 
                        value={formData.correctiveAction} 
                        onChange={handleChange} 
                        rows={2} 
                        className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold text-sm outline-none focus:border-primary resize-none" 
                        placeholder="Action prise..." 
                    />
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
