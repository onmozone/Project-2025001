
import React, { useState, useEffect } from 'react';
import { User, QuestionSet } from '../types';

interface ConfirmationPageProps {
  user: User;
  activeSet: QuestionSet | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ user, activeSet, onConfirm, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#dbdbdb] overflow-hidden">
      <div className="w-full max-w-[1150px] flex-1 flex flex-col bg-white border-x border-gray-400 shadow-2xl overflow-hidden relative">
        <div className="bg-[#444] text-white p-3 flex justify-between items-center text-sm font-bold shadow-md">
          <span>বিবরণী নিশ্চিত করুন</span>
          <div className="flex items-center gap-1 font-mono text-yellow-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="flex items-center gap-2 mb-10">
            <div className="text-right">
              <p className="text-[#004d40] font-bold text-xl leading-tight">الاعتماد المهني</p>
              <p className="text-[#004d40] text-xs font-bold leading-tight">Professional Accreditation</p>
            </div>
            <div className="w-12 h-12 bg-orange-400 rounded-tr-full rounded-bl-full transform rotate-45 shadow-sm"></div>
          </div>

          <div className="w-full max-w-2xl border border-green-400 rounded-md p-10 bg-white shadow-sm mb-8">
            <div className="grid grid-cols-[140px_1fr] gap-y-6 text-[16px]">
              <span className="font-extrabold text-gray-900">পদবি:</span>
              <span className="text-gray-700 font-bold">{user.position || 'N/A'}</span>

              <span className="font-extrabold text-gray-900">নাম:</span>
              <span className="text-gray-700 uppercase font-bold">{user.name}</span>

              <span className="font-extrabold text-gray-900">পরীক্ষার নাম:</span>
              <span className="text-gray-700 font-bold">{activeSet?.title || 'N/A'}</span>

              <span className="font-extrabold text-gray-900">ভাষা:</span>
              <span className="text-gray-700 font-bold">{user.language || 'বাংলা'}</span>
            </div>
          </div>

          <p className="text-lg font-bold text-gray-800 mb-8">উপরের বিবরণী কি সঠিক?</p>

          <div className="flex gap-6">
            <button onClick={onConfirm} className="bg-[#007b8a] text-white px-10 py-2.5 rounded flex items-center gap-2 font-bold hover:bg-[#006a77] transition-all shadow-lg">✓ নিশ্চিত করুন</button>
            <button onClick={onCancel} className="bg-[#007b8a] text-white px-10 py-2.5 rounded flex items-center gap-2 font-bold hover:bg-[#006a77] transition-all shadow-lg">✕ বাতিল করুন</button>
          </div>
        </div>

        <div className="px-6 py-3 text-[10px] text-right text-gray-400 border-t border-gray-100 flex justify-end">
          <span className="opacity-50 font-mono">Prometric Systems</span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
