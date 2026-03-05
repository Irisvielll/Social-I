
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, Gift, Edit3, Check, MoreHorizontal } from 'lucide-react';
import { Message } from '../types';
import { getAIFriendResponse, translateText } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, TRANSLATIONS } from '../translations';

interface ChatProps {
  friendId: string;
  friendName: string;
  myId: string;
  socket: any;
  stats: any;
  aiName: string;
  setAiName: (name: string) => void;
}

const Chat: React.FC<ChatProps> = ({ friendId, friendName, myId, socket, stats, aiName, setAiName }) => {
  const t = TRANSLATIONS[stats.language as Language] || TRANSLATIONS.English;
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`chat_history_${friendId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(aiName);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAI = friendId === 'ai-friend';

  useEffect(() => {
    localStorage.setItem(`chat_history_${friendId}`, JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, friendId]);

  useEffect(() => {
    if (isAI && messages.length === 0) {
      setMessages([{
        id: 'initial',
        senderId: 'ai-friend',
        text: `Hi ${stats.userName || 'there'}! I'm ${aiName}. I'm so excited to help you build your social confidence! What's on your mind today?`,
        timestamp: Date.now()
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAI, aiName, stats.userName]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = async (msg: Message) => {
      if (msg.senderId === friendId || msg.senderId === myId) {
        // Automatic Translation for Social Chat
        if (!isAI && msg.senderId !== myId && msg.text) {
          const translated = await translateText(msg.text, stats.language || 'English');
          msg.text = translated;
        }
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message");
  }, [socket, friendId, myId, isAI, stats.language]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: myId,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    if (isAI) {
      setIsTyping(true);
      try {
        const aiResponse = await getAIFriendResponse(input, stats.userName || "User", aiName, stats, messages.concat(userMsg));
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'ai-friend',
          text: aiResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (err) {
        console.error("AI Error:", err);
      } finally {
        setIsTyping(false);
      }
    } else {
      socket.emit("send_message", {
        toId: friendId,
        fromId: myId,
        text: input
      });
    }
  };

  const sendEmoji = (emoji: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      senderId: myId,
      emoji: emoji,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    if (!isAI) {
      socket.emit("send_message", { toId: friendId, fromId: myId, emoji });
    }
  };

  return (
    <div className="flex flex-col h-[550px] lg:h-[700px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 dark:shadow-none">
            {friendName[0]}
          </div>
          <div>
            {isEditingName && isAI ? (
              <div className="flex items-center gap-2">
                <input 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setAiName(newName);
                    setIsEditingName(false);
                  }}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 dark:text-white tracking-tight">{friendName}</h3>
                {isAI && (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.online}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAI && <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">{t.aiCompanion}</span>}
          <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === myId;
            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
            
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {!isMe && showAvatar && (
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 mb-1">
                    {friendName[0]}
                  </div>
                )}
                {!isMe && !showAvatar && <div className="w-8 shrink-0" />}
                
                <div className={`max-w-[75%] group relative ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    {msg.emoji && <p className="text-4xl py-1">{msg.emoji}</p>}
                    {msg.gifUrl && <img src={msg.gifUrl} alt="gif" className="rounded-xl max-w-full shadow-md" referrerPolicy="no-referrer" />}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="upload" className="rounded-xl max-w-full shadow-md" referrerPolicy="no-referrer" />}
                  </div>
                  <span className={`text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start items-end gap-2"
          >
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 mb-1">
              {friendName[0]}
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 shadow-sm">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex gap-4 px-2">
          {["😊", "🔥", "👍", "✨", "🙌"].map(emoji => (
            <button 
              key={emoji}
              onClick={() => sendEmoji(emoji)} 
              className="text-xl hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
          <button className="text-slate-400 hover:text-indigo-600 transition-colors ml-auto">
            <Gift size={20} />
          </button>
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
              <ImageIcon size={20} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${t.message} ${friendName}...`}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Smile size={20} />
            </button>
          </div>
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-90 disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
