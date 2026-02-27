
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, Gift, Edit3, Check } from 'lucide-react';
import { Message } from '../types';
import { getAIFriendResponse } from '../services/geminiService';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(aiName);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAI = friendId === 'ai-friend';

  useEffect(() => {
    if (isAI && messages.length === 0) {
      setMessages([{
        id: 'initial',
        senderId: 'ai-friend',
        text: `Hi, you are... in! I'm.... who am I?`,
        timestamp: Date.now()
      }]);
    }
  }, [isAI, messages.length]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (msg: Message) => {
      if (msg.senderId === friendId || msg.senderId === myId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [socket, friendId, myId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: myId,
      text: input,
      timestamp: Date.now()
    };

    if (isAI) {
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);
      
      const aiResponse = await getAIFriendResponse(input, "User", aiName, stats);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai-friend',
        text: aiResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    } else {
      socket.emit("send_message", {
        toId: friendId,
        fromId: myId,
        text: input
      });
      setInput("");
    }
  };

  const sendEmoji = (emoji: string) => {
    socket.emit("send_message", {
      toId: friendId,
      fromId: myId,
      emoji: emoji
    });
  };

  const sendGif = (url: string) => {
    socket.emit("send_message", {
      toId: friendId,
      fromId: myId,
      gifUrl: url
    });
  };

  return (
    <div className="flex flex-col h-[550px] lg:h-[650px] bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isEditingName && isAI ? (
            <div className="flex items-center gap-2">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-indigo-500"
                autoFocus
              />
              <button 
                onClick={() => {
                  setAiName(newName);
                  setIsEditingName(false);
                }}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Chat with {friendName}</h3>
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
        </div>
        {isAI && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">AI Companion</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === myId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${
              msg.senderId === myId 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
              {msg.emoji && <p className="text-3xl">{msg.emoji}</p>}
              {msg.gifUrl && <img src={msg.gifUrl} alt="gif" className="rounded-lg max-w-full" />}
              {msg.imageUrl && <img src={msg.imageUrl} alt="upload" className="rounded-lg max-w-full" />}
              <span className="text-[10px] opacity-50 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-tl-none p-3 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex gap-2 text-xl">
          <button onClick={() => sendEmoji("😊")} className="hover:scale-125 transition-transform">😊</button>
          <button onClick={() => sendEmoji("🔥")} className="hover:scale-125 transition-transform">🔥</button>
          <button onClick={() => sendEmoji("👍")} className="hover:scale-125 transition-transform">👍</button>
          <button onClick={() => sendGif("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKDkDbIDJieKbVm/giphy.gif")} className="text-slate-400 hover:text-indigo-600"><Gift size={18} /></button>
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-600"><ImageIcon size={20} /></button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
