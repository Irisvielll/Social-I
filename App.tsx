
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Difficulty, UserStats, Challenge, ChallengeResult, Suggestion } from './types';
import { INITIAL_CHALLENGES, getLevelInfo, POINTS_PER_LEVEL, DEFAULT_DESIGNS } from './constants';
import { generateDailyChallenge, getEncouragement, translateText, getWelcomeMessage } from './services/geminiService';
import { 
  Trophy, 
  Flame, 
  Info, 
  RefreshCw,
  Sparkles,
  Heart,
  Users,
  Settings as SettingsIcon,
  User,
  CheckCircle2,
  XCircle,
  MessageSquarePlus,
  ThumbsUp,
  Send,
  ShoppingBag,
  Play,
  Smartphone,
  Monitor
} from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS, Language } from './translations';
import Social from './components/Social';
import Settings from './components/Settings';
import AdSpace from './components/AdSpace';
import AdminDashboard from './components/AdminDashboard';
import ChallengeFlow from './components/ChallengeFlow';
import Shop from './components/Shop';
import CardDesigner from './components/CardDesigner';
import { SocialChallenge } from './types';

const StyledText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(congrats!|¡felicidades!|félicitations !|herzlichen glückwunsch!|おめでとう！|축하합니다!|恭喜！)/i);
  return (
    <>
      {parts.map((part, i) => {
        const isCongrats = /(congrats!|¡felicidades!|félicitations !|herzlichen glückwunsch!|おめでとう！|축하합니다!|恭喜！)/i.test(part);
        if (isCongrats) {
          return (
            <span key={i} className="font-serif italic tracking-wide text-indigo-600 dark:text-indigo-400 text-[0.92em]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('social_i_stats');
    return saved ? JSON.parse(saved) : {
      points: 0,
      level: 1,
      streak: 0,
      completedCount: 0,
      skippedCount: 0,
      hearts: 3,
      isDarkMode: false,
      history: [],
      aiName: "",
      isAiNamed: false,
      userName: "",
      language: "English"
    };
  });

  const [view, setView] = useState<'home' | 'social' | 'settings' | 'profile' | 'shop' | 'designer'>('social');
  const myId = useMemo(() => `user-${Math.floor(Math.random() * 1000)}`, []);
  const [socket, setSocket] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [isInstallPromptMinimized, setIsInstallPromptMinimized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstallPrompt(false);
    }, 50000); // 50 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newSocket = io({
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    setSocket(newSocket);
    
    newSocket.on("connect", () => {
      newSocket.emit("join", myId);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      if (newSocket) {
        newSocket.off();
        newSocket.close();
      }
    };
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
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [encouragement, setEncouragement] = useState("Ready for a congrats! on your social game?");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Suggestion form state
  const [newSugTitle, setNewSugTitle] = useState("");
  const [newSugDesc, setNewSugDesc] = useState("");
  const [newSugPoints, setNewSugPoints] = useState(50);

  const watchAd = async () => {
    setIsWatchingAd(true);
    // Simulate watching a 5-second ad
    await new Promise(resolve => setTimeout(resolve, 5000));
    setStats(prev => ({ ...prev, hearts: Math.min(prev.hearts + 1, 3) }));
    setIsWatchingAd(false);
  };

  // Social Challenge State
  const [activeSocialChallenge, setActiveSocialChallenge] = useState<SocialChallenge | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(stats.level);

  // Level Up Detection
  useEffect(() => {
    if (stats.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(stats.level);
    }
  }, [stats.level, prevLevel]);
  const [pendingSocialChallenge, setPendingSocialChallenge] = useState<SocialChallenge | null>(null);
  const [isChallenging, setIsChallenging] = useState<string | null>(null);
  const [globalAiMessage, setGlobalAiMessage] = useState<{ text: string, senderName: string } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_ai_broadcast", (data: { text: string, senderName: string }) => {
      setGlobalAiMessage(data);
      // Auto-hide after 15 seconds
      setTimeout(() => setGlobalAiMessage(null), 15000);
    });

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
    localStorage.setItem('social_i_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const triggerWelcome = async () => {
      if (stats.isAiNamed && stats.userName && !globalAiMessage) {
        try {
          const welcome = await getWelcomeMessage(stats.userName, stats.aiName, stats);
          setGlobalAiMessage({
            text: welcome,
            senderName: stats.aiName
          });
          // Auto-hide after 12 seconds
          setTimeout(() => setGlobalAiMessage(null), 12000);
        } catch (err) {
          console.error("Welcome Error:", err);
        }
      }
    };

    // Small delay to let the app settle
    const timer = setTimeout(triggerWelcome, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.isAiNamed, stats.userName, stats.aiName]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      alert("Payment successful! Your purchase has been applied.");
      // In a real app, you'd verify the session on the server here
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled')) {
      alert("Payment canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    if (stats.hearts <= 0) return;

    setLoading(true);
    try {
      const challengeData = await generateDailyChallenge(stats.level);
      if (challengeData) {
        // Translate challenge if language is not English
        if (stats.language && stats.language !== 'English') {
          const [translatedTitle, translatedDesc] = await Promise.all([
            translateText(challengeData.title, stats.language),
            translateText(challengeData.description, stats.language)
          ]);
          challengeData.title = translatedTitle;
          challengeData.description = translatedDesc;
        }
        setActiveChallenge(challengeData);
      }
      
      let msg = await getEncouragement(stats);
      if (msg && stats.language && stats.language !== 'English') {
        msg = await translateText(msg, stats.language);
      }
      setEncouragement(msg || encouragement);
    } catch (e: any) {
      console.error("Challenge fetch error:", e);
      const localChallenge = getRandomLocalChallenge();
      // Translate local challenge too
      if (stats.language && stats.language !== 'English') {
        const [translatedTitle, translatedDesc] = await Promise.all([
          translateText(localChallenge.title, stats.language),
          translateText(localChallenge.description, stats.language)
        ]);
        localChallenge.title = translatedTitle;
        localChallenge.description = translatedDesc;
      }
      setActiveChallenge(localChallenge);
    } finally {
      setLoading(false);
    }
  }, [stats, activeChallenge, encouragement]);

  useEffect(() => {
    if (!activeChallenge) {
      fetchNewChallenge();
    }
  }, [activeChallenge, fetchNewChallenge]);

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

  const handleOnboarding = (aiName: string, userName: string, deviceType: 'mobile' | 'pc', layoutMode: 'portrait' | 'landscape') => {
    setStats(prev => ({ ...prev, aiName, userName, isAiNamed: true, deviceType, layoutMode }));
  };

  const activeDesign = useMemo(() => {
    return stats.customDesigns?.find(d => d.id === stats.activeDesignId) || 
           DEFAULT_DESIGNS.find(d => d.id === stats.activeDesignId) || 
           DEFAULT_DESIGNS[0];
  }, [stats.activeDesignId, stats.customDesigns]);

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

  const levelInfo = getLevelInfo(stats.level);
  const nextLevelProgress = (stats.points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100;
  const t = TRANSLATIONS[stats.language as Language] || TRANSLATIONS.English;

  // Language change effect
  useEffect(() => {
    // This is just to trigger effects when language changes if needed
  }, [stats.language]);

  const changeLanguage = (lang: Language) => {
    setIsChangingLanguage(true);
    setTimeout(() => {
      setStats(prev => ({ ...prev, language: lang }));
      setIsChangingLanguage(false);
    }, 2000);
  };

  if (!stats.isAiNamed) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-[#111111] rounded-[3rem] p-12 shadow-[0_0_100px_rgba(79,70,229,0.1)] border border-white/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
            <Sparkles className="text-white" size={48} />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase italic">
            {t.welcome}
          </h1>
          <p className="text-slate-400 mb-12 leading-relaxed font-medium">
            {t.onboardingDesc}
          </p>
          
          <div className="space-y-8 text-left">
            <div className="group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">
                {t.yourName}
              </label>
              <input 
                id="user-name-input"
                placeholder="e.g. Alex"
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-[#222] transition-all placeholder:text-slate-700 font-bold"
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">
                {t.aiCompanionName}
              </label>
              <input 
                id="ai-name-input"
                placeholder="e.g. Luna"
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-[#222] transition-all placeholder:text-slate-700 font-bold"
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3 ml-1">
                {t.selectDevice}
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  id="device-mobile"
                  onClick={() => {
                    ['device-mobile', 'device-tablet'].forEach(id => {
                      document.getElementById(id)?.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
                      document.getElementById(id)?.classList.add('bg-[#1a1a1a]', 'text-slate-400', 'border-white/5');
                    });
                    document.getElementById('device-mobile')?.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
                    document.getElementById('device-mobile')?.classList.remove('bg-[#1a1a1a]', 'text-slate-400', 'border-white/5');
                    (window as any).selectedDevice = 'mobile';
                    (window as any).selectedLayout = 'portrait';
                  }}
                  className="py-4 bg-[#1a1a1a] text-slate-400 rounded-2xl font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-3"
                >
                  <Smartphone size={18} />
                  {t.mobile}
                </button>
                <button 
                  id="device-tablet"
                  onClick={() => {
                    ['device-mobile', 'device-tablet'].forEach(id => {
                      document.getElementById(id)?.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
                      document.getElementById(id)?.classList.add('bg-[#1a1a1a]', 'text-slate-400', 'border-white/5');
                    });
                    document.getElementById('device-tablet')?.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
                    document.getElementById('device-tablet')?.classList.remove('bg-[#1a1a1a]', 'text-slate-400', 'border-white/5');
                    (window as any).selectedDevice = 'mobile';
                    (window as any).selectedLayout = 'landscape';
                  }}
                  className="py-4 bg-[#1a1a1a] text-slate-400 rounded-2xl font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-3"
                >
                  <Monitor size={18} className="rotate-90" />
                  {t.tablet} / {t.landscape}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const uName = (document.getElementById('user-name-input') as HTMLInputElement).value;
                const aName = (document.getElementById('ai-name-input') as HTMLInputElement).value;
                const dType = (window as any).selectedDevice;
                const lMode = (window as any).selectedLayout;
                if (uName && aName && dType && lMode) handleOnboarding(aName, uName, dType, lMode);
                else alert("Please fill all fields and select your device type!");
              }}
              className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-[0.98] mt-4"
            >
              {t.startJourney}
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              Powered by Advanced Social Intelligence
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${stats.isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full min-h-screen flex flex-col">
        {/* PWA Install Prompt (Mobile Only) */}
      <AnimatePresence>
        {showInstallPrompt && (
          <div className="fixed top-20 left-0 right-0 z-[100] pointer-events-none p-4 flex justify-center">
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className={`bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border border-white/10 transition-all duration-500 overflow-hidden ${
                isInstallPromptMinimized ? 'px-4 py-2 max-w-fit' : 'px-6 py-3 max-w-sm w-full'
              }`}
            >
              <div className="p-2 bg-white/10 rounded-xl cursor-pointer" onClick={() => setIsInstallPromptMinimized(!isInstallPromptMinimized)}>
                <Smartphone className="w-5 h-5" />
              </div>
              
              {!isInstallPromptMinimized && (
                <>
                  <div className="text-left flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Install Social-I</p>
                    <p className="text-xs font-bold">Add to Home Screen for full experience</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert("To install:\n1. Tap Share (iOS) or Menu (Android)\n2. Select 'Add to Home Screen'")}
                      className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                    >
                      Guide
                    </button>
                    <button 
                      onClick={() => setIsInstallPromptMinimized(true)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </>
              )}

              {isInstallPromptMinimized && (
                <button 
                  onClick={() => setIsInstallPromptMinimized(false)}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  Expand
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {globalAiMessage && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[150] flex justify-center pointer-events-none"
          >
            <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl border border-white/20 max-w-lg w-full pointer-events-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={80} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">{globalAiMessage.senderName} Broadcast</p>
              </div>
              <p className="text-sm font-bold leading-relaxed italic">"{globalAiMessage.text}"</p>
              <button 
                onClick={() => setGlobalAiMessage(null)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChangingLanguage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-indigo-600 flex flex-col items-center justify-center text-white p-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-8"
            >
              <RefreshCw size={64} />
            </motion.div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">{t.loadingLanguage}</h2>
            <p className="text-indigo-100 font-medium opacity-80">{t.pleaseWait}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-sm border border-slate-200/50 dark:border-slate-700/50 py-8 px-16 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-sans font-semibold">Achievement</span>
            <div className="text-2xl tracking-[0.25em] font-serif italic text-slate-800 dark:text-white">
              CONGRATS
            </div>
          </motion.div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className={`${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto flex justify-between items-center`}>
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
        <main className={`${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto p-4 space-y-6`}>
          {/* Status Card */}
          <section 
            style={{ 
              ...getStyle(activeDesign.style.cardBg, 'bg'), 
              ...getStyle(activeDesign.style.border, 'border') 
            }}
            className={`rounded-[2.5rem] p-6 shadow-md border transition-all relative overflow-hidden ${getClass(activeDesign.style.cardBg)} ${getClass(activeDesign.style.border)}`}
          >
            {activeDesign.drawingData && (
              <img 
                src={activeDesign.drawingData} 
                className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
                alt="Custom Drawing"
              />
            )}
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <p 
                  style={getStyle(activeDesign.style.text, 'text')}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${getClass(activeDesign.style.text)} opacity-40`}
                >
                  {t.socialRank}
                </p>
                <div className="flex items-center gap-3">
                  <h2 
                    style={getStyle(activeDesign.style.text, 'text')}
                    className={`text-2xl font-black ${getClass(activeDesign.style.text)}`}
                  >
                    {levelInfo.title}
                  </h2>
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
                        {isWatchingAd ? t.watchingAd : t.refillFree}
                      </button>
                    )}
                  </div>
                </div>
                <p 
                  style={getStyle(activeDesign.style.text, 'text')}
                  className={`text-sm font-medium ${getClass(activeDesign.style.text)} opacity-60`}
                >
                  {t.level} {stats.level}
                </p>
              </div>
              <div className="text-right">
                <p 
                  style={getStyle(activeDesign.style.text, 'text')}
                  className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${getClass(activeDesign.style.text)} opacity-40`}
                >
                  {t.mastery}
                </p>
                <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    style={{ 
                      ...getStyle(activeDesign.style.accent, 'bg'),
                      width: `${nextLevelProgress}%` 
                    }}
                    className={`h-full transition-all duration-700 ease-out ${getClass(activeDesign.style.accent)}`} 
                  />
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl flex gap-3 items-start border border-white/10 shadow-sm relative z-10">
              <Info 
                style={getStyle(activeDesign.style.text, 'text')}
                className={`w-5 h-5 ${getClass(activeDesign.style.text)} opacity-60 mt-0.5 shrink-0`} 
              />
              <p 
                style={getStyle(activeDesign.style.text, 'text')}
                className={`text-sm ${getClass(activeDesign.style.text)} opacity-80 leading-relaxed font-medium text-justify`}
              >
                "<StyledText text={encouragement} />"
              </p>
            </div>
          </section>

          {/* Main Task Area */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg uppercase tracking-tight flex items-center gap-2">
                {t.currentMission}
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
              </h3>
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded uppercase tracking-widest">
                {activeChallenge?.id.startsWith('local') ? t.dailyRoutine : t.eliteQuest}
              </span>
            </div>

            {stats.hearts <= 0 ? (
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] p-10 border-2 border-dashed border-rose-200 dark:border-rose-800 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center text-rose-600">
                  <Heart size={40} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-rose-900 dark:text-rose-400 uppercase tracking-tighter mb-2">{t.noHearts}</h4>
                  <p className="text-rose-700 dark:text-rose-500 font-medium">{t.buyHearts}</p>
                </div>
                <button 
                  onClick={() => setView('settings')}
                  className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95"
                >
                  {t.settings}
                </button>
              </div>
            ) : activeChallenge ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/40 dark:shadow-none border-b-4 border-indigo-500 relative overflow-hidden transition-all hover:translate-y-[-2px]"
              >
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
                      {t.done} (+{activeChallenge.points})
                    </button>
                    <button 
                      onClick={skipChallenge}
                      className="sm:w-32 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      {t.skip}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-800 h-80 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(79,70,229,0.05)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]" />
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-24 h-6 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="w-20 h-6 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-3/4 h-10 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="w-2/3 h-4 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                  <div className="pt-6 flex gap-4">
                    <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
                    <div className="w-32 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-[9px] font-black text-indigo-500/40 uppercase tracking-[0.3em] italic animate-pulse">
                    {t.assigningObjective}
                  </p>
                </div>
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
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.victories}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all cursor-default">
               <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl mb-3">
                 <XCircle className="w-6 h-6 text-rose-500" />
               </div>
               <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stats.skippedCount}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tacticalSkips}</span>
            </div>
          </section>

          {/* Suggestion Box */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg uppercase tracking-tight">{t.suggestionBox}</h3>
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
                  <div className="bg-rose-600 text-white w-14 h-10 flex items-center justify-center rounded-xl font-black shadow-lg shadow-indigo-100 dark:shadow-none">
                    {newSugPoints}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  {t.done}
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
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">{sug.suggestedPoints} {t.points}</span>
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
              {t.missionLog}
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
          setView={setView}
        />
      )}
      {view === 'settings' && <Settings stats={stats} setStats={setStats} changeLanguage={changeLanguage} />}
      <AnimatePresence>
        {view === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-y-auto"
          >
            <AdminDashboard stats={stats} setStats={setStats} />
          </motion.div>
        )}
      </AnimatePresence>
      {view === 'shop' && <Shop stats={stats} setStats={setStats} setView={setView} />}
      {view === 'designer' && <CardDesigner stats={stats} setStats={setStats} />}

      {/* Global Social Challenge Flow */}
      {activeSocialChallenge && 
       activeSocialChallenge.status !== 'pending' && 
       activeSocialChallenge.status !== 'rejected' && (
        <ChallengeFlow 
          challenge={activeSocialChallenge} 
          myId={myId} 
          socket={socket} 
          setStats={setStats} 
          stats={stats}
          onClose={() => setActiveSocialChallenge(null)} 
        />
      )}

      {/* Bottom Nav & Ads Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Bottom Nav */}
        <nav className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 ${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto rounded-t-[2.5rem] shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.15)] mb-0`}>
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t.training}</span>
            </button>
            <button 
              onClick={() => setView('social')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'social' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Users className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t.social}</span>
            </button>
            <button 
              onClick={() => setView('shop')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'shop' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Shop</span>
            </button>
            <button 
              onClick={() => setView('profile')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Trainer</span>
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <SettingsIcon className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t.settings}</span>
            </button>
          </div>
        </nav>
        
        {/* AdSpace is now below Nav */}
        <div className="relative z-50">
          <AdSpace />
        </div>
      </div>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-indigo-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white dark:bg-[#111] rounded-[3rem] p-12 text-center max-w-md w-full shadow-[0_0_100px_rgba(79,70,229,0.5)] border border-indigo-500/30"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                <Trophy size={100} className="mx-auto text-amber-400 relative z-10 animate-bounce" />
              </div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Level Up!</h2>
              <p className="text-indigo-500 font-black text-2xl mb-6 uppercase tracking-widest italic">Reached Level {stats.level}</p>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 mb-8">
                <p className="text-slate-500 dark:text-slate-400 font-bold italic">"Your social presence is expanding. Keep pushing the boundaries of your comfort zone."</p>
              </div>
              <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
              >
                Continue Journey
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};

export default App;
