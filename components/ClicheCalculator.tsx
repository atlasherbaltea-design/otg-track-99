
import React, { useState, useMemo } from 'react';
import { Ruler, Calculator, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { AppConfig } from '../types';
import { TRANSLATIONS } from '../constants';

interface ClicheCalculatorProps {
  config: AppConfig;
}

export const ClicheCalculator: React.FC<ClicheCalculatorProps> = ({ config }) => {
  const [laize, setLaize] = useState<number>(403);
  const [cope, setCope] = useState<number>(1325);
  const [quantity, setQuantity] = useState<number>(2);
  const [pricePerM2, setPricePerM2] = useState<number>(2900);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const t = TRANSLATIONS[config.language || 'fr'];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (laize < 100 || laize > 3000) newErrors.laize = config.language === 'fr' ? "La Laize doit être comprise entre 100 et 3000 mm." : "Width must be between 100 and 3000 mm.";
    if (cope < 100 || cope > 3000) newErrors.cope = config.language === 'fr' ? "La Coupe doit être comprise entre 100 et 3000 mm." : "Circumference must be between 100 and 3000 mm.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const results = useMemo(() => {
    const laizeM = laize / 1000;
    const copeM = cope / 1000;
    const areaPerPlate = laizeM * copeM;
    const totalArea = areaPerPlate * quantity;
    const totalCost = totalArea * pricePerM2;
    return { areaPerPlate: areaPerPlate.toFixed(4), totalArea: totalArea.toFixed(4), totalCost: Math.round(totalCost) };
  }, [laize, cope, quantity, pricePerM2]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="bg-secondary dark:bg-slate-950 p-8 text-white flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Calculator className="w-8 h-8" /></div>
            <div>
              <h2 className="text-2xl font-black">{t.calculator}</h2>
              <p className="text-blue-100 font-medium opacity-80 uppercase text-[10px] tracking-widest mt-1">{config.language === 'fr' ? "Outil d'estimation de production" : "Production estimation tool"}</p>
            </div>
          </div>
          <button onClick={() => { setLaize(403); setCope(1325); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-75"><RefreshCw className="w-6 h-6" /></button>
        </div>
        <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-xs font-black text-secondary dark:text-blue-400 uppercase tracking-widest border-b-2 border-slate-50 dark:border-slate-800 pb-4">{config.language === 'fr' ? "Paramètres d'entrée" : "Input Parameters"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">{t.width}</label>
                <div className="relative group">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary" />
                  <input type="number" value={laize} onChange={(e) => { setLaize(Number(e.target.value)); validate(); }} className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-lg ${errors.laize ? 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary dark:text-white'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">{t.circumference}</label>
                <div className="relative group">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary rotate-90" />
                  <input type="number" value={cope} onChange={(e) => { setCope(Number(e.target.value)); validate(); }} className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-lg ${errors.cope ? 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary dark:text-white'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">{t.quantity}</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none font-bold text-lg dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">{t.price_m2}</label>
                <input type="number" value={pricePerM2} onChange={(e) => setPricePerM2(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none font-bold text-lg dark:text-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-10 border-2 border-slate-100 dark:border-slate-800 space-y-10 shadow-inner">
               <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{t.results}</h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{config.language === 'fr' ? 'Surf. par plaque' : 'Area per plate'}</p>
                    <div className="text-2xl font-black text-secondary dark:text-blue-100">{results.areaPerPlate} <span className="text-sm text-slate-400">m²</span></div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{config.language === 'fr' ? 'Surface totale' : 'Total Area'}</p>
                    <div className="text-2xl font-black text-secondary dark:text-blue-100">{results.totalArea} <span className="text-sm text-slate-400">m²</span></div>
                  </div>
               </div>
               <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-10 border-2 border-primary/10 shadow-xl flex flex-col items-center group transition-all hover:scale-[1.02]">
                 <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">{t.cost_total}</p>
                 <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-secondary dark:text-white group-hover:text-primary transition-colors">{results.totalCost}</span>
                    <span className="text-xl font-black text-slate-300 dark:text-slate-600">MAD</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
