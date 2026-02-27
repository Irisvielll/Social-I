
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Difficulty, UserStats, Challenge, ChallengeResult, Suggestion } from './types';
import { INITIAL_CHALLENGES, getLevelInfo, POINTS_PER_LEVEL } from './constants';
import { generateDailyChallenge, getEncouragement } from './services/geminiService';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Info, 
  RefreshCw,
  Sparkles,
  MessageSquarePlus,
  ThumbsUp,
  Send,
  Heart,
  Users,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Play
} from 'lucide-react';
import { io } from 'socket.io-client';
import Social from './components/Social';
import Settings from './components/Settings';
import AdSpace from './components/AdSpace';
import AdminDashboard from './components/AdminDashboard';
import ChallengeFlow from './components/ChallengeFlow';
import { SocialChallenge, Friend } from './types';

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('introvert_up_stats');
    return saved ? JSON.parse(saved) : {
      points: 0,
      level: 1,
      streak: 0,
      completedCount: 0,
      skippedCount: 0,
      hearts: 3,
      isDarkMode: false,
      history: [],
      aiName: "SocialAI",
      isAiNamed: false,
      language: "English"
    };
  });

  const [view, setView] = useState<'home' | 'social' | 'settings' | 'profile'>('social');
  const myId = useMemo(() => `user-${Math.floor(Math.random() * 1000)}`, []);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit("join", myId);
    return () => newSocket.close();
  }, [myId]);

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(() => {
    const saved = localStorage.getItem('introvert_up_active_challenge');
    return saved ? JSON.parse(saved) : null;
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
    const saved = localStorage.getItem('introvert_up_suggestions');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [encouragement, setEncouragement] = useState("Ready to level up your social game?");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Suggestion form state
  const [newSugTitle, setNewSugTitle] = useState("");
  const [newSugDesc, setNewSugDesc] = useState("");
  const [newSugPoints, setNewSugPoints] = useState(50);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const watchAd = async () => {
    setIsWatchingAd(true);
    // Simulate watching a 5-second ad
    await new Promise(resolve => setTimeout(resolve, 5000));
    setStats(prev => ({ ...prev, hearts: Math.min(prev.hearts + 1, 3) }));
    setIsWatchingAd(false);
  };

  // Social Challenge State
  const [activeSocialChallenge, setActiveSocialChallenge] = useState<SocialChallenge | null>(null);
  const [pendingSocialChallenge, setPendingSocialChallenge] = useState<SocialChallenge | null>(null);
  const [isChallenging, setIsChallenging] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("challenge_received", (challenge: SocialChallenge) => {
      setPendingSocialChallenge(challenge);
    });

    socket.on("challenge_updated", (challenge: SocialChallenge) => {
      // Loading only stops when the duel game appears (proposing phase)
      if (challenge.status === 'proposing' || challenge.status === 'rejected') {
        setIsChallenging(null);
      }
      
      setActiveSocialChallenge(challenge);
      
      if (challenge.status !== 'pending') {
        setPendingSocialChallenge(null);
      }
    });

    return () => {
      socket.off("challenge_received");
      socket.off("challenge_updated");
    };
  }, [socket]);

  useEffect(() => {
    if (!stats.isAiNamed) {
      const timer = setTimeout(() => setShowOnboarding(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [stats.isAiNamed]);

  useEffect(() => {
    localStorage.setItem('introvert_up_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('introvert_up_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    if (activeChallenge) {
      localStorage.setItem('introvert_up_active_challenge', JSON.stringify(activeChallenge));
    } else {
      localStorage.removeItem('introvert_up_active_challenge');
    }
  }, [activeChallenge]);

  const handleLevelUp = (newPoints: number) => {
    const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
    return newLevel > stats.level ? newLevel : stats.level;
  };

  const getRandomLocalChallenge = () => {
    const randomInitial = INITIAL_CHALLENGES[Math.floor(Math.random() * INITIAL_CHALLENGES.length)];
    return { 
      ...randomInitial, 
      id: `local-${Date.now()}`, 
      timestamp: Date.now(), 
      difficulty: randomInitial.difficulty as Difficulty 
    };
  };

  const fetchNewChallenge = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && activeChallenge) return;

    setLoading(true);
    try {
      const challenge = await generateDailyChallenge(stats.level);
      if (challenge) {
        setActiveChallenge(challenge);
      }
      
      const msg = await getEncouragement(stats);
      setEncouragement(msg || encouragement);
    } catch (e: any) {
      setActiveChallenge(getRandomLocalChallenge());
    } finally {
      setLoading(false);
    }
  }, [stats, activeChallenge, encouragement]);

  useEffect(() => {
    if (!activeChallenge) {
      fetchNewChallenge();
    }
  }, []);

  const completeChallenge = () => {
    if (!activeChallenge) return;

    const pointsEarned = activeChallenge.points;
    const newPoints = stats.points + pointsEarned;
    const newLevel = handleLevelUp(newPoints);

    const result: ChallengeResult = {
      challenge: activeChallenge,
      status: 'completed',
      timestamp: Date.now(),
      pointsAwarded: pointsEarned
    };

    setStats(prev => ({
      ...prev,
      points: newPoints,
      level: newLevel,
      streak: prev.streak + 1,
      completedCount: prev.completedCount + 1,
      history: [result, ...prev.history].slice(0, 50)
    }));

    setActiveChallenge(null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(() => fetchNewChallenge(true), 100);
  };

  const skipChallenge = () => {
    if (!activeChallenge) return;

    let newHearts = stats.hearts;
    let penalty = 0;

    if (newHearts > 0) {
      newHearts -= 1;
    } else {
      penalty = 35;
    }

    const newPoints = Math.max(0, stats.points - penalty);
    const newLevel = handleLevelUp(newPoints);

    const result: ChallengeResult = {
      challenge: activeChallenge,
      status: 'skipped',
      timestamp: Date.now(),
      pointsAwarded: -penalty
    };

    setStats(prev => ({
      ...prev,
      points: newPoints,
      level: newLevel,
      streak: 0,
      hearts: newHearts,
      skippedCount: prev.skippedCount + 1,
      history: [result, ...prev.history].slice(0, 50)
    }));

    setActiveChallenge(null);
    setTimeout(() => fetchNewChallenge(true), 100);
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSugTitle || !newSugDesc) return;

    const newSuggestion: Suggestion = {
      id: `sug-${Date.now()}`,
      title: newSugTitle,
      description: newSugDesc,
      suggestedPoints: Math.min(newSugPoints, 150),
      votes: 1,
      timestamp: Date.now()
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setNewSugTitle("");
    setNewSugDesc("");
    setNewSugPoints(50);
  };

  const voteSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s));
  };

  const levelInfo = getLevelInfo(stats.level);
  const nextLevelProgress = (stats.points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100;

  return (
    <div className={`min-h-screen pb-40 transition-colors duration-500 ${stats.isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce text-6xl drop-shadow-xl">✨🎉 LEVEL UP! 🎊✨</div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-indigo-900 dark:text-indigo-400 uppercase leading-none">SOCIAL-I</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Introverts-up!</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-900/50 shadow-sm">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-black text-amber-700 dark:text-amber-500">{stats.points}</span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-900/50 shadow-sm">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-black text-orange-700 dark:text-orange-500">{stats.streak}</span>
            </div>
          </div>
        </div>
      </header>

      {view === 'home' && (
        <main className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Status Card */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Social Rank</p>
                <div className="flex items-center gap-3">
                  <h2 className={`text-2xl font-black ${levelInfo.color}`}>{levelInfo.title}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <Heart 
                          key={i} 
                          size={16} 
                          className={i < stats.hearts ? "text-rose-500 fill-rose-500" : "text-slate-200 dark:text-slate-700"} 
                        />
                      ))}
                    </div>
                    {stats.hearts === 0 && (
                      <button 
                        disabled={isWatchingAd}
                        onClick={watchAd}
                        className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1"
                      >
                        {isWatchingAd ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 fill-emerald-600" />
                        )}
                        {isWatchingAd ? 'Watching...' : 'Refill Free!'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-medium">Progress Level {stats.level}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Mastery</p>
                <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-700 ease-out" 
                    style={{ width: `${nextLevelProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3 items-start border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <Info className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-sm text-indigo-900 dark:text-indigo-300 leading-relaxed font-medium text-justify">
                "{encouragement}"
              </p>
            </div>
          </section>

          {/* Main Task Area */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg uppercase tracking-tight flex items-center gap-2">
                Current Mission
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
              </h3>
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded uppercase tracking-widest">
                {activeChallenge?.id.startsWith('local') ? 'Daily Routine' : 'Elite Quest'}
              </span>
            </div>

            {activeChallenge ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/40 dark:shadow-none border-b-4 border-indigo-500 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                <div className="absolute top-0 right-0 p-6">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                    activeChallenge.difficulty === Difficulty.EASY ? 'bg-green-100 text-green-700' :
                    activeChallenge.difficulty === Difficulty.MEDIUM ? 'bg-blue-100 text-blue-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {activeChallenge.difficulty}
                  </span>
                </div>

                <div className="space-y-5">
                  <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded uppercase tracking-[0.1em]">
                    {activeChallenge.category}
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight text-justify">
                    {activeChallenge.title}
                  </h4>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-justify">
                    {activeChallenge.description}
                  </p>
                  
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={completeChallenge}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      DONE! (+{activeChallenge.points})
                    </button>
                    <button 
                      onClick={skipChallenge}
                      className="sm:w-32 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      SKIP
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-900/50 h-64 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800">
                 <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mb-4" />
                 <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">Assigning new objective...</p>
              </div>
            )}
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all cursor-default">
               <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-3">
                 <CheckCircle2 className="w-6 h-6 text-green-500" />
               </div>
               <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stats.completedCount}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Victories</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all cursor-default">
               <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl mb-3">
                 <XCircle className="w-6 h-6 text-rose-500" />
               </div>
               <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stats.skippedCount}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tactical Skips</span>
            </div>
          </section>

          {/* Suggestion Box */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg uppercase tracking-tight">Suggestion Box</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Have a social challenge idea? Propose it to the community!
              </p>
              
              <form onSubmit={submitSuggestion} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Challenge Title</label>
                  <input 
                    type="text" 
                    value={newSugTitle}
                    onChange={(e) => setNewSugTitle(e.target.value)}
                    placeholder="e.g. The Coffee Compliment"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Brief Description</label>
                  <textarea 
                    value={newSugDesc}
                    onChange={(e) => setNewSugDesc(e.target.value)}
                    placeholder="What exactly should someone do?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm resize-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Point Value (Max 150)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      step="10"
                      value={newSugPoints}
                      onChange={(e) => setNewSugPoints(parseInt(e.target.value))}
                      className="w-full h-2 bg-indigo-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="bg-indigo-600 text-white w-14 h-10 flex items-center justify-center rounded-xl font-black shadow-lg shadow-indigo-100 dark:shadow-none">
                    {newSugPoints}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  POST PROPOSAL
                </button>
              </form>
            </div>

            {/* List of Suggestions */}
            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div key={sug.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm">{sug.title}</h5>
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">{sug.suggestedPoints} pts</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{sug.description}</p>
                    <div className="pt-2 flex items-center gap-3">
                      <button 
                        onClick={() => voteSuggestion(sug.id)}
                        className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md text-[10px] font-black hover:bg-indigo-100 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        VOTE {sug.votes > 0 && `(${sug.votes})`}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="space-y-4">
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg uppercase tracking-tight flex items-center gap-2 px-1">
              Mission Log
            </h3>
            <div className="space-y-3">
              {stats.history.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm font-bold uppercase tracking-widest italic">
                  Awaiting first entry...
                </div>
              ) : (
                stats.history.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl shadow-inner ${item.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm truncate max-w-[150px] tracking-tight">{item.challenge.title}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-black tracking-tighter ${item.pointsAwarded > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                      {item.pointsAwarded > 0 ? `+${item.pointsAwarded}` : item.pointsAwarded}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      )}

      {view === 'social' && (
        <Social 
          stats={stats} 
          setStats={setStats} 
          socket={socket} 
          myId={myId} 
          activeSocialChallenge={activeSocialChallenge}
          setActiveSocialChallenge={setActiveSocialChallenge}
          pendingSocialChallenge={pendingSocialChallenge}
          setPendingSocialChallenge={setPendingSocialChallenge}
          isChallenging={isChallenging}
          setIsChallenging={setIsChallenging}
        />
      )}
      {view === 'settings' && <Settings stats={stats} setStats={setStats} />}
      {view === 'profile' && <AdminDashboard />}

      {/* Global Social Challenge Flow */}
      {activeSocialChallenge && 
       activeSocialChallenge.status !== 'pending' && 
       activeSocialChallenge.status !== 'rejected' && (
        <ChallengeFlow 
          challenge={activeSocialChallenge} 
          myId={myId} 
          socket={socket} 
          setStats={setStats} 
          onClose={() => setActiveSocialChallenge(null)} 
        />
      )}

      {/* Onboarding Overlay */}
      {!stats.isAiNamed && showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto animate-bounce">
              <Sparkles size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                Hi, you are... in!
              </h3>
              <p className="text-slate-500 font-medium">
                I'm.... who am I? Give me a name!
              </p>
            </div>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Name Me!!!"
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const name = (e.target as HTMLInputElement).value.trim();
                    if (name) {
                      setStats(prev => ({ ...prev, aiName: name, isAiNamed: true }));
                    }
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const name = input.value.trim();
                  if (name) {
                    setStats(prev => ({ ...prev, aiName: name, isAiNamed: true }));
                  }
                }}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
              >
                THANKS HOOMAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav & Ads Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Bottom Nav */}
        <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 max-w-2xl mx-auto rounded-t-[2.5rem] shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.15)] mb-0">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Training</span>
            </button>
            <button 
              onClick={() => setView('social')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'social' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Users className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Social</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => {
                  setView('home');
                  fetchNewChallenge(true);
                }} 
                disabled={loading}
                className="absolute -top-14 left-1/2 -translate-x-1/2 bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-400 active:scale-90 transition-all hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none border-4 border-white dark:border-slate-900"
              >
                <RefreshCw className={`w-7 h-7 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button 
              onClick={() => setView('settings')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <SettingsIcon className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Settings</span>
            </button>
            <button 
              onClick={() => setView('profile')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Profile</span>
            </button>
          </div>
        </nav>
        
        {/* AdSpace is now below Nav */}
        <div className="relative z-50">
          <AdSpace />
        </div>
      </div>
    </div>
  );
};

export default App;
