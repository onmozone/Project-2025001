
import React, { useState, useEffect, useRef } from 'react';
import { User, QuestionSet } from '../types';
import { db } from '../data';

interface QuizInterfaceProps {
  user: User;
  questionSet: QuestionSet;
  onFinish: () => void;
  onLogout: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ user, questionSet, onFinish, onLogout }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questionSet.timeLimit * 60);

  // Two-step confirmation state
  const [showPreConfirmModal, setShowPreConfirmModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for scroll detection
  const [hasScroll, setHasScroll] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

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

  // Scroll detection effect
  useEffect(() => {
    const checkScroll = () => {
      if (mainContentRef.current) {
        const { scrollHeight, clientHeight } = mainContentRef.current;
        setHasScroll(scrollHeight > clientHeight);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);

    // Check repeatedly to account for image loading or layout shifts
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 500);

    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentIndex, showInstructions, questionSet]);

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

  // Calculate progress based on TIME elapsed, not questions
  const totalTimeSeconds = questionSet.timeLimit * 60;
  const elapsedSeconds = totalTimeSeconds - timeLeft;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTimeSeconds) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#dbdbdb] overflow-hidden h-screen">
      <div className="w-full max-w-[60vw] max-h-[93vh] flex-1 flex flex-col bg-white border-x border-gray-400 shadow-2xl overflow-hidden relative">

        {/* Header */}
        <header className="bg-[#0e2a1e] text-white p-3 flex justify-between items-center shadow-md">
          <div className="flex flex-col">
            <span className="text-sm font-bold">পৃষ্ঠা: {showInstructions ? 'নির্দেশনা' : (isFinished ? 1 : currentIndex + 1)}</span>
            <span className="text-xs opacity-90">বিভাগ: {questionSet.category || 'পরিচিতি'}</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-70">পরিচিতির জন্য সময় অবশিষ্ট:</span>
                <span className={`text-xl font-mono font-bold leading-none ${timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${isFinished ? 100 : progressPercent}%` }}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-90">অতিবাহিত {isFinished ? '১০০' : progressPercent}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isFinished) {
                  submitExam();
                } else {
                  setShowPreConfirmModal(true);
                }
              }}
              disabled={isSubmitting}
              className={`px-5 py-1.5 rounded-md text-sm font-bold shadow-lg transition-all ${isFinished ? 'bg-[#d34734] hover:bg-red-700' : 'bg-[#d34734] hover:bg-red-700'} text-white`}
            >
              {isFinished ? (isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'পরীক্ষা সমাপ্ত..') : 'পরীক্ষা সমাপ্ত...'}
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
              <main ref={mainContentRef} className="flex-1 p-6 relative overflow-y-auto">
                {showInstructions ? (
                  <div className="w-full max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                    <h2 className="text-xl font-bold text-[#1a2b3c] leading-snug">
                      আপনি যদি আপনার পরীক্ষা সম্পূর্ণ করাতে খুশি হয়ে থাকেন তাহলে উপরের <span className="text-red-500">"পরীক্ষার সমাপ্ত" &gt;</span> বাটনে ক্লিক করুন
                    </h2>
                    <h3 className="text-lg font-bold">
                      যদি মনে হয় আপনার পরীক্ষা শেষ হয়নি তাহলে <span className="text-teal-600">&lt; "ফেরত যান"</span> বাটনে ক্লিক করুন
                    </h3>
                    <p className="font-bold text-xl border-b border-black inline-block pb-1">পরীক্ষাটি সমাপ্ত করতে নিচের স্ক্রিনশটগুলো ফলো করুন</p>

                    <div className="grid grid-cols-2 justify-items-center gap-8 pt-2 p-8 max-w-[45vw] mx-auto">

                      <div className="border border-gray-300 p-2 rounded shadow-md bg-white">
                        <img src="https://nur-svp.top/static/exam/images/lll.png" className="w-full h-auto" alt="Instruction step 1" />
                        {/* <p className="text-center text-xs mt-3 font-bold text-gray-600">বিবরণী নিশ্চিত করুন</p> */}
                      </div>
                      <div className="border border-gray-300 p-2 rounded shadow-md bg-white">
                        <img src="https://nur-svp.top/static/exam/images/ll.png" className="w-full h-auto" alt="Instruction step 2" />
                        {/* <p className="text-center text-xs mt-3 font-bold text-gray-600">চূড়ান্ত নিশ্চিতকরণ</p> */}
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
                        <img src={currentQuestion.imageUrl} className="max-w-full h-auto object-contain max-h-[400px] rounded-sm" alt="Question visual context" />
                      </div>
                    )}

                    <div className="space-y-3 pb-6">
                      {currentQuestion.options.map((option, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        const isSelected = answers[currentQuestion.id] === letter;

                        return (
                          <div key={idx} className="flex items-start gap-4">
                            {/* Letter */}
                            <div className="flex items-center justify-center font-bold text-black text-lg w-6 self-stretch select-none">
                              {letter}.
                            </div>

                            {/* Option */}
                            <button
                              onClick={() => handleOptionSelect(letter)}
                              className={`
            flex-1 text-left border-2 rounded-sm transition-all p-4
            ${isSelected
                                  ? 'border-[#3b82f6] bg-[#ffff80]'
                                  : 'border-black hover:border-[#3b82f6] bg-white'}
          `}
                            >
                              <span className="text-[16px] font-medium text-black">
                                {option}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {hasScroll && (
                      <div className="fixed bottom-[13vh] right-[20vw] bg-black text-white px-5 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce cursor-default select-none z-10">
                        <span>এই পৃষ্ঠাটির স্ক্রলিং প্রয়োজন</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                      </div>
                    )}
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
        {!isFinished && (
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
                  if (showInstructions) {
                    setShowPreConfirmModal(true);
                    return;
                  }
                  if (currentIndex < questionSet.questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    setShowInstructions(true);
                  }
                }}
                disabled={showInstructions}
                className="flex items-center gap-2 px-8 py-1.5 bg-[#cbd5e0] hover:bg-gray-300 text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-md font-bold text-sm"
              >
                এগিয়ে যান &gt;
              </button>
            )}
          </footer>
        )}

        {/* Pre-Confirmation Modal (Step 1) */}
        {showPreConfirmModal && (
          <div className="absolute inset-0 bg-[#444] flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded w-full max-w-[25vw] max-h-[50vh] overflow-hidden shadow-2xl border border-gray-400">
              <div className="bg-[#444] text-white p-3 flex justify-between items-center text-sm font-bold">
                <span>বিবরণী নিশ্চিত করুন</span>
                <div className="flex items-center gap-1 font-mono text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center text-center space-y-6">
                <div className="w-10 h-10 rounded-full border-4 border-[#007b8a] flex items-center justify-center mb-2">
                  <span className="text-[#007b8a] text-5xl font-bold">?</span>
                </div>

                <p className="text-gray-900 text-lg">
                  আপনি যদি পরীক্ষার সমাপ্ত করেন ফিরে আসতে পারবেন না
                </p>

                <div className="flex gap-2 justify-between w-full">

                  <button
                    onClick={() => { setShowPreConfirmModal(false); setShowConfirmModal(true); }}
                    className="flex-1 p-2 m-2 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    ✓ নিশ্চিত করুন
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex-1 p-2 m-2 bg-[#007b8a] hover:bg-[#006a77] text-white font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    ✕ বাতিল করুন
                  </button>


                </div>
              </div>

              <div className="px-4 py-2 text-[10px] text-right text-gray-500 font-bold border-t border-gray-100">Prometric</div>
            </div>
          </div>
        )}

        {/* Final Confirmation Modal (Step 2) */}
        {showConfirmModal && (
          <div className="absolute inset-0 bg-[#444] flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded w-full max-w-[25vw] max-h-[50vh] overflow-hidden shadow-2xl border border-gray-400">
              <div className="bg-[#444] text-white p-3 flex justify-between items-center text-sm font-bold">
                <span>চূড়ান্ত নিশ্চিতকরণ</span>
                <div className="flex items-center gap-1 font-mono text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center text-center space-y-6">
                <div className="w-10 h-10 rounded-full border-4 border-[#007b8a] flex items-center justify-center mb-2">
                  <span className="text-[#007b8a] text-5xl font-bold">?</span>
                </div>
                <p className="text-gray-900  text-lg">আপনি যদি পরীক্ষার সমাপ্ত করেন ফিরে আসতে পারবেন না</p>

                <div className="flex gap-2 justify-between w-full">
                  <button
                    onClick={() => { setShowConfirmModal(false); setShowPreConfirmModal(true); }}
                    className="flex-1 p-2 m-2 bg-[#007b8a] hover:bg-[#006a77] text-white hover:text-gray-200 font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    ✕ বাতিল করুন
                  </button>
                  <button
                    onClick={() => { setIsFinished(true); setShowConfirmModal(false); }}
                    className="flex-1 p-2 m-2 bg-[#007b8a] hover:bg-[#006a77] text-white hover:text-gray-200 font-bold rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
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
