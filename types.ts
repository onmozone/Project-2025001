
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  position?: string;
  language?: string;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D?: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  category?: string;
  timeLimit: number;
  isLive: boolean;
  questions: Question[];
}

export interface QuizResult {
  id: string;
  userId: string;
  examId: string;
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
