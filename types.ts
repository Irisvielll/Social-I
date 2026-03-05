
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: Difficulty;
  category: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  suggestedPoints: number;
  votes: number;
  timestamp: number;
}

export interface ProfileDesign {
  id: string;
  name: string;
  author: string;
  price: number;
  minLevel: number;
  previewUrl?: string;
  style: {
    bg: string;
    border: string;
    accent: string;
    text: string;
    cardBg: string;
  };
}

export interface UserStats {
  points: number;
  level: number;
  streak: number;
  completedCount: number;
  skippedCount: number;
  hearts: number;
  isDarkMode: boolean;
  history: ChallengeResult[];
  aiName?: string;
  isAiNamed?: boolean;
  userName?: string;
  language?: string;
  profilePic?: string;
  unlockedDesigns?: string[];
  customDesigns?: ProfileDesign[];
  activeDesignId?: string;
  rank?: string;
}

export interface ChallengeResult {
  challenge: Challenge;
  status: 'completed' | 'skipped' | 'failed';
  timestamp: number;
  pointsAwarded: number;
}

export enum LevelTitle {
  WALLFLOWER = 'Wallflower',
  OBSERVER = 'Quiet Observer',
  CONVERSATIONALIST = 'Budding Conversationalist',
  SOCIAL_BUTTERFLY = 'Social Butterfly',
  CHARISMA_MASTER = 'Charisma Master'
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  emoji?: string;
  gifUrl?: string;
  timestamp: number;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  isOnline: boolean;
}

export interface SocialChallenge {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  status: 'pending' | 'proposing' | 'minigame' | 'choosing' | 'racing' | 'completed' | 'expired' | 'rejected';
  proposedPrompts: { [userId: string]: string };
  finalPrompt?: string;
  minigameWinnerId?: string;
  winnerId?: string;
  proofUrl?: string;
  startTime?: number;
  endTime?: number;
}
