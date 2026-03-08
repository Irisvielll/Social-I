
import React, { useState, useRef } from 'react';
import { Camera, User, Edit3, Globe, Instagram, Share2, Award, Star, Zap, Shield, Heart, X } from 'lucide-react';
import { UserStats } from '../types';
import { DEFAULT_DESIGNS } from '../constants';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onClose?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, setStats, onClose }) => {
  const activeDesign = stats.customDesigns?.find(d => d.id === stats.activeDesignId) || 
                       DEFAULT_DESIGNS.find(d => d.id === stats.activeDesignId) || 
                       DEFAULT_DESIGNS[0];

  const getStyle = (val: string, type: 'bg' | 'text' | 'border') => {
    if (!val) return {};
    if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb')) {
      if (type === 'bg') return { backgroundColor: val };
      if (type === 'text') return { color: val };
      if (type === 'border') return { borderColor: val };
    }
    return {};
  };

  const getClass = (val: string) => {
    if (!val) return '';
    if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb')) return '';
    return val;
  };

  const getAccentColor = (val: string) => {
    if (!val) return '';
    if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb')) return val;
    return '';
  };

  // Profile State
  const [profile, setProfile] = useState({
    name: stats.userName || (stats.aiName ? `${stats.aiName}'s Partner` : "New User"),
    email: "user@introvertup.com",
    bio: "Building my social confidence one step at a time.",
    website: "https://introvertup.com",
    instagram: "introvert_up",
    otherSocials: "@introvertup"
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStats(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setStats(prev => ({ ...prev, userName: profile.name }));
    setIsEditingProfile(false);
  };

  return (
    <div className={`${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-5xl'} mx-auto p-2 md:p-8 space-y-6 md:space-y-10 pb-40 font-sans relative`}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-[60] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-xl"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      {/* Trainer Card Style Profile */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={getStyle(activeDesign.style.bg, 'bg')}
        className={`relative group p-4 md:p-12 rounded-[2rem] md:rounded-[3rem] ${getClass(activeDesign.style.bg)} transition-colors duration-700 shadow-2xl`}
      >
        {/* The Card Container */}
        <div 
          style={{ 
            ...getStyle(activeDesign.style.cardBg, 'bg'), 
            ...getStyle(activeDesign.style.border, 'border') 
          }}
          className={`${getClass(activeDesign.style.cardBg)} ${getClass(activeDesign.style.border)} rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border flex flex-col ${stats.layoutMode === 'portrait' ? '' : 'md:flex-row'} min-h-[auto] md:min-h-[400px] transition-colors duration-700 relative ${stats.layoutMode === 'portrait' ? 'max-w-xl' : 'max-w-4xl'} mx-auto`}
        >
          {activeDesign.drawingData && (
            <img 
              src={activeDesign.drawingData} 
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" 
              alt="Custom Drawing"
            />
          )}
          {/* Holographic Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmer_5s_infinite_linear] z-30" />
          
          {/* Left Side: Large Profile Photo */}
          <div className={`w-full ${stats.layoutMode === 'portrait' ? '' : 'md:w-[40%]'} aspect-square md:aspect-auto relative overflow-hidden group/pic`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            {stats.profilePic ? (
              <img 
                src={stats.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/pic:scale-110" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-full h-full bg-[#222] flex items-center justify-center">
                <User size={80} className="text-white/10 md:w-[120px] md:h-[120px]" />
              </div>
            )}
            
            {/* Photo Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                  Rank B2
                </div>
                <div className="text-white/50 text-[9px] md:text-[10px] font-bold tracking-widest">
                  ID: 143514
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest"
              >
                <Camera size={12} className="md:w-3.5 md:h-3.5" /> Change Avatar
              </button>
              <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Right Side: Info Section */}
          <div className={`flex-1 p-6 ${stats.layoutMode === 'portrait' ? '' : 'md:p-12'} flex flex-col relative`}>
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 pointer-events-none">
              <Award size={120} className="md:w-[200px] md:h-[200px]" />
            </div>
            
            <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 md:gap-3">
                  <h1 
                    style={getStyle(activeDesign.style.text, 'text')}
                    className={`text-2xl md:text-5xl font-black ${getClass(activeDesign.style.text)} tracking-tighter uppercase italic break-words max-w-[150px] md:max-w-none`}
                  >
                    {stats.userName || "HEIYUU"}
                  </h1>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-1 md:p-2 text-white/30 hover:text-indigo-400 transition-colors">
                    <Edit3 size={18} className="md:w-6 md:h-6" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Online</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2 text-right">
                <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Team Rank</p>
                <p 
                  style={{ color: getAccentColor(activeDesign.style.accent) }}
                  className={`text-lg md:text-2xl font-black ${activeDesign.style.accent.replace('bg-', 'text-')} italic leading-none`}
                >
                  MASTER
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${stats.layoutMode === 'portrait' ? '' : 'sm:grid-cols-2'} gap-4 md:gap-8 mb-6 md:mb-10 relative z-10`}>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Club</p>
                  <p 
                    style={getStyle(activeDesign.style.text, 'text')}
                    className={`text-xs md:text-sm font-bold ${getClass(activeDesign.style.text)} opacity-80`}
                  >
                    Introvert Elite
                  </p>
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Rank / Trials Class</p>
                  <p 
                    style={getStyle(activeDesign.style.text, 'text')}
                    className={`text-xs md:text-sm font-bold ${getClass(activeDesign.style.text)} opacity-80`}
                  >
                    0 / Class 6
                  </p>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Career Support</p>
                  <div className="flex items-center gap-2">
                    <div 
                      style={getStyle(activeDesign.style.accent, 'bg')}
                      className={`w-5 h-5 md:w-6 md:h-6 ${getClass(activeDesign.style.accent)} opacity-20 rounded-md flex items-center justify-center`}
                    >
                      <Zap 
                        size={10} 
                        style={{ color: getAccentColor(activeDesign.style.accent) }}
                        className={activeDesign.style.accent.replace('bg-', 'text-')} 
                      />
                    </div>
                    <p 
                      style={getStyle(activeDesign.style.text, 'text')}
                      className={`text-xs md:text-sm font-bold ${getClass(activeDesign.style.text)} opacity-80`}
                    >
                      {stats.aiName || "Companion"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Social Mastery</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < 3 ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 md:pt-8 border-t border-white/5 relative z-10">
              <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 md:mb-3">Comment</p>
              <p 
                style={getStyle(activeDesign.style.text, 'text')}
                className={`text-xs md:text-sm ${getClass(activeDesign.style.text)} opacity-60 font-medium italic leading-relaxed`}
              >
                "{profile.bio}"
              </p>
            </div>

            {/* Social Links Bar */}
            <div className="mt-6 md:mt-8 flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Instagram size={14} className="md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{profile.instagram}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Share2 size={14} className="md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{profile.otherSocials}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer sm:ml-auto">
                <Globe size={14} className="md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">introvertup.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Overlay */}
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl rounded-[2.5rem] p-12 flex flex-col justify-center"
          >
            <div className="max-w-2xl mx-auto w-full space-y-8">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Edit Trainer Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Trainer Name</label>
                    <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Instagram</label>
                    <input value={profile.instagram} onChange={e => setProfile({...profile, instagram: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Other Socials</label>
                    <input value={profile.otherSocials} onChange={e => setProfile({...profile, otherSocials: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Trainer Comment</label>
                    <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={saveProfile} className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Save Changes</button>
                <button onClick={() => setIsEditingProfile(false)} className="px-10 py-5 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Victories", value: stats.completedCount, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Current Streak", value: stats.streak, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Trainer Level", value: stats.level, icon: Star, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Hearts Left", value: stats.hearts, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white dark:bg-[#111] p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm text-center group hover:border-indigo-500/50 transition-all relative overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-16 h-16 md:w-24 md:h-24 ${stat.bg} rounded-full blur-2xl md:blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <stat.icon className={`mx-auto mb-2 md:mb-4 ${stat.color} relative z-10 w-6 h-6 md:w-8 md:h-8`} />
            <p className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter relative z-10">{stat.value}</p>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default AdminDashboard;
