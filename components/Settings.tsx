
import React, { useState } from 'react';
import { Moon, Sun, CreditCard, ShieldCheck, Heart, Zap, UserMinus, Plus, Smartphone, Wallet, Languages, Play } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const LANGUAGES = [
  { name: "English", native: "English" },
  { name: "Spanish", native: "Español" },
  { name: "French", native: "Français" },
  { name: "German", native: "Deutsch" },
  { name: "Italian", native: "Italiano" },
  { name: "Portuguese", native: "Português" },
  { name: "Russian", native: "Русский" },
  { name: "Chinese", native: "中文" },
  { name: "Japanese", native: "日本語" },
  { name: "Korean", native: "한국어" },
  { name: "Tagalog", native: "Tagalog" },
  { name: "Hindi", native: "हिन्दी" },
  { name: "Arabic", native: "العربية" }
];

const Settings: React.FC<SettingsProps> = ({ stats, setStats }) => {
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

  const handlePurchase = async (item: string, price: number, effect: () => void) => {
    setIsPurchasing(item);
    // Simulate network delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        item, 
        price, 
        userId: 'user-1',
        method: 'Saved Card (**** 4455)'
      })
    });
    
    if (res.ok) {
      effect();
      setPaymentSuccess(`Successfully purchased ${item}!`);
      setTimeout(() => setPaymentSuccess(""), 3000);
    }
    setIsPurchasing(null);
  };

  const addCard = () => {
    if (newCard.number.length < 16) return;
    setShowAddCard(false);
    alert("Card added successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {stats.isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
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
          Language
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.name}
              onClick={() => setStats(prev => ({ ...prev, language: lang.name }))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("3 Hearts", 0.99, () => setStats(prev => ({ ...prev, hearts: 3 })))}
            className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "3 Hearts" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <Heart className="text-rose-500 fill-rose-500" size={24} />
              <span className="font-bold text-indigo-600">$0.99</span>
            </div>
            <h4 className="font-bold">Refill Hearts</h4>
            <p className="text-xs text-slate-500 text-justify">Get 3 hearts to keep skipping safely.</p>
          </button>

          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("Pro Mode", 9.99, () => {})}
            className="p-4 border border-indigo-100 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-900 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "Pro Mode" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <Zap className="text-amber-500 fill-amber-500" size={24} />
              <span className="font-bold text-indigo-600">$9.99</span>
            </div>
            <h4 className="font-bold">Pro Mode</h4>
            <p className="text-xs text-slate-500 text-justify">Unlimited hearts & custom sidequests.</p>
          </button>

          <button 
            disabled={!!isPurchasing}
            onClick={() => handlePurchase("Unfriend Fee", 0.67, () => {})}
            className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left relative overflow-hidden"
          >
            {isPurchasing === "Unfriend Fee" && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <UserMinus className="text-slate-400" size={24} />
              <span className="font-bold text-indigo-600">$0.67</span>
            </div>
            <h4 className="font-bold">Unfriend (Quick)</h4>
            <p className="text-xs text-slate-500 text-justify">Skip the mission and unfriend instantly.</p>
            <p className="text-[10px] text-rose-500 mt-1 font-bold text-justify">OR: Do a mission to unfriend for free!</p>
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
            <h4 className="font-bold">Watch Ad</h4>
            <p className="text-xs text-slate-500 text-justify">Watch a short video to refill 1 heart.</p>
            {stats.hearts >= 3 && <p className="text-[10px] text-emerald-600 mt-1 font-bold">Hearts Full!</p>}
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

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Smartphone size={18} className="text-slate-900 dark:text-white" />
              <span className="text-sm font-bold">Apple Pay</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Wallet size={18} className="text-blue-500" />
              <span className="text-sm font-bold">GCash</span>
            </button>
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
        All payments are processed securely. Contact admin@introvertup.com for support.
      </div>
    </div>
  );
};

export default Settings;
