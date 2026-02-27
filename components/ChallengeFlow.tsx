
import React, { useState, useEffect } from 'react';
import { Timer, Sword, Trophy, Camera, Send, Check, X, MessageSquare, Minus, Maximize2 } from 'lucide-react';
import { SocialChallenge, UserStats } from '../types';
import TicTacToe from './TicTacToe';

interface ChallengeFlowProps {
  challenge: SocialChallenge;
  myId: string;
  socket: any;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onClose: () => void;
}

const ChallengeFlow: React.FC<ChallengeFlowProps> = ({ challenge, myId, socket, setStats, onClose }) => {
  const [proposal, setProposal] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const isFromMe = challenge.fromId === myId;
  const opponentId = isFromMe ? challenge.toId : challenge.fromId;

  const [hasAwardedPoints, setHasAwardedPoints] = useState(false);

  // Award points logic
  useEffect(() => {
    if (hasAwardedPoints) return;

    if (challenge.status === 'completed') {
      const iWon = challenge.winnerId === myId;
      setStats(prev => ({ 
        ...prev, 
        points: prev.points + (iWon ? 150 : 20) 
      }));
      setHasAwardedPoints(true);
    } else if (challenge.status === 'expired') {
      setStats(prev => ({ ...prev, points: prev.points + 1 }));
      setHasAwardedPoints(true);
    }
  }, [challenge.status, challenge.winnerId, myId, setStats, hasAwardedPoints]);

  // Timer logic for Proposing (45s) and Racing (1h)
  useEffect(() => {
    let interval: any;
    if (challenge.status === 'proposing') {
      setTimeLeft(45);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Auto-submit empty if time runs out
            if (!challenge.proposedPrompts[myId]) {
              socket.emit("challenge:propose", { challengeId: challenge.id, userId: myId, prompt: "Do 10 jumping jacks" });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (challenge.status === 'racing' && challenge.startTime) {
      const oneHour = 60 * 60 * 1000;
      const updateRacingTimer = () => {
        const elapsed = Date.now() - challenge.startTime!;
        const remaining = Math.max(0, oneHour - elapsed);
        setTimeLeft(Math.floor(remaining / 1000));
        if (remaining <= 0) {
          socket.emit("challenge:submit_proof", { challengeId: challenge.id, userId: 'system', proofUrl: 'expired' });
        }
      };
      updateRacingTimer();
      interval = setInterval(updateRacingTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [challenge.status, challenge.startTime, challenge.id, myId, socket]);

  const submitProposal = () => {
    if (!proposal.trim()) return;
    socket.emit("challenge:propose", { challengeId: challenge.id, userId: myId, prompt: proposal });
  };

  const handleWin = (winnerId: string) => {
    socket.emit("challenge:minigame_win", { challengeId: challenge.id, winnerId });
  };

  const choosePrompt = (prompt: string) => {
    socket.emit("challenge:choose", { challengeId: challenge.id, prompt });
  };

  // AI Choosing Logic
  useEffect(() => {
    if (challenge.status === 'choosing' && challenge.minigameWinnerId === 'ai-friend') {
      const timer = setTimeout(() => {
        const prompts = Object.values(challenge.proposedPrompts);
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        socket.emit("challenge:choose", { challengeId: challenge.id, prompt: randomPrompt });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [challenge.status, challenge.minigameWinnerId, challenge.proposedPrompts, challenge.id, socket]);

  const submitProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      socket.emit("challenge:submit_proof", { 
        challengeId: challenge.id, 
        userId: myId, 
        proofUrl: base64String 
      });
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPhase = () => {
    switch (challenge.status) {
      case 'proposing':
        const hasProposed = !!challenge.proposedPrompts[myId];
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-bounce">
                <MessageSquare size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Propose a Mission</h3>
            <p className="text-slate-500 font-medium">What should your opponent do? Be creative!</p>
            
            {!hasProposed ? (
              <div className="space-y-4">
                <input 
                  value={proposal}
                  onChange={e => setProposal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitProposal()}
                  placeholder="Type mission and press Enter..."
                  className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition-all"
                />
                <div className="flex items-center justify-center gap-2 text-rose-500 font-black">
                  <Timer size={20} />
                  <span>{timeLeft}s remaining</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl text-emerald-700 font-bold">
                Waiting for opponent to propose...
              </div>
            )}
          </div>
        );

      case 'minigame':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Minigame Battle</h3>
              <p className="text-slate-500 font-medium">Winner chooses the final mission!</p>
            </div>
            <TicTacToe 
              myId={myId} 
              opponentId={opponentId} 
              socket={socket} 
              isMyTurn={isFromMe} 
              onWin={handleWin} 
            />
          </div>
        );

      case 'choosing':
        const isWinner = challenge.minigameWinnerId === myId;
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              {isWinner ? "You Won! Choose the Mission" : "Opponent is Choosing..."}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(challenge.proposedPrompts).map(([userId, prompt]) => (
                <button
                  key={userId}
                  disabled={!isWinner}
                  onClick={() => choosePrompt(prompt)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all ${
                    isWinner 
                    ? "border-indigo-100 hover:border-indigo-500 bg-indigo-50/30" 
                    : "border-slate-100 bg-slate-50 opacity-50"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {userId === myId ? "Your Proposal" : "Opponent's Proposal"}
                  </p>
                  <p className="text-lg font-bold text-slate-800">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'racing':
        return (
          <div className="space-y-8 text-center">
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">The Race is On!</h3>
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Target Mission</p>
                <p className="text-2xl font-bold">{challenge.finalPrompt}</p>
              </div>
              <div className="flex items-center justify-center gap-3 text-2xl font-black">
                <Timer size={32} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-500 font-medium">First one to send proof wins 150 points!</p>
              <label className="block w-full cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="user" 
                  className="hidden" 
                  onChange={submitProof}
                />
                <div className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  <Camera size={28} />
                  SEND SELFIE PROOF
                </div>
              </label>
            </div>
          </div>
        );

      case 'completed':
        const iWon = challenge.winnerId === myId;
        return (
          <div className="space-y-8 text-center py-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${iWon ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
              <Trophy size={40} />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-1">
                {iWon ? "VICTORY!" : "DEFEAT"}
              </h3>
              <p className="text-slate-500 font-bold">
                {iWon ? "+150 Points Earned" : "+20 Points Earned"}
              </p>
            </div>

            {challenge.proofUrl && challenge.proofUrl !== 'expired' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Winning Proof</p>
                <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-3xl overflow-hidden border-4 border-indigo-100 shadow-lg">
                  <img 
                    src={challenge.proofUrl} 
                    alt="Selfie Proof" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                      {challenge.winnerId === myId ? "You" : "Opponent"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              Back to Circle
            </button>
          </div>
        );

      case 'expired':
        return (
          <div className="space-y-8 text-center py-10">
            <div className="w-24 h-24 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <X size={48} />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">TIME EXPIRED</h3>
              <p className="text-slate-500 font-bold">Both players failed to complete the mission.</p>
              <p className="text-rose-500 font-black mt-2">+1 Point for effort</p>
            </div>
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-[60] animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-all border-2 border-white/20"
        >
          <Sword size={18} className="animate-pulse" />
          <span className="text-xs uppercase tracking-widest">Duel Active</span>
          <Maximize2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={() => setIsMinimized(true)}
          className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          title="Minimize"
        >
          <Minus size={24} />
        </button>
        {renderPhase()}
      </div>
    </div>
  );
};

export default ChallengeFlow;
