
import React, { useState, useEffect } from 'react';
import { User, QuestionSet } from '../types';
import { db } from '../data';

interface QuizInterfaceProps {
  user: User;
  questionSet: QuestionSet;
  onFinish: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ user, questionSet, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questionSet.timeLimit * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (isFinished) return;
    
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      const autoSubmit = setTimeout(() => {
        setIsFinished(true);
        setIsTimeUp(false);
      }, 3000);
      return () => clearTimeout(autoSubmit);
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.max(0, seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionKey: string) => {
    if (isFinished) return;
    const questionId = questionSet.questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let correctCount = 0;
      questionSet.questions.forEach(q => {
          if (answers[q.id] === q.correctOption) {
              correctCount++;
          }
      });

      await db.saveQuizResult({
          id: db.generateId(),
          userId: user.id,
          examId: questionSet.id,
          examTitle: questionSet.title,
          totalQuestions: questionSet.questions.length,
          correctAnswers: correctCount,
          timestamp: Date.now()
      });

      onFinish();
    } catch (error) {
      console.error('Failed to submit exam', error);
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questionSet.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questionSet.questions.length) * 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#dbdbdb] overflow-hidden h-screen">
      <div className="w-full max-w-[1150px] flex-1 flex flex-col bg-white border-x border-gray-400 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-[#0e2a1e] text-white p-3 flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold">পৃষ্ঠা: {showInstructions ? 'নির্দেশনা' : (isFinished ? 1 : currentIndex + 1)}</span>
            <span className="text-xs opacity-90">বিভাগ: {questionSet.category || 'পরিচিতি'}</span>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] opacity-70">পরিচিতির জন্য সময় অবশিষ্ট:</span>
                 <span className={`text-xl font-mono font-bold leading-none ${timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400'}`}>
                    {formatTime(timeLeft)}
                 </span>
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
               <div className="flex items-center gap-2">
                 <div className="w-32 h-2.5 bg-gray-600 rounded-full overflow-hidden border border-gray-500">
                   <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${isFinished ? 100 : progressPercent}%` }}></div>
                 </div>
                 <span className="text-[10px] opacity-90 whitespace-nowrap">অতিবাহিত {isFinished ? '১০০' : progressPercent}%</span>
               </div>
            </div>

            <button 
              onClick={() => !isFinished && setShowConfirmModal(true)}
              disabled={isFinished}
              className={`px-5 py-1.5 rounded-md text-sm font-bold shadow-lg transition-all ${isFinished ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#d34734] hover:bg-red-700 text-white'}`}
            >
              পরীক্ষা সমাপ্ত...
            </button>
          </div>
          <div className="w-20"></div>
        </header>

        {/* Info Bar */}
        <div className="bg-[#f8f9fa] px-4 py-1.5 text-[11px] font-bold text-gray-800 border-b flex justify-between">
          <div className="flex gap-1">
            <span>পরীক্ষা:</span>
            <span className="text-black font-extrabold uppercase">{questionSet.title.split(' ')[0]}</span>
          </div>
          <div className="flex gap-1">
            <span>পরীক্ষার্থী:</span>
            <span className="text-black font-extrabold uppercase">{user.name}</span>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden relative bg-white">
          
          {isFinished ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-700">
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-3xl font-bold text-[#2d3748] leading-tight">থিউরিটিক্যাল পরীক্ষার সমাপ্ত হয়েছে</h2>
                <h3 className="text-2xl font-bold text-[#2d3748]">এখন ব্যবহারকারী পরীক্ষার জন্য জমা দিন</h3>
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar */}
              <aside className="w-16 border-r flex flex-col items-center py-4 gap-2 sidebar-scroll overflow-y-auto">
                {questionSet.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => { setShowInstructions(false); setCurrentIndex(idx); }}
                    className={`
                      w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold transition-all
                      ${!showInstructions && currentIndex === idx ? 'bg-[#007b8a] text-white' : 'bg-[#f0f0f0] text-gray-600 hover:bg-gray-200'}
                      ${answers[q.id] ? 'relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-600 after:rounded-full after:border after:border-white' : ''}
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setShowInstructions(true)}
                  className={`mt-2 w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold transition-all ${showInstructions ? 'bg-[#007b8a] text-white' : 'bg-purple-700 text-white'}`}
                >
                  i
                </button>
              </aside>

              {/* Content Area */}
              <main className="flex-1 p-6 relative overflow-y-auto">
                {showInstructions ? (
                  <div className="w-full max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                    <h2 className="text-xl font-bold text-[#1a2b3c] leading-snug">
                       আপনি যদি আপনার পরীক্ষা সম্পূর্ণ করাতে খুশি হয়ে থাকেন তাহলে উপরের <span className="text-red-500">"পরীক্ষার সমাপ্ত" &gt;</span> বাটনে ক্লিক করুন
                    </h2>
                    <h3 className="text-lg font-bold">
                       যদি মনে হয় আপনার পরীক্ষা শেষ হয়নি তাহলে <span className="text-teal-600">&lt; "ফেরত যান"</span> বাটনে ক্লিক করুন
                    </h3>
                    <p className="font-bold text-xl border-b border-black inline-block pb-1">পরীক্ষাটি সমাপ্ত করতে নিচের স্ক্রিনশটগুলো ফলো করুন</p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-4">
                       <div className="border border-gray-300 p-2 rounded shadow-md bg-white">
                          <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop" className="w-full h-auto" alt="Instruction step 1"/>
                          <p className="text-center text-xs mt-3 font-bold text-gray-600">বিবরণী নিশ্চিত করুন</p>
                       </div>
                       <div className="border border-gray-300 p-2 rounded shadow-md bg-white">
                          <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop" className="w-full h-auto" alt="Instruction step 2"/>
                          <p className="text-center text-xs mt-3 font-bold text-gray-600">চূড়ান্ত নিশ্চিতকরণ</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full border border-[#cbd5e0] rounded-sm p-8 flex flex-col space-y-6">
                    <h2 className="text-xl font-bold text-[#1a202c]">
                      {currentIndex + 1}. {currentQuestion.text}
                    </h2>

                    {currentQuestion.imageUrl && (
                      <div className="w-full max-w-2xl mx-auto border border-gray-200 rounded p-1 bg-gray-50 flex items-center justify-center">
                        <img src={currentQuestion.imageUrl} className="max-w-full h-auto object-contain max-h-[400px] rounded-sm" alt="Question visual context"/>
                      </div>
                    )}

                    <div className="space-y-4">
                      {(Object.keys(currentQuestion.options) as Array<'A'|'B'|'C'|'D'>).map((key) => (
                        currentQuestion.options[key] && (
                          <button
                            key={key}
                            onClick={() => handleOptionSelect(key)}
                            className={`
                              w-full flex items-stretch text-left border rounded-sm transition-all group overflow-hidden
                              ${answers[currentQuestion.id] === key 
                                ? 'border-[#007b8a] bg-[#ffffd0] ring-1 ring-[#007b8a]' 
                                : 'border-gray-800 hover:border-[#007b8a]'}
                            `}
                          >
                            <div className={`px-5 py-3 font-bold border-r border-gray-400 min-w-[60px] flex items-center justify-center ${answers[currentQuestion.id] === key ? 'bg-[#cbd5e0]' : 'bg-[#f8f9fa]'}`}>
                              {key}
                            </div>
                            <div className="px-6 py-3 flex-1 text-[16px] font-medium flex items-center text-[#1a202c]">
                              {currentQuestion.options[key]}
                            </div>
                          </button>
                        )
                      ))}
                    </div>

                    <div className="fixed bottom-24 right-12 bg-black text-white px-5 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce cursor-default select-none">
                      <span>এই পৃষ্ঠাটির স্ক্রলিং প্রয়োজন</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                    </div>
                  </div>
                )}
              </main>
            </>
          )}

          {/* Time Up Overlay */}
          {isTimeUp && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex items-center justify-center z-[70]">
               <div className="bg-[#e74c3c] text-white p-10 rounded-lg shadow-[0_20px_50px_rgba(231,76,60,0.3)] flex flex-col items-center text-center space-y-4 w-[400px] border-2 border-red-500 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-2 shadow-xl">
                    <svg className="w-12 h-12 text-[#e74c3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-black">সময় শেষ!</h3>
                  <p className="text-xl font-bold opacity-95">পরীক্ষা স্বয়ংক্রিয়ভাবে জমা দেওয়া হচ্ছে...</p>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-[#0e2a1e] p-3 flex justify-end gap-3 border-t border-teal-900">
          <button
            onClick={() => {
              if (showInstructions) { setShowInstructions(false); return; }
              if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            }}
            disabled={!showInstructions && currentIndex === 0}
            className="flex items-center gap-2 px-8 py-1.5 bg-[#cbd5e0] hover:bg-gray-300 text-gray-900 rounded-md disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm"
          >
            &lt; ফেরত যান
          </button>
          {!isFinished && (
            <button
              onClick={() => {
                if (showInstructions) { setShowInstructions(false); return; }
                if (currentIndex < questionSet.questions.length - 1) setCurrentIndex(prev => prev + 1);
                else setShowConfirmModal(true);
              }}
              className="flex items-center gap-2 px-8 py-1.5 bg-[#cbd5e0] hover:bg-gray-300 text-gray-900 rounded-md font-bold text-sm"
            >
              এগিয়ে যান &gt;
            </button>
          )}
          {isFinished && (
            <button
              onClick={submitExam}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-12 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md font-bold text-sm shadow-xl animate-pulse disabled:opacity-50"
            >
              {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'জমা দিন >'}
            </button>
          )}
        </footer>

        {/* Manual Confirmation Modal */}
        {showConfirmModal && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded w-full max-w-md overflow-hidden shadow-2xl border border-gray-400">
              <div className="bg-[#444] text-white p-3 flex justify-between items-center text-sm font-bold">
                 <span>চূড়ান্ত নিশ্চিতকরণ</span>
                 <div className="flex items-center gap-1 font-mono text-yellow-400">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                   {formatTime(timeLeft)}
                 </div>
              </div>
              <div className="p-10 flex flex-col items-center text-center space-y-6">
                 <div className="w-20 h-20 rounded-full border-4 border-[#007b8a] flex items-center justify-center mb-2">
                    <span className="text-[#007b8a] text-5xl font-bold">?</span>
                 </div>
                 <p className="text-gray-900 font-bold text-lg">আপনি যদি পরীক্ষার সমাপ্ত করেন ফিরে আসতে পারবেন না</p>
                 
                 <div className="flex gap-4 w-full">
                   <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 px-4 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                   >
                     ✕ বাতিল করুন
                   </button>
                   <button 
                    onClick={() => { setIsFinished(true); setShowConfirmModal(false); }}
                    className="flex-1 py-3 px-4 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                   >
                     ✓ হ্যাঁ, শুরু করুন
                   </button>
                 </div>
              </div>
              <div className="px-4 py-2 text-[10px] text-right text-gray-400 border-t border-gray-100">Prometric</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
