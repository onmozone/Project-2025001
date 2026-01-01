
import { User, QuestionSet, QuizResult } from './types';

const USERS_KEY = 'exam_app_users';
const SETS_KEY = 'exam_app_question_sets';
const RESULTS_KEY = 'exam_app_results';

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
    title: 'NUR Exam - Physical Labor',
    category: 'পরিচিতি',
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
      },
      {
        id: 'q2',
        text: 'কোথাও আগুন লাগলে তুমি কি করবে?',
        options: {
          A: 'আগুন লাগলে দৌঁড়িয়ে পালিয়ে যাব',
          B: 'আগুন দেখতে পেয়ে লুকিয়ে পরব এবং কাউকে কিছু বলব না।',
          C: 'ফায়ার এক্সট্রাটিংগুইশার দিয়ে আগুন নেভানোর চেষ্টা করব',
          D: 'আগুনের ভিডিও করে সোশ্যাল মিডিয়ায় পোস্ট করব'
        },
        correctOption: 'C'
      },
      {
        id: 'q3',
        text: 'ছবিতে দেখানো যন্ত্রটির নাম কী?',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
        options: {
          A: 'ফায়ার সিলিন্ডার',
          B: 'হ্যান্ড প্যালেট জ্যাক',
          C: 'প্লাটফর্ম ট্রলি',
          D: 'মই'
        },
        correctOption: 'C'
      },
      {
        id: 'q4',
        text: 'ভারী বস্তু তোলার সময় শরীরের কোন অংশ সোজা রাখা উচিত?',
        options: {
          A: 'হাত',
          B: 'পা',
          C: 'পিঠ',
          D: 'মাথা'
        },
        correctOption: 'C'
      },
      {
        id: 'q5',
        text: 'অফিসের সরঞ্জাম স্থানান্তরের জন্য ছবিতে প্রদর্শিত কোন যন্ত্রটি ব্যবহার করতে হবে?',
        imageUrl: 'https://images.unsplash.com/photo-1620352011749-317a3f81e649?q=80&w=1000&auto=format&fit=crop',
        options: {
          A: 'প্লাটফর্ম ট্রলি',
          B: 'হ্যান্ড প্যালেট জ্যাক',
          C: 'ফর্কলিফট',
          D: 'ক্রেন'
        },
        correctOption: 'B'
      }
    ]
  }
];

export const db = {
  getUsers: async (): Promise<User[]> => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [INITIAL_ADMIN];
  },
  saveUsers: async (users: User[]): Promise<void> => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  getQuestionSets: async (): Promise<QuestionSet[]> => {
    const data = localStorage.getItem(SETS_KEY);
    return data ? JSON.parse(data) : INITIAL_SETS;
  },
  saveQuestionSets: async (sets: QuestionSet[]): Promise<void> => {
    localStorage.setItem(SETS_KEY, JSON.stringify(sets));
  },
  getQuizResults: async (): Promise<QuizResult[]> => {
    const data = localStorage.getItem(RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveQuizResult: async (result: QuizResult): Promise<void> => {
    const results = await db.getQuizResults();
    results.push(result);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  },
  generateId: () => Math.random().toString(36).substr(2, 9)
};
