
import React, { useState, useMemo } from 'react';
import { OTGRepair, AppConfig } from '../types';
import { formatDate } from '../utils';
import { Search, Edit2, Trash2, Filter, Wrench, User, Calendar, AlertCircle, Hash } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface OTGRepairTableProps {
  repairs: OTGRepair[];
  onEdit: (repair: OTGRepair) => void;
  onDelete: (id: string) => void;
  config: AppConfig;
}

export const OTGRepairTable: React.FC<OTGRepairTableProps> = ({ repairs, onEdit, onDelete, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const t = TRANSLATIONS[config.language || 'fr'];

  const filteredRepairs = useMemo(() => {
    return repairs.filter(repair => {
      const searchStr = (repair.conducteur + repair.machine + repair.linkedCode + repair.problemDescription + (repair.supplier || '')).toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || repair.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [repairs, searchTerm, typeFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full animate-fade-in transition-colors">
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm focus:border-primary" 
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-300 dark:text-slate-500" />
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)} 
            className="px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase bg-white dark:bg-slate-800 dark:text-white cursor-pointer outline-none focus:border-primary transition-colors"
          >
            <option value="all">TOUS TYPES</option>
            <option value="A – CLICHÉ">A – CLICHÉ</option>
            <option value="B – FORME">B – FORME</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors">
              <th className="px-6 py-5">{t.type} & Code</th>
              <th className="px-6 py-5">{t.operator}</th>
              <th className="px-6 py-5">{t.machine}</th>
              <th className="px-6 py-5">{t.etat}</th>
              <th className="px-6 py-5">{t.repair_kind}</th>
              <th className="px-6 py-5">{t.supplier}</th>
              <th className="px-6 py-5">{t.declaration_date}</th>
              <th className="px-6 py-5">{t.repair_status}</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredRepairs.map(repair => (
              <tr key={repair.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-sm group">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] w-fit ${repair.type.includes('CLICHÉ') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'}`}>
                      {repair.type}
                    </span>
                    <span className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-400" /> {repair.linkedCode}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                   <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {repair.conducteur}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-black text-white" style={{ backgroundColor: config.machineColors[repair.machine] || '#94a3b8' }}>
                    {repair.machine}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className="font-bold text-slate-600 dark:text-slate-400">{repair.etat}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">
                   {repair.repairKind}
                </td>
                <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 italic">
                   {repair.supplier || '-'}
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(repair.declarationDate)}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${repair.status === 'Open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {repair.status === 'Open' ? 'OUVERT' : 'CLÔTURÉ'}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => onEdit(repair)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => onDelete(repair.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRepairs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                  Aucun enregistrement de réparation trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
