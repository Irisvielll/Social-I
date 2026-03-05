
import React, { useState, useRef } from 'react';
import { Camera, User, Edit3, Globe, Instagram, Share2, Award, Star, Zap } from 'lucide-react';
import { UserStats } from '../types';
import { DEFAULT_DESIGNS } from '../constants';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, setStats }) => {
  const activeDesign = stats.customDesigns?.find(d => d.id === stats.activeDesignId) || 
                       DEFAULT_DESIGNS.find(d => d.id === stats.activeDesignId) || 
                       DEFAULT_DESIGNS[0];

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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 pb-40 font-sans">
      {/* Trainer Card Style Profile */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group p-8 md:p-12 rounded-[3rem] ${activeDesign.style.bg} transition-colors duration-700`}
      >
        {/* The Card Container */}
        <div className={`${activeDesign.style.cardBg} rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border ${activeDesign.style.border} flex flex-col md:flex-row min-h-[400px] transition-colors duration-700 relative`}>
          {/* Holographic Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmer_5s_infinite_linear] z-30" />
          
          {/* Left Side: Large Profile Photo */}
          <div className="w-full md:w-[40%] relative overflow-hidden group/pic">
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
                <User size={120} className="text-white/10" />
              </div>
            )}
            
            {/* Photo Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                  Rank B2
                </div>
                <div className="text-white/50 text-[10px] font-bold tracking-widest">
                  ID: 143514
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <Camera size={14} /> Change Avatar
              </button>
              <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Right Side: Info Section */}
          <div className="flex-1 p-8 md:p-12 flex flex-col relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Award size={200} />
            </div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className={`text-4xl md:text-5xl font-black ${activeDesign.style.text} tracking-tighter uppercase italic`}>
                    {stats.userName || "HEIYUU"}
                  </h1>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-2 text-white/30 hover:text-indigo-400 transition-colors">
                    <Edit3 size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Online</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-right">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Team Rank</p>
                <p className={`text-2xl font-black ${activeDesign.style.accent.replace('bg-', 'text-')} italic leading-none`}>MASTER</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Club</p>
                  <p className={`text-sm font-bold ${activeDesign.style.text} opacity-80`}>Introvert Elite</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Rank / Trials Class</p>
                  <p className={`text-sm font-bold ${activeDesign.style.text} opacity-80`}>0 / Class 6</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Career Support</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${activeDesign.style.accent} opacity-20 rounded-md flex items-center justify-center`}>
                      <Zap size={12} className={activeDesign.style.accent.replace('bg-', 'text-')} />
                    </div>
                    <p className={`text-sm font-bold ${activeDesign.style.text} opacity-80`}>{stats.aiName || "Companion"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Social Mastery</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < 3 ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 relative z-10">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Comment</p>
              <p className={`text-sm ${activeDesign.style.text} opacity-60 font-medium italic leading-relaxed`}>
                "{profile.bio}"
              </p>
            </div>

            {/* Social Links Bar */}
            <div className="mt-8 flex gap-6">
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Instagram size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{profile.instagram}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Share2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{profile.otherSocials}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer ml-auto">
                <Globe size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">introvertup.com</span>
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
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Victories", value: stats.completedCount, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Current Streak", value: stats.streak, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Trainer Level", value: stats.level, icon: Star, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Hearts Left", value: stats.hearts, icon: Star, color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm text-center group hover:border-indigo-500/50 transition-all relative overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <stat.icon className={`mx-auto mb-4 ${stat.color} relative z-10`} size={32} />
            <p className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter relative z-10">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default AdminDashboard;
