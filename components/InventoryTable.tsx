
import React, { useState, useMemo } from 'react';
import { InventoryItem, ItemStatus, ColumnConfig, AppConfig } from '../types';
import { calculateStatus, formatDate } from '../utils';
import { Search, Edit2, Trash2, Filter } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface InventoryTableProps {
  items: InventoryItem[];
  machineFilter: string | null;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  columnConfig: ColumnConfig[];
  config: AppConfig;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ items, machineFilter, onEdit, onDelete, columnConfig, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const t = TRANSLATIONS[config.language || 'fr'];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const status = calculateStatus(item);
      const searchStr = (item.client + item.reference + item.codeCliche + item.codeForme + item.element + item.machine).toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesMachine = !machineFilter || item.machine === machineFilter;
      return matchesSearch && matchesStatus && matchesMachine;
    });
  }, [items, searchTerm, statusFilter, machineFilter]);

  const DateCell = ({ cDate, fDate, hasC, hasF }: { cDate: string, fDate: string, hasC: boolean, hasF: boolean }) => (
    <div className="flex flex-col gap-1">
      {hasC && (
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-blue-400 w-3">C:</span>
          <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{formatDate(cDate)}</span>
        </div>
      )}
      {hasF && (
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-indigo-400 w-3">F:</span>
          <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{formatDate(fDate)}</span>
        </div>
      )}
      {!hasC && !hasF && <span className="text-slate-300 dark:text-slate-600">-</span>}
    </div>
  );

  const renderCell = (item: InventoryItem, columnId: string) => {
    const hasC = !!item.codeCliche;
    const hasF = !!item.codeForme;
    const customField = config.customFieldDefinitions.find(f => f.id === columnId);
    if (customField) {
        const val = item.customFields?.[columnId];
        if (!val) return <span className="text-slate-300 dark:text-slate-600 italic">-</span>;
        return <span className="font-bold text-slate-600 dark:text-slate-400">{customField.type === 'date' ? formatDate(val) : val}</span>;
    }

    switch (columnId) {
      case 'element': return <span className="font-black text-secondary dark:text-blue-200 truncate max-w-[200px] block">{item.element}</span>;
      case 'codes':
        return (
          <div className="flex flex-col gap-0.5">
            {item.codeCliche && <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800">CL: {item.codeCliche}</span>}
            {item.codeForme && <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">FR: {item.codeForme}</span>}
          </div>
        );
      case 'client':
        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-slate-100 leading-tight">{item.client}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase">{item.reference}</span>
          </div>
        );
      case 'machine':
        return (
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black text-white" style={{ backgroundColor: config.machineColors[item.machine] || '#94a3b8' }}>
            {item.machine}
          </span>
        );
      case 'supplier':
        return (
          <div className="flex flex-col gap-0.5 text-[9px] font-bold">
            {item.supplierCliche && <span className="text-blue-600 dark:text-blue-400">C: {item.supplierCliche}</span>}
            {item.supplierForme && <span className="text-indigo-600 dark:text-indigo-400">F: {item.supplierForme}</span>}
          </div>
        );
      case 'poses': return <span className="font-black text-gray-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{item.poses}</span>;
      case 'dateOrder': return <DateCell cDate={item.dateOrderCliche} fDate={item.dateOrderForme} hasC={hasC} hasF={hasF} />;
      case 'dateExpected': return <DateCell cDate={item.dateExpectedCliche} fDate={item.dateExpectedForme} hasC={hasC} hasF={hasF} />;
      case 'dateDelivery': return <DateCell cDate={item.dateDeliveryCliche} fDate={item.dateDeliveryForme} hasC={hasC} hasF={hasF} />;
      default: return null;
    }
  };

  const visibleColumns = columnConfig.filter(col => col.visible);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full animate-fade-in transition-colors">
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 w-4 h-4" />
          <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm focus:border-primary" />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-300 dark:text-slate-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase bg-white dark:bg-slate-800 dark:text-white cursor-pointer outline-none focus:border-primary transition-colors">
            <option value="all">{t.all_status}</option>
            <option value={ItemStatus.NotOrdered}>{t.status_not_ordered}</option>
            <option value={ItemStatus.Ordered}>{t.status_ordered}</option>
            <option value={ItemStatus.Received}>{t.status_received}</option>
            <option value={ItemStatus.Delayed}>{t.status_delayed}</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors">
              {visibleColumns.map(col => {
                let label = col.label;
                if (col.id === 'element') label = t.element;
                if (col.id === 'codes') label = `${t.cliche} / ${t.forme}`;
                if (col.id === 'client') label = `${t.client} & Réf`;
                if (col.id === 'machine') label = t.machine;
                if (col.id === 'supplier') label = `${t.supplier}(s)`;
                if (col.id === 'poses') label = t.poses;
                if (col.id === 'dateOrder') label = t.date_order;
                if (col.id === 'dateExpected') label = t.date_expected;
                if (col.id === 'dateDelivery') label = t.date_delivery;
                return <th key={col.id} className="px-6 py-5">{label}</th>;
              })}
              <th className="px-6 py-5 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-sm group">
                {visibleColumns.map(col => <td key={col.id} className="px-6 py-4">{renderCell(item, col.id)}</td>)}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2.5 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2.5 text-red-500 bg-white dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                  {config.language === 'fr' ? 'Aucun dossier trouvé' : 'No files found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
