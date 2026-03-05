
import React, { useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { UserStats, ProfileDesign } from '../types';

interface CardDesignerProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const CardDesigner: React.FC<CardDesignerProps> = ({ stats, setStats }) => {
  const [designName, setDesignName] = useState("My Custom Design");
  const [colors, setColors] = useState({
    bg: '#050505',
    cardBg: '#1a1c23',
    accent: '#4f46e5',
    text: '#ffffff',
    border: '#ffffff10'
  });

  const saveDesign = () => {
    const newDesign: ProfileDesign = {
      id: `custom-${Date.now()}`,
      name: designName,
      author: stats.userName || "Trainer",
      price: 0,
      minLevel: stats.level,
      style: {
        bg: `bg-[${colors.bg}]`,
        border: `border-[${colors.border}]`,
        accent: `bg-[${colors.accent}]`,
        text: `text-[${colors.text}]`,
        cardBg: `bg-[${colors.cardBg}]`
      }
    };

    // In a real app, we'd send this to a server. 
    // For now, we'll just add it to the user's unlocked designs and set it as active.
    setStats(prev => ({
      ...prev,
      customDesigns: [...(prev.customDesigns || []), newDesign],
      unlockedDesigns: [...(prev.unlockedDesigns || []), newDesign.id],
      activeDesignId: newDesign.id
    }));
    
    alert("Design saved and equipped!");
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-40 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
            <Palette className="text-indigo-500" size={40} />
            Card Designer
          </h2>
          <p className="text-slate-400 font-medium mt-2">Create your own unique trainer card style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview Area */}
        <div className="space-y-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Live Preview</p>
          <div 
            style={{ backgroundColor: colors.bg }}
            className="rounded-[3rem] p-8 md:p-12 border border-white/5 min-h-[400px] flex items-center justify-center transition-colors duration-500"
          >
            <div 
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              className="w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border flex flex-col md:flex-row min-h-[250px] transition-colors duration-500"
            >
              <div className="w-full md:w-[40%] bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div style={{ backgroundColor: colors.accent }} className="px-2 py-0.5 text-[8px] font-black text-white rounded-full uppercase tracking-widest">
                    Rank B2
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <h3 style={{ color: colors.text }} className="text-2xl font-black uppercase italic tracking-tighter mb-1">
                  {stats.userName || "TRAINER"}
                </h3>
                <div className="flex items-center gap-1 mb-4">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-0.5">Level</p>
                    <p style={{ color: colors.text }} className="text-xs font-bold opacity-80">{stats.level}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-0.5">Points</p>
                    <p style={{ color: colors.text }} className="text-xs font-bold opacity-80">{stats.points}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <div style={{ backgroundColor: colors.accent }} className="w-4 h-4 rounded-full opacity-20" />
                    <div style={{ backgroundColor: colors.accent }} className="w-4 h-4 rounded-full opacity-40" />
                    <div style={{ backgroundColor: colors.accent }} className="w-4 h-4 rounded-full opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Area */}
        <div className="bg-[#111] rounded-[3rem] p-10 border border-white/5 space-y-10">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Design Name</label>
            <input 
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Background</label>
                <input type="color" value={colors.bg} onChange={(e) => setColors({...colors, bg: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Card Color</label>
                <input type="color" value={colors.cardBg} onChange={(e) => setColors({...colors, cardBg: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Accent Color</label>
                <input type="color" value={colors.accent} onChange={(e) => setColors({...colors, accent: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Text Color</label>
                <input type="color" value={colors.text} onChange={(e) => setColors({...colors, text: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={saveDesign}
              className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
            >
              <Save size={20} />
              Save & Equip Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDesigner;
