
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  isLive: boolean;
  questions: Question[];
}

export interface QuizState {
  currentSet: QuestionSet | null;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionKey
  startTime: number | null;
  timeLeft: number; // in seconds
  isFinished: boolean;
  isStarted: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
