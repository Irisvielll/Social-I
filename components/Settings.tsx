
import React, { useState, useEffect } from 'react';
import { Moon, Sun, CreditCard, ShieldCheck, Heart, Zap, UserMinus, Plus, Smartphone, Languages, Play, ShoppingBag, Monitor, Check, Globe } from 'lucide-react';
import { UserStats } from '../types';
import { Language, TRANSLATIONS } from '../translations';

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

interface SettingsProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  changeLanguage: (lang: Language) => void;
}

const LANGUAGES: { name: Language; native: string }[] = [
  { name: "English", native: "English" },
  { name: "Spanish", native: "Español" },
  { name: "French", native: "Français" },
  { name: "German", native: "Deutsch" },
  { name: "Chinese", native: "中文" },
  { name: "Japanese", native: "日本語" },
  { name: "Korean", native: "한국어" }
];

const Settings: React.FC<SettingsProps> = ({ stats, setStats, changeLanguage }) => {
  const t = TRANSLATIONS[stats.language as Language] || TRANSLATIONS.English;
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", type: "VISA" });
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const watchAd = async () => {
    setIsWatchingAd(true);
    // Simulate watching a 5-second ad
    await new Promise(resolve => setTimeout(resolve, 5000));
    setStats(prev => ({ ...prev, hearts: Math.min(prev.hearts + 1, 3) }));
    setIsWatchingAd(false);
    setPaymentSuccess("Ad watched! +1 Heart refilled.");
    setTimeout(() => setPaymentSuccess(""), 3000);
  };

  const [paymentError, setPaymentError] = useState("");

  const [linkingMethod, setLinkingMethod] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<{id: string, item: string, amount: number, date: string, status: string}[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const item = urlParams.get('item') || 'Social-I Purchase';
      const amount = parseFloat(urlParams.get('amount') || '0');
      
      // Add to local history if not already there (simple check)
      const newTx = {
        id: Math.random().toString(36).substr(2, 9),
        item,
        amount,
        date: new Date().toLocaleString(),
        status: 'PAID'
      };
      
      setTransactions(prev => {
        // Prevent duplicates on refresh
        if (prev.some(t => t.item === newTx.item && t.date.split(',')[0] === newTx.date.split(',')[0])) {
          return prev;
        }
        return [newTx, ...prev];
      });
      
      setPaymentSuccess(`Thank you! Your purchase of ${item} was successful.`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setPaymentSuccess(""), 5000);
    }
  }, []);

  const handleLinkMethod = async (method: string) => {
    setLinkingMethod(method);
    setPaymentError("");
    
    // Check if running on GitHub Pages (static hosting)
    const isGitHubPages = window.location.hostname.includes('github.io');

    try {
      if (isGitHubPages) {
        // Mock behavior for GitHub Pages since there's no backend
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPaymentSuccess(`Demo Mode: ${method} linked successfully!`);
        setTimeout(() => setPaymentSuccess(""), 5000);
        return;
      }

      // Real backend call for AI Studio preview or custom servers
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 1.00, 
          name: `Link ${method}`,
          description: `Verification for linking ${method} to Social-I`,
          success_url: `${window.location.origin}${window.location.pathname}?success=true&item=Link%20${method}&amount=1.00`
        })
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to connect to PayMongo');
      }
    } catch (error: any) {
      console.error('Linking error:', error);
      setPaymentError(`Connection failed: ${error.message}`);
    } finally {
      setLinkingMethod(null);
    }
  };

  const handlePurchase = async (item: string, price: number) => {
    setIsPurchasing(item);
    setPaymentError("");
    
    // Check if running on GitHub Pages (static hosting)
    const isGitHubPages = window.location.hostname.includes('github.io');

    try {
      if (isGitHubPages) {
        // Mock behavior for GitHub Pages since there's no backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Apply the purchase effects locally for the demo
        if (item.includes("Hearts")) {
          setStats(prev => ({ ...prev, hearts: 3 }));
        } else if (item === "Pro Mode") {
          setStats(prev => ({ ...prev, isPro: true }));
        }
        
        setPaymentSuccess(`Demo Mode: Purchase of ${item} successful!`);
        
        // Add to history
        setTransactions(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          item,
          amount: price,
          date: new Date().toLocaleString(),
          status: 'PAID (DEMO)'
        }, ...prev]);

        setTimeout(() => setPaymentSuccess(""), 5000);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: price, 
          name: item,
          description: `Purchase of ${item} for Social-I`,
          success_url: `${window.location.origin}${window.location.pathname}?success=true&item=${encodeURIComponent(item)}&amount=${price}`
        })
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(`Payment failed: ${error.message}`);
      setTimeout(() => {
        if (!paymentError) alert(`Payment failed: ${error.message}`);
      }, 100);
    } finally {
      setIsPurchasing(null);
    }
  };

  const addCard = () => {
    if (newCard.number.length < 16) return;
    setShowAddCard(false);
    alert("Card added successfully!");
  };

  return (
    <div className={`${stats.layoutMode === 'portrait' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto p-6 space-y-8`}>
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {stats.isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          {t.appearance}
        </h2>
        <div className="flex items-center justify-between">
          <span>{stats.isDarkMode ? t.darkMode : t.lightMode}</span>
          <button
            onClick={() => setStats(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${stats.isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${stats.isDarkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Languages size={20} />
          {t.language}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.name}
              onClick={() => changeLanguage(lang.name)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                stats.language === lang.name 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-slate-400 italic">This will set the primary language for {stats.aiName || 'SocialAI'}.</p>
      </section>

      {transactions.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Check size={20} className="text-emerald-500" />
            Transaction History
          </h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold">{tx.item}</p>
                  <p className="text-[10px] text-slate-500">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">${tx.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Smartphone size={20} />
          Device & Layout
        </h2>
        <div className={`grid grid-cols-1 ${stats.layoutMode === 'portrait' ? '' : 'sm:grid-cols-3'} gap-3`}>
          <button 
            onClick={() => setStats(prev => ({ ...prev, layoutMode: 'portrait', deviceType: 'mobile' }))}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              stats.layoutMode === 'portrait' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone size={18} />
              <span className="font-bold">Portrait (Mobile)</span>
            </div>
            {stats.layoutMode === 'portrait' && <Check size={16} />}
          </button>
          
          <button 
            onClick={() => setStats(prev => ({ ...prev, layoutMode: 'landscape', deviceType: 'mobile' }))}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              stats.layoutMode === 'landscape' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor size={18} className="rotate-90" />
              <span className="font-bold">Landscape (Tablet)</span>
            </div>
            {stats.layoutMode === 'landscape' && <Check size={16} />}
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          In-App Purchases
        </h2>
        
        {paymentSuccess && (
          <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium animate-bounce">
            {paymentSuccess}
          </div>
        )}

        {paymentError && (
          <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-medium">
            {paymentError}
          </div>
        )}

        <div className={`grid grid-cols-1 ${stats.layoutMode === 'portrait' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("3 Hearts", 0.99)}
            className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "3 Hearts" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <Heart className="text-rose-500 fill-rose-500" size={24} />
              <span className="font-bold text-indigo-600">$0.99</span>
            </div>
            <h4 className="font-bold">{t.refillHearts}</h4>
            <p className="text-xs text-slate-500 text-justify">{t.getHeartsDesc}</p>
          </button>

          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("Pro Mode", 9.99)}
            className="p-4 border border-indigo-100 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-900 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "Pro Mode" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <Zap className="text-amber-500 fill-amber-500" size={24} />
              <span className="font-bold text-indigo-600">$9.99</span>
            </div>
            <h4 className="font-bold">{t.proMode}</h4>
            <p className="text-xs text-slate-500 text-justify"><StyledText text={t.readyToLevelUp} /></p>
          </button>

          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("Unfriend Fee", 0.67)}
            className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "Unfriend Fee" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <UserMinus className="text-slate-400" size={24} />
              <span className="font-bold text-indigo-600">$0.67</span>
            </div>
            <h4 className="font-bold">{t.unfriendFee}</h4>
            <p className="text-xs text-slate-500 text-justify">{t.unfriendDesc}</p>
            <p className="text-[10px] text-rose-500 mt-1 font-bold text-justify">{t.unfriendOrMission}</p>
          </button>

          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("Custom Design Slot", 5.00)}
            className="p-4 border border-indigo-100 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-900 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "Custom Design Slot" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <ShoppingBag className="text-indigo-500" size={24} />
              <span className="font-bold text-indigo-600">$5.00</span>
            </div>
            <h4 className="font-bold">Unlock Custom Design</h4>
            <p className="text-xs text-slate-500 text-justify">Design your own profile card and share it with the world!</p>
          </button>

          <button 
            disabled={isWatchingAd || stats.hearts >= 3}
            onClick={watchAd}
            className="p-4 border border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/20 dark:border-emerald-900 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors text-left relative overflow-hidden disabled:opacity-50"
          >
            {isWatchingAd && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <Play className="text-emerald-500 fill-emerald-500" size={24} />
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <h4 className="font-bold">{t.refillFree}</h4>
            <p className="text-xs text-slate-500 text-justify">{t.watchAdDesc}</p>
            {stats.hearts >= 3 && <p className="text-[10px] text-emerald-600 mt-1 font-bold">{t.heartsFull}</p>}
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShieldCheck size={20} />
          Payment Methods
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <div className="w-12 h-8 bg-white dark:bg-slate-800 rounded flex items-center justify-center font-bold text-[10px] shadow-sm">VISA</div>
            <div className="flex-1">
              <p className="text-sm font-bold">**** **** **** 4455</p>
              <p className="text-xs text-slate-500">Expires 12/26</p>
            </div>
            <button className="text-xs text-indigo-600 font-bold">Edit</button>
          </div>

          <div className={`grid grid-cols-2 ${stats.layoutMode === 'portrait' ? '' : 'sm:grid-cols-4'} gap-3`}>
            <button 
              onClick={() => handleLinkMethod("Cards")}
              disabled={!!linkingMethod}
              className="flex flex-col items-center justify-center gap-1 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden group"
            >
              {linkingMethod === "Cards" && <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center z-10"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
              <CreditCard size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Cards</span>
            </button>
            <button 
              onClick={() => handleLinkMethod("GCash")}
              disabled={!!linkingMethod}
              className="flex flex-col items-center justify-center gap-1 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden group"
            >
              {linkingMethod === "GCash" && <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center z-10"><div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}
              <Smartphone size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">GCash</span>
            </button>
            <button 
              onClick={() => handleLinkMethod("Maya")}
              disabled={!!linkingMethod}
              className="flex flex-col items-center justify-center gap-1 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden group"
            >
              {linkingMethod === "Maya" && <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center z-10"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
              <Smartphone size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Maya</span>
            </button>
            <button 
              onClick={() => handleLinkMethod("GrabPay")}
              disabled={!!linkingMethod}
              className="flex flex-col items-center justify-center gap-1 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden group"
            >
              {linkingMethod === "GrabPay" && <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center z-10"><div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}
              <Smartphone size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">GrabPay</span>
            </button>
          </div>

          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-2">
              <Globe size={14} />
              International & Local Methods
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
              We support <b>Visa, Mastercard, GCash, Maya, GrabPay, BillEase (BNPL)</b>, and <b>Direct Online Banking</b>. 
              All payments are processed securely via PayMongo. PayPal is currently unavailable but coming soon!
            </p>
          </div>

          {showAddCard ? (
            <div className="p-4 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <input 
                placeholder="Card Number" 
                maxLength={16}
                value={newCard.number}
                onChange={e => setNewCard({...newCard, number: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700" 
              />
              <div className="flex gap-3">
                <input 
                  placeholder="MM/YY" 
                  maxLength={5}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700" 
                />
                <input 
                  placeholder="CVC" 
                  maxLength={3}
                  className="w-20 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-sm border border-slate-100 dark:border-slate-700" 
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addCard} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Save Card</button>
                <button onClick={() => setShowAddCard(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowAddCard(true)}
              className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Debit/Credit Card
            </button>
          )}
        </div>
      </section>

      <div className="text-center text-[10px] text-slate-400">
        {t.allPaymentsSecure} Contact admin@introvertup.com for support.
      </div>
    </div>
  );
};

export default Settings;
