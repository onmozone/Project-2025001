
import { User, QuestionSet } from './types';

const USERS_KEY = 'exam_app_users';
const SETS_KEY = 'exam_app_question_sets';

const INITIAL_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  password: '123',
  role: 'admin',
  name: 'System Administrator'
};

const INITIAL_SETS: QuestionSet[] = [
  {
    id: 'set-1',
    title: 'পরিচিতি বিভাগ (নমুনা)',
    description: 'সাধারণ পরিচিতি এবং নিরাপত্তা সংক্রান্ত পরীক্ষা।',
    timeLimit: 5,
    isLive: true,
    questions: [
      {
        id: 'q1',
        text: 'কাজ শুরু করার আগে প্রথমে কী করা উচিত?',
        options: {
          A: 'দ্রুত কাজ শুরু করা',
          B: 'সঠিক ভাবে সুরক্ষা সরঞ্জাম ব্যবহার করা',
          C: 'সহজ কাজটি আগে করা',
          D: 'সবার জন্য অপেক্ষা করা এবং তারপর কাজ শুরু করা'
        },
        correctOption: 'B'
      }
    ]
  }
];

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [INITIAL_ADMIN];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  getQuestionSets: (): QuestionSet[] => {
    const data = localStorage.getItem(SETS_KEY);
    return data ? JSON.parse(data) : INITIAL_SETS;
  },
  saveQuestionSets: (sets: QuestionSet[]) => {
    localStorage.setItem(SETS_KEY, JSON.stringify(sets));
  },
  // Helper to ensure unique IDs
  generateId: () => Math.random().toString(36).substr(2, 9)
};
