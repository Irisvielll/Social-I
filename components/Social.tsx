
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, Sword, Check, X, Camera, RefreshCw } from 'lucide-react';
import { Friend, SocialChallenge, UserStats } from '../types';
import Chat from './Chat';
import ChallengeFlow from './ChallengeFlow';

interface SocialProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  socket: any;
  myId: string;
  activeSocialChallenge: SocialChallenge | null;
  setActiveSocialChallenge: (c: SocialChallenge | null) => void;
  pendingSocialChallenge: SocialChallenge | null;
  setPendingSocialChallenge: (c: SocialChallenge | null) => void;
  isChallenging: string | null;
  setIsChallenging: (id: string | null) => void;
}

const Social: React.FC<SocialProps> = ({ 
  stats, 
  setStats, 
  socket, 
  myId,
  activeSocialChallenge,
  setActiveSocialChallenge,
  pendingSocialChallenge,
  setPendingSocialChallenge,
  isChallenging,
  setIsChallenging
}) => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: 'ai-friend', name: stats.aiName || "SocialAI", level: 99, isOnline: true },
    { id: 'user-2', name: 'SocialButterfly99', level: 15, isOnline: true },
    { id: 'user-3', name: 'QuietExplorer', level: 4, isOnline: false }
  ]);

  useEffect(() => {
    setFriends(prev => prev.map(f => f.id === 'ai-friend' ? { ...f, name: stats.aiName || "SocialAI" } : f));
    if (activeChat?.id === 'ai-friend') {
      setActiveChat(prev => prev ? { ...prev, name: stats.aiName || "SocialAI" } : null);
    }
  }, [stats.aiName]);
  const [publicUsers, setPublicUsers] = useState<Friend[]>([
    { id: 'user-4', name: 'CharismaKing', level: 22, isOnline: true },
    { id: 'user-5', name: 'NervousNellie', level: 2, isOnline: true }
  ]);
  const [activeChat, setActiveChat] = useState<Friend | null>({ id: 'ai-friend', name: stats.aiName || "SocialAI", level: 99, isOnline: true });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPublic = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const sendChallenge = (friend: Friend) => {
    setIsChallenging(friend.id);
    socket.emit("send_challenge", {
      fromId: myId,
      fromName: "You",
      toId: friend.id
    });
  };

  const acceptChallenge = () => {
    if (!pendingSocialChallenge) return;
    socket.emit("accept_challenge", pendingSocialChallenge.id);
  };

  const declineChallenge = () => {
    if (!pendingSocialChallenge) return;
    socket.emit("reject_challenge", pendingSocialChallenge.id);
    setPendingSocialChallenge(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 pb-32">
      <div className={`lg:col-span-1 space-y-6 ${activeChat ? 'hidden lg:block' : 'block'}`}>
        <section className="bg-[#0f1115] rounded-[2rem] p-5 shadow-2xl border border-white/5 h-[500px] lg:h-[650px] flex flex-col overflow-hidden">
          <h2 className="text-white font-black text-lg mb-4 text-center tracking-tighter uppercase italic">Your Circle</h2>
          
          <div className="flex-1 overflow-y-auto pr-1 valorant-scrollbar space-y-4">
            {friends.map(friend => (
              <div key={friend.id} className="bg-[#1a1c22] rounded-2xl p-4 border border-white/5 relative group transition-all hover:bg-[#1e2128]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-base font-black shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                      {friend.name[0]}
                    </div>
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="text-white font-black text-xs tracking-tight uppercase break-words leading-tight mb-1">{friend.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${friend.isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate">Lvl {friend.level} • {friend.isOnline ? 'Online' : 'Away'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setActiveChat(friend)}
                    className="flex items-center justify-center gap-2 p-2 bg-[#2a2d36] rounded-xl hover:bg-[#343844] transition-all group/btn border border-white/5 active:scale-[0.98]"
                  >
                    <MessageSquare size={12} className="text-blue-400" />
                    <span className="text-white font-black text-[8px] uppercase tracking-widest">Chat</span>
                  </button>
                  
                  <button 
                    onClick={() => sendChallenge(friend)}
                    disabled={!!isChallenging}
                    className="flex items-center justify-center gap-2 p-2 bg-[#2a2d36] rounded-xl hover:bg-[#343844] transition-all group/btn border border-white/5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isChallenging === friend.id ? (
                      <RefreshCw size={12} className="text-rose-400 animate-spin" />
                    ) : (
                      <Sword size={12} className="text-rose-400" />
                    )}
                    <span className="text-white font-black text-[8px] uppercase tracking-widest">
                      {isChallenging === friend.id ? 'Loading...' : 'Duel'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <style>{`
            .valorant-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .valorant-scrollbar::-webkit-scrollbar-track {
              background: #1a1c22;
              border-radius: 10px;
            }
            .valorant-scrollbar::-webkit-scrollbar-thumb {
              background: #4f46e5;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(79,70,229,0.5);
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <UserPlus size={20} className="text-emerald-600" />
              Public Area
            </h2>
            <button 
              onClick={refreshPublic}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {publicUsers.map(user => (
              <div key={user.id} className="min-w-[160px] bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center snap-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
                  {user.name[0]}
                </div>
                <p className="text-sm font-black mb-1 truncate w-full">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Lvl {user.level}</p>
                <button className="w-full py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-widest">Add</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`lg:col-span-3 space-y-6 ${!activeChat ? 'hidden lg:block' : 'block'}`}>
        {activeChat && (
          <button 
            onClick={() => setActiveChat(null)}
            className="lg:hidden flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest mb-2"
          >
            <X size={16} /> Back to Circle
          </button>
        )}
        
        {pendingSocialChallenge && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 animate-in slide-in-from-top-4">
            <h3 className="text-rose-900 font-black text-xl mb-2 text-justify">{pendingSocialChallenge.fromName} has challenged you to a DUEL!</h3>
            <p className="text-rose-700 mb-4 text-justify italic">Accept to enter the mission proposal phase.</p>
            <div className="flex gap-3">
              <button onClick={acceptChallenge} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Check size={20} /> Accept
              </button>
              <button onClick={declineChallenge} className="flex-1 bg-white text-rose-600 border border-rose-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <X size={20} /> Decline
              </button>
            </div>
          </div>
        )}

        {activeChat ? (
          <Chat 
            friendId={activeChat.id} 
            friendName={activeChat.name} 
            myId={myId} 
            socket={socket} 
            stats={stats}
            aiName={stats.aiName || "SocialAI"}
            setAiName={(name) => setStats(prev => ({ ...prev, aiName: name }))}
          />
        ) : (
          <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
