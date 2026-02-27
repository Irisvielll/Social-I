
import React from 'react';
import { LevelTitle } from './types';

export const POINTS_PER_LEVEL = 500;

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
