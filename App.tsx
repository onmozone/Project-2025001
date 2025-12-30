
import React, { useState, useEffect } from 'react';
import { AuthState, User, Role, QuestionSet } from './types';
import { db } from './data';
import LoginPage from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import QuizInterface from './components/QuizInterface';
import Instructions from './components/Instructions';
import ResultPage from './components/ResultPage';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [view, setView] = useState<'login' | 'dashboard' | 'instructions' | 'quiz' | 'result'>('login');
  const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);

  useEffect(() => {
    // Check for active sets on mount
    const sets = db.getQuestionSets();
    const live = sets.find(s => s.isLive);
    if (live) setActiveSet(live);
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    if (user.role === 'admin') {
      setView('dashboard');
    } else {
      setView('instructions');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setView('login');
  };

  const startQuiz = () => {
    if (activeSet) setView('quiz');
  };

  const finishQuiz = () => {
    setView('result');
    // Auto logout after a short delay on results page or when they finish
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {view === 'login' && <LoginPage onLogin={handleLogin} />}
      
      {view === 'dashboard' && auth.user?.role === 'admin' && (
        <AdminDashboard user={auth.user} onLogout={handleLogout} />
      )}

      {view === 'instructions' && auth.user?.role === 'user' && (
        <Instructions 
          user={auth.user} 
          activeSet={activeSet} 
          onStart={startQuiz} 
          onLogout={handleLogout} 
        />
      )}

      {view === 'quiz' && auth.user?.role === 'user' && activeSet && (
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
