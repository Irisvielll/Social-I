
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
      bg: 'bg-[#050505]',
      border: 'border-white/5',
      accent: 'bg-indigo-600',
      text: 'text-white',
      cardBg: 'bg-[#1a1c23]'
    }
  },
  {
    id: 'emerald-city',
    name: 'Emerald City',
    author: 'System',
    price: 500,
    minLevel: 3,
    style: {
      bg: 'bg-[#022c22]',
      border: 'border-emerald-500/20',
      accent: 'bg-emerald-500',
      text: 'text-emerald-50',
      cardBg: 'bg-[#064e3b]'
    }
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    author: 'Community',
    price: 1200,
    minLevel: 5,
    style: {
      bg: 'bg-[#451a03]',
      border: 'border-orange-500/20',
      accent: 'bg-orange-500',
      text: 'text-orange-50',
      cardBg: 'bg-[#78350f]'
    }
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    author: 'Community',
    price: 2500,
    minLevel: 10,
    style: {
      bg: 'bg-[#0f172a]',
      border: 'border-cyan-500/50',
      accent: 'bg-cyan-500',
      text: 'text-cyan-50',
      cardBg: 'bg-[#1e293b]'
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
