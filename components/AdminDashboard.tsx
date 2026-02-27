
import React, { useState } from 'react';
import { Mail, Camera, User, Edit3, Globe, Github, Twitter } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Profile State
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@introvertup.com",
    bio: "Building the world's best social confidence tool.",
    website: "https://introvertup.com",
    github: "introvert-up",
    twitter: "@introvertup"
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12 pb-32">
      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/10 dark:bg-indigo-600/5" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mb-10">
          <div className="relative group">
            <div className="w-32 h-32 bg-white dark:bg-slate-700 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
              <User size={64} className="text-slate-200 dark:text-slate-600" />
            </div>
            <button className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Edit3 size={18} />
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-justify">{profile.bio}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Mail size={14} /> {profile.email}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Globe size={14} /> {profile.website.replace('https://', '')}
              </div>
            </div>
          </div>
        </div>

        {isEditingProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={2} className="w-full bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700 resize-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Website</label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  <Globe size={14} className="text-slate-400" />
                  <input value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} className="flex-1 bg-transparent text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Twitter</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Twitter size={14} className="text-slate-400" />
                    <input value={profile.twitter} onChange={e => setProfile({...profile, twitter: e.target.value})} className="flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">GitHub</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Github size={14} className="text-slate-400" />
                    <input value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} className="flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Save Profile</button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Personal Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-2xl font-black text-indigo-600">12</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Friends</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-2xl font-black text-emerald-600">45</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quests</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-2xl font-black text-amber-600">7</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-2xl font-black text-rose-600">Lvl 5</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
