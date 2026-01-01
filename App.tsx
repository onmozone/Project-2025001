
import React, { useState, useEffect } from 'react';
import { AuthState, User, QuestionSet } from './types';
import { db } from './data';
import LoginPage from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import QuizInterface from './components/QuizInterface';
import Instructions from './components/Instructions';
import ResultPage from './components/ResultPage';
import ConfirmationPage from './components/ConfirmationPage';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [view, setView] = useState<'login' | 'dashboard' | 'confirmation' | 'instructions' | 'quiz' | 'result'>('login');
  const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveSet = async () => {
    const sets = await db.getQuestionSets();
    const live = sets.find(s => s.isLive);
    setActiveSet(live || null);
    return live;
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await fetchLiveSet();
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleLogin = async (user: User) => {
    setAuth({ user, isAuthenticated: true });
    // Re-sync live set on login to ensure latest admin updates are pulled
    await fetchLiveSet();
    if (user.role === 'admin') {
      setView('dashboard');
    } else {
      setView('confirmation');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setView('login');
  };

  const goToInstructions = () => setView('instructions');
  
  const startQuiz = async () => {
    // Final sync check before entering exam
    const currentLiveSet = await fetchLiveSet();
    if (currentLiveSet) {
      setView('quiz');
    } else {
      alert('দুঃখিত, বর্তমানে কোনো লাইভ পরীক্ষা নেই।');
    }
  };

  const finishQuiz = () => setView('result');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-teal-800 font-bold">লোড হচ্ছে...</p>
      </div>
    );
  }

  const isStudentView = ['confirmation', 'instructions', 'quiz', 'result'].includes(view);

  return (
    <div className={`min-h-screen flex flex-col font-['Hind_Siliguri'] ${isStudentView ? 'bg-[#dbdbdb]' : 'bg-[#e9ecef]'}`}>
      {view === 'login' && <LoginPage onLogin={handleLogin} />}
      
      {view === 'dashboard' && auth.user?.role === 'admin' && (
        <AdminDashboard user={auth.user} onLogout={handleLogout} />
      )}

      {view === 'confirmation' && auth.user && (
        <ConfirmationPage 
          user={auth.user} 
          activeSet={activeSet} 
          onConfirm={goToInstructions} 
          onCancel={handleLogout} 
        />
      )}

      {view === 'instructions' && auth.user && (
        <Instructions 
          user={auth.user} 
          activeSet={activeSet} 
          onStart={startQuiz} 
          onLogout={handleLogout} 
        />
      )}

      {view === 'quiz' && auth.user && activeSet && (
        <QuizInterface 
          user={auth.user} 
          questionSet={activeSet} 
          onFinish={finishQuiz} 
        />
      )}

      {view === 'result' && (
        <ResultPage onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
