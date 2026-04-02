export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  education: string;
  employment?: string;
  interests?: string;
  ambition?: string;
  language?: string;
  createdAt: any;
  points: number;
  completedMilestones: string[];
  level: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  points: number;
  order: number;
}

export interface Roadmap {
  id: string;
  userId: string;
  milestones: Milestone[];
  timestamp: any;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'book' | 'note' | 'yearbook' | 'other';
  imageUrl?: string;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  status: 'pending' | 'shipped' | 'delivered';
  timestamp: any;
}

export interface Analysis {
  id: string;
  userId: string;
  fileName: string;
  analysisResult: string;
  timestamp: any;
  status?: 'pending' | 'verified' | 'rejected';
  verificationDetails?: string;
}

export interface MockTest {
  id: string;
  userId: string;
  title: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  score?: number;
  totalQuestions: number;
  timestamp: any;
  completed: boolean;
}

export interface FocusTask {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  timestamp: any;
}

export interface Guidance {
  id: string;
  userId: string;
  recommendations: string;
  sources: any[];
  timestamp: any;
}
