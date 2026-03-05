
import React from 'react';
import { ShoppingBag, Star, Lock, Check } from 'lucide-react';
import { UserStats, ProfileDesign } from '../types';
import { DEFAULT_DESIGNS } from '../constants';
import { motion } from 'framer-motion';

interface ShopProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const Shop: React.FC<ShopProps> = ({ stats, setStats }) => {
  const buyDesign = (design: ProfileDesign) => {
    if (stats.points < design.price) return;
    if (stats.level < design.minLevel) return;
    
    setStats(prev => ({
      ...prev,
      points: prev.points - design.price,
      unlockedDesigns: [...(prev.unlockedDesigns || []), design.id]
    }));
  };

  const activateDesign = (id: string) => {
    setStats(prev => ({ ...prev, activeDesignId: id }));
  };

  const isUnlocked = (id: string) => stats.unlockedDesigns?.includes(id) || id === 'default';
  const isActive = (id: string) => stats.activeDesignId === id || (id === 'default' && !stats.activeDesignId);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-40 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
            <ShoppingBag className="text-indigo-500" size={40} />
            Design Shop
          </h2>
          <p className="text-slate-400 font-medium mt-2">Unlock exclusive profile card designs with your hard-earned points.</p>
        </div>
        <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={20} />
          <span className="text-2xl font-black text-white">{stats.points}</span>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEFAULT_DESIGNS.map((design) => (
          <motion.div 
            key={design.id}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`bg-[#111] rounded-[2.5rem] overflow-hidden border transition-all relative group ${
              isActive(design.id) ? 'border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]' : 'border-white/5'
            }`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                design.price > 2000 ? 'bg-amber-500 text-black' : 
                design.price > 1000 ? 'bg-indigo-500 text-white' : 
                'bg-slate-800 text-slate-400'
              }`}>
                {design.price > 2000 ? 'Legendary' : design.price > 1000 ? 'Epic' : 'Rare'}
              </span>
            </div>

            {/* Preview Area */}
            <div className={`h-48 ${design.style.bg} p-8 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag size={100} />
              </div>
              <motion.div 
                whileHover={{ rotate: -2, scale: 1.05 }}
                className={`w-full h-full ${design.style.cardBg} rounded-2xl border ${design.style.border} p-5 flex gap-4 shadow-2xl relative z-10`}
              >
                <div className="w-14 h-14 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="w-24 h-4 bg-white/20 rounded-full" />
                  <div className="w-full h-2.5 bg-white/10 rounded-full" />
                  <div className="w-3/4 h-2.5 bg-white/10 rounded-full" />
                </div>
              </motion.div>
            </div>

            {/* Info Area */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{design.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">By {design.author}</p>
                </div>
                {isActive(design.id) && (
                  <div className="bg-indigo-500 text-white p-1.5 rounded-full">
                    <Check size={14} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-lg font-black text-white">{design.price === 0 ? 'FREE' : `${design.price} PTS`}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Min Level</p>
                  <p className={`text-lg font-black ${stats.level >= design.minLevel ? 'text-emerald-500' : 'text-rose-500'}`}>
                    LVL {design.minLevel}
                  </p>
                </div>
              </div>

              {isUnlocked(design.id) ? (
                <button 
                  onClick={() => activateDesign(design.id)}
                  disabled={isActive(design.id)}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                    isActive(design.id) 
                      ? 'bg-white/5 text-white/20 cursor-default' 
                      : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  {isActive(design.id) ? 'Active' : 'Equip'}
                </button>
              ) : (
                <button 
                  onClick={() => buyDesign(design)}
                  disabled={stats.points < design.price || stats.level < design.minLevel}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    stats.points >= design.price && stats.level >= design.minLevel
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {stats.level < design.minLevel ? <Lock size={16} /> : null}
                  {stats.level < design.minLevel ? `Unlock at Lvl ${design.minLevel}` : 'Purchase'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
