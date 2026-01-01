
import React, { useState, useEffect } from 'react';
import { User, QuestionSet } from '../types';

interface InstructionsProps {
  user: User;
  activeSet: QuestionSet | null;
  onStart: () => void;
  onLogout: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ user, activeSet, onStart, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState(activeSet ? activeSet.timeLimit * 60 : 300);
  
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#dbdbdb] overflow-hidden">
      <div className="w-full max-w-[1150px] flex-1 flex flex-col bg-white border-x border-gray-400 shadow-2xl overflow-hidden relative">
        
        {/* Dark Header */}
        <header className="bg-[#0e2a1e] text-white p-3 flex justify-between items-center shadow-md">
          <div className="flex flex-col">
            <span className="text-sm font-bold">পৃষ্ঠা: ১</span>
            <span className="text-xs opacity-80">বিভাগ: {activeSet?.category || 'পরিচিতি'}</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] opacity-70">পরিচিতির জন্য সময় অবশিষ্ট:</span>
                 <span className="text-xl font-mono font-bold leading-none text-yellow-400">{formatTime(timeLeft)}</span>
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-2">
                 <span className="text-[10px] opacity-70">অতিবাহিত ১%</span>
                 <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                   <div className="h-full bg-green-500" style={{ width: `1%` }}></div>
                 </div>
               </div>
            </div>

            <button 
              onClick={onLogout}
              className="bg-[#d34734] hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors shadow-md"
            >
              পরীক্ষা সমাপ্ত...
            </button>
          </div>
        </header>

        {/* Sub Header */}
        <div className="bg-[#f8f9fa] border-b px-4 py-1.5 text-[11px] font-bold text-gray-700 flex justify-between">
          <span>পরীক্ষা: {activeSet?.title.split(' ')[0] || 'NUR'}</span>
          <span>পরীক্ষার্থী: {user.name}</span>
        </div>

        {/* Instruction Content */}
        <main className="flex-1 overflow-y-auto p-12 bg-white relative">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-start">
               <svg className="w-20 h-20 text-black transform -rotate-90" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M16 5V11H21L12 21L3 11H8V5H16Z" />
               </svg>
            </div>

            <div className="space-y-6 text-gray-900 text-xl font-medium leading-relaxed">
              <p className="font-bold text-2xl">সময় বাকি আছে,</p>
              <p className="flex items-center gap-2">
                এই আইকন <svg className="w-6 h-6 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg> কি পরিমান সময় বাকি আছে তা নির্দেশ করে। পরীক্ষা বিভাগের ৩০ মিনিটের একটি টাইমার রয়েছে।
              </p>
              <p className="font-bold border-b-2 border-black inline-block pb-1">পরীক্ষার মধ্য দিয়ে নেভিগেট করা হয়।</p>
              <p>পরবর্তী প্রশ্ন যাওয়ার জন্য <span className="text-[#007b8a] font-bold">"এগিয়ে যান" &gt;</span> বাটনে ক্লিক করুন।</p>
              <p>আগের প্রশ্নে ফিরে যাওয়ার জন্য <span className="text-[#007b8a] font-bold">&lt; "ফেরত যান"</span> বাটনে ক্লিক করুন।</p>
              <p className="font-bold border-b-2 border-black inline-block pb-1">প্রশ্নগুলির উত্তর দেওয়া।</p>
              <p>সঠিক উত্তর নির্বাচন করার জন্য অপশনগুলির মধ্যে থেকে আপনার ধারণা অনুযায়ী সঠিক উত্তরটি নির্বাচন করুন এবং পরবর্তী ধাপে এগিয়ে যান।</p>
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="absolute bottom-6 right-12 bg-black text-white px-5 py-2.5 rounded-md shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <span>এই পৃষ্ঠাটির স্ক্রলিং প্রয়োজন</span>
            <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
              <div className="w-1 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#0e2a1e] p-3 border-t border-teal-900 flex justify-end">
          <button 
            onClick={onStart}
            className="bg-[#cbd5e0] hover:bg-gray-200 text-gray-900 px-10 py-2 rounded-md font-bold text-sm transition-colors flex items-center gap-2 shadow-inner"
          >
            পরীক্ষা শুরু করুন &gt;
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Instructions;
