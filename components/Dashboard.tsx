
import React, { useState, useMemo } from 'react';
import { InventoryItem, ItemStatus, AppConfig, OTGRepair } from '../types';
import { StatsCard } from './StatsCard';
import { Package, AlertTriangle, CheckCircle, Bell, Filter, Truck, Activity, Clock, Wrench, Settings, ArrowRight, Zap, Target, BarChart3, TrendingUp, Users, Construction, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateStatus, formatDate } from '../utils';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  items: InventoryItem[];
  repairs: OTGRepair[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
  config: AppConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ items, repairs, onAnalyze, isAnalyzing, config }) => {
  const isDark = config.theme === 'dark';
  const t = TRANSLATIONS[config.language || 'fr'];

  const [selectedMachine, setSelectedMachine] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesMachine = selectedMachine === 'all' || item.machine === selectedMachine;
      return matchesMachine;
    });
  }, [items, selectedMachine]);

  const filteredRepairs = useMemo(() => {
      return repairs.filter(repair => {
          const matchesMachine = selectedMachine === 'all' || repair.machine === selectedMachine;
          return matchesMachine;
      });
  }, [repairs, selectedMachine]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const delayedItems = filteredItems.filter(i => calculateStatus(i) === ItemStatus.Delayed);
    const delayed = delayedItems.length;
    const received = filteredItems.filter(i => calculateStatus(i) === ItemStatus.Received).length;
    const ordered = filteredItems.filter(i => calculateStatus(i) === ItemStatus.Ordered).length;
    const delayRate = total > 0 ? Math.round((delayed / total) * 100) : 0;

    return { total, delayed, received, ordered, delayedItems, delayRate };
  }, [filteredItems]);

  const repairStats = useMemo(() => {
      const total = filteredRepairs.length;
      const openRepairsList = filteredRepairs.filter(r => r.status === 'Open');
      const open = openRepairsList.length;
      const closed = filteredRepairs.filter(r => r.status === 'Closed').length;
      const successRate = total > 0 ? Math.round((closed / total) * 100) : 0;
      
      const operatorsMap: Record<string, number> = {};
      filteredRepairs.forEach(r => {
          if (r.conducteur) {
            operatorsMap[r.conducteur] = (operatorsMap[r.conducteur] || 0) + 1;
          }
      });
      const operatorData = Object.entries(operatorsMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

      const now = new Date();
      const agingData = { fresh: 0, medium: 0, old: 0 };
      openRepairsList.forEach(r => {
          const declDate = new Date(r.declarationDate);
          if (isNaN(declDate.getTime())) return;
          const diffDays = Math.floor((now.getTime() - declDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays < 3) agingData.fresh++;
          else if (diffDays <= 7) agingData.medium++;
          else agingData.old++;
      });

      return { total, open, closed, successRate, operatorData, agingData, openRepairs: openRepairsList };
  }, [filteredRepairs]);

  const supplierAnalytics = useMemo(() => {
    return (config.suppliers || []).map(sup => {
      const supItems = items.filter(i => i.supplierCliche === sup || i.supplierForme === sup);
      const total = supItems.length;
      const delayed = supItems.filter(i => calculateStatus(i) === ItemStatus.Delayed).length;
      const received = supItems.filter(i => calculateStatus(i) === ItemStatus.Received).length;
      const sav = supItems.filter(i => i.nonConformity && i.nonConformity.trim()).length;
      
      const onTimeRate = total > 0 ? Math.round(((received - delayed) / total) * 100) : 100;
      const qualityRate = total > 0 ? Math.round(((total - sav) / total) * 100) : 100;

      return { name: sup, total, delayed, received, sav, onTimeRate, qualityRate };
    }).sort((a, b) => b.total - a.total);
  }, [items, config.suppliers]);

  const machineData = useMemo(() => {
    return (config.machines || []).map(m => {
      const machineItems = filteredItems.filter(i => i.machine === m);
      const machineRepairs = filteredRepairs.filter(r => r.machine === m && r.status === 'Open');
      return {
        name: m,
        Recu: machineItems.filter(i => calculateStatus(i) === ItemStatus.Received).length,
        Retard: machineItems.filter(i => calculateStatus(i) === ItemStatus.Delayed).length,
        OTG: machineRepairs.length
      };
    }).filter(d => (d.Recu + d.Retard + d.OTG) > 0);
  }, [filteredItems, filteredRepairs, config.machines]);

  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Strategy Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-secondary dark:text-white uppercase tracking-tight">{t.dashboard}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analyse de performance en temps réel</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={selectedMachine} 
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black uppercase outline-none cursor-pointer text-slate-600 dark:text-slate-200 w-full"
            >
              <option value="all">Filtre Machines</option>
              {config.machines.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button 
            onClick={onAnalyze} 
            disabled={isAnalyzing}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-secondary dark:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
            {isAnalyzing ? 'Analyse IA...' : t.ai_insights}
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatsCard title={t.total_jobs} value={stats.total} icon={Package} color="bg-slate-500" trend={{ value: '+12%', isUp: true }} />
        <StatsCard title={t.delayed_items} value={stats.delayed} icon={AlertTriangle} color="bg-red-500" description={`${stats.delayRate}% du flux`} />
        <StatsCard title={t.status_ordered} value={stats.ordered} icon={Clock} color="bg-blue-500" />
        <StatsCard title={t.completed} value={stats.received} icon={CheckCircle} color="bg-green-500" />
        <StatsCard title="OTG TOTAL" value={repairStats.total} icon={Wrench} color="bg-indigo-600" />
        <StatsCard title="OTG OPEN" value={repairStats.open} icon={Settings} color="bg-amber-500" description={`${repairStats.successRate}% Résolus`} />
      </div>

      {/* Detailed OTG Repair Analysis Section */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div>
                <h3 className="text-sm font-black text-secondary dark:text-blue-100 uppercase tracking-widest flex items-center gap-3">
                    <Construction className="w-5 h-5 text-indigo-500" /> Maintenance Technique & Fiabilité OTG
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Diagnostic des pannes et performance des réparations</p>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Operator Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-8 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Bilan par Conducteur</p>
                  <div className="flex-1 min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={repairStats.operatorData} layout="vertical" margin={{ left: -10, right: 30 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 9, fontWeight: 900}} />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                              <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={14} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Status Aging */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-8 flex items-center gap-2"><History className="w-3.5 h-3.5" /> Vieillissement des OTG Ouverts</p>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase">Priorité Immédiate</span>
                            <span className="text-sm font-black text-green-500">{repairStats.agingData.fresh}</span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${repairStats.open > 0 ? (repairStats.agingData.fresh / repairStats.open) * 100 : 0}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase">Suivi Technique</span>
                            <span className="text-sm font-black text-amber-500">{repairStats.agingData.medium}</span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${repairStats.open > 0 ? (repairStats.agingData.medium / repairStats.open) * 100 : 0}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase">Retard Critique</span>
                            <span className="text-sm font-black text-red-500">{repairStats.agingData.old}</span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${repairStats.open > 0 ? (repairStats.agingData.old / repairStats.open) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                  </div>
              </div>

              {/* Critical Open Repairs List */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                      <p className="text-[10px] font-black text-red-500 uppercase flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> OTG en attente</p>
                  </div>
                  <div className="space-y-4">
                      {repairStats.openRepairs.slice(0, 3).map(repair => (
                          <div key={repair.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-red-500">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-black text-secondary dark:text-white uppercase">{repair.linkedCode}</span>
                                  <span className="text-[8px] font-bold text-slate-400">{formatDate(repair.declarationDate)}</span>
                              </div>
                              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate mb-2">{repair.problemDescription}</p>
                          </div>
                      ))}
                      {repairStats.openRepairs.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                             <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Aucun OTG en attente</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Supplier Performance Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-sm font-black text-secondary dark:text-blue-100 uppercase tracking-widest flex items-center gap-3">
                  <Truck className="w-5 h-5 text-amber-500" /> Analyse de Performance Fournisseurs
              </h3>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Supplier workload ranking chart */}
            <div className="xl:col-span-1 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-6 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Volume par Fournisseur</p>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={supplierAnalytics.slice(0, 5)} layout="vertical" margin={{ left: -10, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 9, fontWeight: 900}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                            <Bar dataKey="total" fill="#009CDF" radius={[0, 10, 10, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Individual Supplier Cards */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {supplierAnalytics.slice(0, 3).map(sup => (
                    <div key={sup.name} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all border-b-8 border-b-primary/10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"><Truck className="w-5 h-5 text-primary" /></div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${sup.onTimeRate > 80 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {sup.onTimeRate}% Ponctuel
                            </div>
                        </div>
                        <h4 className="text-lg font-black text-secondary dark:text-white uppercase mb-4 truncate">{sup.name}</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-400 uppercase">Commandes Actives</span>
                                <span className="text-secondary dark:text-blue-100 font-black">{sup.total}</span>
                            </div>
                            <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${sup.total > 0 ? (sup.received / sup.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Load Analysis Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-black text-secondary dark:text-blue-100 uppercase tracking-widest">Charge Opérationnelle par Machine</h3>
          </div>
          <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineData} barGap={12}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10, fontWeight: 900}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10}} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '24px', border: 'none', padding: '20px' }}
                      />
                      <Bar dataKey="Recu" fill="#22c55e" radius={[10, 10, 10, 10]} barSize={24} />
                      <Bar dataKey="Retard" fill="#ef4444" radius={[10, 10, 10, 10]} barSize={24} />
                      <Bar dataKey="OTG" fill="#f59e0b" radius={[10, 10, 10, 10]} barSize={24} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};
