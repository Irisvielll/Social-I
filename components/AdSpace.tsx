
import React, { useEffect, useState } from 'react';

interface Ad {
  id: number;
  text: string;
  link: string;
}

const AdSpace: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      // Use a microtask to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setAds([
          { id: 1, text: "Support Introvert Up! Unlock Pro Mode for more missions.", link: "#" },
          { id: 2, text: "Join our discord community of socially confident introverts.", link: "#" }
        ]);
      });
      return;
    }

    fetch('/api/ads')
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => setAds(data))
      .catch(err => {
        console.error("Failed to fetch ads", err);
        // Fallback if backend is down
        setAds([
          { id: 1, text: "Support Introvert Up! Unlock Pro Mode for more missions.", link: "#" }
        ]);
      });
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="bg-indigo-50 border-t border-indigo-100 p-2">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Sponsored</span>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm text-indigo-700 font-medium">
            {ads.map(ad => (
              <a 
                key={ad.id} 
                href={ad.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mx-8 hover:underline"
              >
                {ad.text}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdSpace;
