
import { LevelTitle, ProfileDesign } from './types';

export const POINTS_PER_LEVEL = 500;

export const DEFAULT_DESIGNS: ProfileDesign[] = [
  {
    id: 'default',
    name: 'Classic Dark',
    author: 'System',
    price: 0,
    minLevel: 1,
    style: {
      bg: '#050505',
      border: 'rgba(255,255,255,0.05)',
      accent: 'bg-indigo-600',
      text: 'text-white',
      cardBg: '#1a1c23'
    }
  },
  {
    id: 'emerald-city',
    name: 'Emerald City',
    author: 'System',
    price: 500,
    minLevel: 3,
    style: {
      bg: '#022c22',
      border: 'rgba(16,185,129,0.2)',
      accent: 'bg-emerald-500',
      text: 'text-emerald-50',
      cardBg: '#064e3b'
    }
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    author: 'Community',
    price: 1200,
    minLevel: 5,
    style: {
      bg: '#451a03',
      border: 'rgba(249,115,22,0.2)',
      accent: 'bg-orange-500',
      text: 'text-orange-50',
      cardBg: '#78350f'
    }
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    author: 'Community',
    price: 2500,
    minLevel: 10,
    style: {
      bg: '#0f172a',
      border: 'rgba(6,182,212,0.5)',
      accent: 'bg-cyan-500',
      text: 'text-cyan-50',
      cardBg: '#1e293b'
    }
  },
  {
    id: 'classic-retro',
    name: 'Classic Retro',
    author: 'System',
    price: 3000,
    minLevel: 12,
    style: {
      bg: '#f8fafc',
      border: 'rgba(51,65,85,0.1)',
      accent: 'bg-slate-800',
      text: 'text-slate-900',
      cardBg: '#ffffff'
    }
  },
  {
    id: 'nineties-pop',
    name: "90's Pop",
    author: 'System',
    price: 3500,
    minLevel: 15,
    style: {
      bg: '#fdf2f8',
      border: 'rgba(219,39,119,0.2)',
      accent: 'bg-pink-500',
      text: 'text-pink-900',
      cardBg: '#fce7f3'
    }
  },
  {
    id: 'futuristic-void',
    name: 'Futuristic Void',
    author: 'System',
    price: 5000,
    minLevel: 20,
    style: {
      bg: '#020617',
      border: 'rgba(139,92,246,0.3)',
      accent: 'bg-violet-600',
      text: 'text-violet-100',
      cardBg: '#0f172a'
    }
  }
];

export const getLevelInfo = (level: number) => {
  if (level < 2) return { title: LevelTitle.WALLFLOWER, color: 'text-gray-500', bg: 'bg-gray-100' };
  if (level < 5) return { title: LevelTitle.OBSERVER, color: 'text-blue-500', bg: 'bg-blue-100' };
  if (level < 10) return { title: LevelTitle.CONVERSATIONALIST, color: 'text-green-500', bg: 'bg-green-100' };
  if (level < 20) return { title: LevelTitle.SOCIAL_BUTTERFLY, color: 'text-purple-500', bg: 'bg-purple-100' };
  return { title: LevelTitle.CHARISMA_MASTER, color: 'text-amber-500', bg: 'bg-amber-100' };
};

export const INITIAL_CHALLENGES = [
  {
    id: '1',
    title: 'Smile & Nod',
    description: 'Smile and give a friendly nod to one stranger today.',
    points: 50,
    difficulty: 'EASY',
    category: 'Non-verbal',
  },
  {
    id: '2',
    title: 'The Timekeeper',
    description: 'Ask someone the time, even if you have a phone.',
    points: 100,
    difficulty: 'MEDIUM',
    category: 'Conversation Starter',
  },
  {
    id: '3',
    title: 'Cashier Compliment',
    description: 'Compliment a cashier on something (their speed, their shirt, etc.).',
    points: 150,
    difficulty: 'MEDIUM',
    category: 'Small Talk',
  }
];
