
import React, { useState } from 'react';
import { db } from '../data';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoggingIn(true);
  //   setError('');

  //   try {
  //     const users = await db.getUsers();
  //     const user = users.find(u => u.username === username && u.password === password);

  //     if (user) {
  //       onLogin(user);
  //     } else {
  //       setError('ভুল আইডি অথবা পাসওয়ার্ড');
  //     }
  //   } catch (err) {
  //     setError('সার্ভার ত্রুটি, আবার চেষ্টা করুন');
  //   } finally {
  //     setIsLoggingIn(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Use the new specific login function
      const user = await db.loginUser(username, password);

      if (user) {
        onLogin(user);
      } else {
        setError('ভুল আইডি অথবা পাসওয়ার্ড');
      }
    } catch (err) {
      setError('সার্ভার ত্রুটি, আবার চেষ্টা করুন');
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#004d40] p-6 text-center">
          <h1 className="text-2xl font-bold text-white">অনলাইন পরীক্ষা সিস্টেম</h1>
          <p className="text-teal-100 mt-2">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইউজার আইডি</label>
            <input
              type="text"
              required
              disabled={isLoggingIn}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition-all outline-none disabled:bg-gray-100"
              placeholder="আপনার আইডি লিখুন"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              disabled={isLoggingIn}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition-all outline-none disabled:bg-gray-100"
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#004d40] hover:bg-[#00332c] text-white font-semibold py-3 rounded transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoggingIn && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            প্রবেশ করুন
          </button>
        </form>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">

          <p className="text-xs text-gray-200">v 1.1.9</p>
          <p className="text-xs text-gray-500">© ২০২৬ ONMOEON সর্বস্বত্ব সংরক্ষিত।</p>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
