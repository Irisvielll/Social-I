
import React from 'react';
import { ShoppingBag, Star, Lock, Check } from 'lucide-react';
import { UserStats, ProfileDesign } from '../types';
import { DEFAULT_DESIGNS } from '../constants';
import { motion } from 'framer-motion';

interface ShopProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  setView: (view: any) => void;
}

const Shop: React.FC<ShopProps> = ({ stats, setStats, setView }) => {
  const buyDesign = (design: ProfileDesign) => {
    if (stats.points < design.price) return;
    if (stats.level < design.minLevel) return;
    
    setStats(prev => ({
      ...prev,
      points: prev.points - design.price,
      unlockedDesigns: [...(prev.unlockedDesigns || []), design.id]
    }));
  };

  const buyDesignWithCash = async (design: ProfileDesign) => {
    // Simulate payment
    const confirm = window.confirm(`Purchase ${design.name} for $5.00?`);
    if (confirm) {
      setStats(prev => ({
        ...prev,
        unlockedDesigns: [...(prev.unlockedDesigns || []), design.id]
      }));
      alert(`${design.name} unlocked!`);
    }
  };

  const activateDesign = (id: string) => {
    setStats(prev => ({ ...prev, activeDesignId: id }));
  };

  const isUnlocked = (id: string) => stats.unlockedDesigns?.includes(id) || id === 'default';
  const isActive = (id: string) => stats.activeDesignId === id || (id === 'default' && !stats.activeDesignId);

  return (
    <div className={`${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto p-4 md:p-8 space-y-8 md:space-y-12 pb-40 font-sans`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 md:gap-4">
            <ShoppingBag className="text-indigo-500 w-8 h-8 md:w-10 md:h-10" />
            Design Shop
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-md">Unlock exclusive profile card designs with your hard-earned points.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <button 
            onClick={() => stats.hasUnlockedDesigner ? setView('designer') : setView('settings')}
            className={`w-full md:w-auto px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
              stats.hasUnlockedDesigner 
                ? 'bg-white text-black hover:bg-indigo-500 hover:text-white' 
                : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30'
            }`}
          >
            {!stats.hasUnlockedDesigner && <Lock size={14} />}
            {stats.hasUnlockedDesigner ? 'Make your own design' : 'Unlock Designer ($5)'}
          </button>
          <div className="w-full md:w-auto bg-indigo-600/10 border border-indigo-500/20 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl flex items-center justify-center md:justify-end gap-3">
            <Star className="text-amber-400 fill-amber-400 w-4.5 h-4.5 md:w-5 md:h-5" size={18} />
            <span className="text-xl md:text-2xl font-black text-white">{stats.points}</span>
            <span className="text-[9px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Points</span>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.layoutMode === 'portrait' ? '' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4 md:gap-8`}>
        {[...DEFAULT_DESIGNS, ...(stats.customDesigns || [])].map((design) => (
          <motion.div 
            key={design.id}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`bg-[#111] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border transition-all relative group ${
              isActive(design.id) ? 'border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]' : 'border-white/5'
            }`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
              <span className={`text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-widest ${
                design.price > 2000 ? 'bg-amber-500 text-black' : 
                design.price > 1000 ? 'bg-indigo-500 text-white' : 
                'bg-slate-800 text-slate-400'
              }`}>
                {design.price > 2000 ? 'Legendary' : design.price > 1000 ? 'Epic' : 'Rare'}
              </span>
            </div>

            {/* Preview Area */}
            <div className={`h-32 md:h-48 ${design.style.bg} p-4 md:p-8 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag size={60} className="md:w-[100px] md:h-[100px]" />
              </div>
              <motion.div 
                whileHover={{ rotate: -2, scale: 1.05 }}
                className={`w-full h-full ${design.style.cardBg} rounded-xl md:rounded-2xl border ${design.style.border} p-3 md:p-5 flex gap-3 md:gap-4 shadow-2xl relative z-10`}
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-lg md:rounded-xl" />
                <div className="flex-1 space-y-2 md:space-y-3">
                  <div className="w-16 md:w-24 h-3 md:h-4 bg-white/20 rounded-full" />
                  <div className="w-full h-2 md:h-2.5 bg-white/10 rounded-full" />
                  <div className="w-3/4 h-2 md:h-2.5 bg-white/10 rounded-full" />
                </div>
              </motion.div>
            </div>

            {/* Info Area */}
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tight">{design.name}</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">By {design.author}</p>
                </div>
                {isActive(design.id) && (
                  <div className="bg-indigo-500 text-white p-1 md:p-1.5 rounded-full">
                    <Check size={12} className="md:w-3.5 md:h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex-1">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5 md:mb-1">Price</p>
                  <p className="text-base md:text-lg font-black text-white">{design.price === 0 ? 'FREE' : `${design.price} PTS`}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5 md:mb-1">Min Level</p>
                  <p className={`text-base md:text-lg font-black ${stats.level >= design.minLevel ? 'text-emerald-500' : 'text-rose-500'}`}>
                    LVL {design.minLevel}
                  </p>
                </div>
              </div>

              {isUnlocked(design.id) ? (
                <button 
                  onClick={() => activateDesign(design.id)}
                  disabled={isActive(design.id)}
                  className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] md:text-xs ${
                    isActive(design.id) 
                      ? 'bg-white/5 text-white/20 cursor-default' 
                      : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  {isActive(design.id) ? 'Active' : 'Equip'}
                </button>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  <button 
                    onClick={() => buyDesign(design)}
                    disabled={stats.points < design.price || stats.level < design.minLevel}
                    className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-[10px] md:text-xs ${
                      stats.points >= design.price && stats.level >= design.minLevel
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {stats.level < design.minLevel ? <Lock size={14} /> : null}
                    {stats.level < design.minLevel ? `Unlock at Lvl ${design.minLevel}` : `Buy with Points (${design.price})`}
                  </button>
                  
                  <button 
                    onClick={() => buyDesignWithCash(design)}
                    className="w-full py-2.5 bg-white/5 text-white/60 hover:bg-white/10 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                  >
                    Unlock Instantly for $5.00
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
