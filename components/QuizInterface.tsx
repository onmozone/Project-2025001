
import React, { useState, useEffect, useCallback } from 'react';
import { User, QuestionSet, Question } from '../types';

interface QuizInterfaceProps {
  user: User;
  questionSet: QuestionSet;
  onFinish: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ user, questionSet, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questionSet.timeLimit * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Prevention of back/refresh (Simulated)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionKey: string) => {
    const questionId = questionSet.questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const nextQuestion = () => {
    if (currentIndex < questionSet.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questionSet.questions[currentIndex];
  const progressPercent = Math.round((Object.keys(answers).length / questionSet.questions.length) * 100);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#e9ecef]">
      {/* Header */}
      <header className="bg-[#002b21] text-white p-3 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <span className="text-sm font-bold">পৃষ্ঠা: {currentIndex + 1}</span>
          <span className="text-xs opacity-80">বিভাগ: {questionSet.title}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <svg className="w-8 h-8 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <div className="flex flex-col">
               <span className="text-[10px] opacity-70">পরিচিতির জন্য সময় অবশিষ্ট:</span>
               <span className="text-xl font-mono font-bold leading-none">{formatTime(timeLeft)}</span>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] opacity-70">অতিবাহিত {progressPercent}%</span>
             <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
             </div>
          </div>

          <button 
            onClick={() => setShowConfirmModal(true)}
            className="bg-[#d9534f] hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold shadow-inner transition-colors"
          >
            পরীক্ষা সমাপ্ত...
          </button>
        </div>
      </header>

      {/* Info Bar */}
      <div className="bg-white px-4 py-1 text-[11px] font-bold text-gray-700 border-b flex justify-between">
        <span>পরীক্ষা: {questionSet.title}</span>
        <span>পরীক্ষার্থী: {user.name}</span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 bg-white border-r overflow-y-auto sidebar-scroll flex flex-col items-center py-4 gap-2">
          {questionSet.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold transition-all relative
                ${currentIndex === idx ? 'bg-[#007b8a] text-white' : 'bg-[#e9ecef] text-gray-600 hover:bg-gray-300'}
                ${answers[q.id] ? 'after:content-[""] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full' : ''}
              `}
            >
              {idx + 1}
              {currentIndex === idx && (
                <div className="absolute left-full ml-1 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-[#007b8a]"></div>
              )}
            </button>
          ))}
        </aside>

        {/* Question Area */}
        <main className="flex-1 bg-white m-4 rounded shadow-sm flex flex-col p-8 overflow-y-auto border border-gray-200">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            <h2 className="text-xl font-bold text-[#004d40]">
              {currentIndex + 1}. {currentQuestion.text}
            </h2>

            {currentQuestion.imageUrl && (
              <div className="flex justify-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                <img src={currentQuestion.imageUrl} alt="Question Graphic" className="max-h-64 object-contain rounded" />
              </div>
            )}

            <div className="space-y-3">
              {(Object.keys(currentQuestion.options) as Array<'A'|'B'|'C'|'D'>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  className={`
                    w-full flex items-stretch text-left border rounded transition-all group
                    ${answers[currentQuestion.id] === key ? 'border-[#004d40] ring-1 ring-[#004d40] bg-teal-50' : 'border-gray-300 hover:border-[#004d40]'}
                  `}
                >
                  <div className={`px-4 py-3 font-bold border-r ${answers[currentQuestion.id] === key ? 'bg-[#004d40] text-white' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                    {key}
                  </div>
                  <div className="px-6 py-3 flex-1">
                    {currentQuestion.options[key]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-[#002b21] p-3 flex justify-end gap-3 border-t border-teal-900">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-2 bg-[#d1d5db] hover:bg-gray-300 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors"
        >
          &lt; ফেরত যান
        </button>
        <button
          onClick={nextQuestion}
          disabled={currentIndex === questionSet.questions.length - 1}
          className="flex items-center gap-2 px-6 py-2 bg-[#d1d5db] hover:bg-gray-300 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors"
        >
          এগিয়ে যান &gt;
        </button>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#444] text-white p-3 flex justify-between items-center text-sm">
               <span>চূড়ান্ত নিশ্চিতকরণ</span>
               <div className="flex items-center gap-1 font-mono">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                 {formatTime(timeLeft)}
               </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center space-y-6">
               <div className="w-16 h-16 rounded-full border-4 border-[#007b8a] flex items-center justify-center">
                  <span className="text-[#007b8a] text-4xl font-bold">?</span>
               </div>
               <p className="text-gray-700 font-bold">আপনি যদি পরীক্ষার সমাপ্ত করেন ফিরে আসতে পারবেন না</p>
               
               <div className="flex gap-4 w-full">
                 <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2"
                 >
                   ✕ বাতিল করুন
                 </button>
                 <button 
                  onClick={onFinish}
                  className="flex-1 py-3 px-4 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2"
                 >
                   ✓ হ্যাঁ, শুরু করুন
                 </button>
               </div>
            </div>
            <div className="px-4 py-2 text-[10px] text-right text-gray-400">Prometric</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizInterface;
