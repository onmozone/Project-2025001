
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

  const toBnNumber = (num: number) =>
    num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);

  useEffect(() => {
    if (activeSet) {
      setTimeLeft(activeSet.timeLimit * 60);
    }
  }, [activeSet]);

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
      <div className="w-full max-w-[60vw] max-h-[93vh] flex-1 flex flex-col bg-white border-x border-gray-400 shadow-2xl overflow-hidden relative">

        {/* Dark Header */}
        <header className="bg-[#0e2a1e] text-white p-3 flex justify-between items-center shadow-md">
          <div className="flex flex-col">
            <span className="text-sm font-bold">পৃষ্ঠা: ১</span>
            <span className="text-xs opacity-80">বিভাগ: {activeSet?.category || 'পরিচিতি'}</span>
          </div>

          <div className="flex items-center gap-24">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-70">পরিচিতির জন্য সময় অবশিষ্ট:</span>
                <span className="text-xl font-mono font-bold leading-none text-yellow-400">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">

              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-green-500" style={{ width: `1%` }}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] opacity-90">অতিবাহিত ১%</span>
              </div>

            </div>

            <button
              onClick={onLogout}
              className="bg-[#d34734] hover:bg-red-700 text-white px-5 py-1.5 rounded-md text-sm font-bold transition-colors shadow-md"
            >
              পরীক্ষা সমাপ্ত...
            </button>
          </div>
        </header>

        {/* Info Bar */}
        <div className="bg-[#f8f9fa] px-4 py-1.5 text-[11px] font-bold text-gray-800 border-b flex justify-between">
          <div className="flex gap-1">
            <span>পরীক্ষা:</span>
            <span className="text-black font-extrabold uppercase"> {activeSet?.title.split(' ')[0] || 'Exam Name'}</span>
          </div>
          <div className="flex gap-1">
            <span>পরীক্ষার্থী:</span>
            <span className="text-black font-extrabold uppercase"> {user.name}</span>
          </div>
        </div>

        {/* Instruction Content */}
        <main className="flex-1 overflow-y-auto p-10 bg-white relative">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-start">
              <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 35 90 
                          V 55 
                          L 65 25 
                          L 55 15 
                          H 90 
                          V 50 
                          L 80 40 
                          L 50 70 
                          V 90 
                          Z"
                  fill="black" />
              </svg>

            </div>

            <div className="space-y-6 text-gray-900 text-lg font-medium leading-relaxed">
              <p className="font-bold text-xl">সময় বাকি আছে,</p>
              <p className="leading-relaxed">
                এই আইকন
                <svg
                  className="w-6 h-6 inline align-middle mx-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                কি পরিমান সময় বাকি আছে তা নির্দেশ করে। পরীক্ষা বিভাগের {" "} {activeSet ? toBnNumber(activeSet.timeLimit) : '৩০'}
                {" "}মিনিটের একটি টাইমার রয়েছে।
              </p>


              <p className="font-bold border-b-2 border-black inline-block pb-1">পরীক্ষার মধ্য দিয়ে নেভিগেট করা হয়।</p>
              <p>পরবর্তী প্রশ্ন যাওয়ার জন্য <span className="text-[#007b8a] font-bold">"এগিয়ে যান" &gt;</span> বাটনে ক্লিক করুন।</p>
              <p>আগের প্রশ্নে ফিরে যাওয়ার জন্য <span className="text-[#007b8a] font-bold">&lt; "ফেরত যান"</span> বাটনে ক্লিক করুন।</p>
              <p className="font-bold border-b-2 border-black inline-block pb-1">প্রশ্নগুলির উত্তর দেওয়া।</p>
              <p>সঠিক উত্তর নির্বাচন করার জন্য অপশনগুলির মধ্যে থেকে আপনার ধারণা অনুযায়ী সঠিক উত্তরটি নির্বাচন করুন এবং পরবর্তী ধাপে এগিয়ে যান।</p>
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="fixed bottom-[13vh] right-[20.5vw] bg-black text-white px-5 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce cursor-default select-none z-10">
            <span>এই পৃষ্ঠাটির স্ক্রলিং প্রয়োজন</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>


          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#0e2a1e] p-3 flex justify-end gap-3 border-t border-teal-900">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-8 py-1.5 bg-[#cbd5e0] hover:bg-gray-100 text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-md font-bold text-sm"
          >
            পরীক্ষা শুরু করুন &gt;
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Instructions;
