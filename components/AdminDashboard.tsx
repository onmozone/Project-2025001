
import React, { useState, useEffect } from 'react';
import { db } from '../data';
import { User, QuestionSet, Question, QuizResult } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeTab, setActiveTab] = useState<'sets' | 'users' | 'results' | 'editor'>('sets');
  
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [currentSetForQuestions, setCurrentSetForQuestions] = useState<QuestionSet | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setSets(await db.getQuestionSets());
      setUsers(await db.getUsers());
      setResults(await db.getQuizResults());
    };
    loadData();
  }, [activeTab]); // Reload data when switching tabs

  const handleSaveSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;
    
    let newSets;
    if (editingSet.id) {
      newSets = sets.map(s => s.id === editingSet.id ? editingSet : s);
    } else {
      const newSet = { ...editingSet, id: db.generateId(), questions: [], isLive: false };
      newSets = [...sets, newSet as QuestionSet];
    }
    await db.saveQuestionSets(newSets);
    setSets(newSets);
    setEditingSet(null);
  };

  const handleToggleLive = async (id: string) => {
    const updated = sets.map(s => ({
      ...s,
      isLive: s.id === id ? !s.isLive : false
    }));
    await db.saveQuestionSets(updated);
    setSets(updated);
  };

  const handleDeleteSet = async (id: string) => {
    if (confirm('এই সেটটি মুছে ফেলতে চান?')) {
      const updated = sets.filter(s => s.id !== id);
      await db.saveQuestionSets(updated);
      setSets(updated);
    }
  };

  const openQuestionEditor = (set: QuestionSet) => {
    setCurrentSetForQuestions(set);
    setActiveTab('editor');
  };

  const handleAddQuestion = async () => {
    if (!currentSetForQuestions) return;
    const newQ: Question = {
      id: db.generateId(),
      text: 'নতুন প্রশ্ন লিখুন',
      options: { A: 'অপশন ১', B: 'অপশন ২', C: 'অপশন ৩', D: 'অপশন ৪' },
      correctOption: 'A'
    };
    const updatedSet = { ...currentSetForQuestions, questions: [...currentSetForQuestions.questions, newQ] };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    await db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  const updateQuestion = async (qId: string, fields: Partial<Question>) => {
    if (!currentSetForQuestions) return;
    const updatedQs = currentSetForQuestions.questions.map(q => q.id === qId ? { ...q, ...fields } : q);
    const updatedSet = { ...currentSetForQuestions, questions: updatedQs };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    await db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  const deleteQuestion = async (qId: string) => {
    if (!currentSetForQuestions) return;
    const updatedQs = currentSetForQuestions.questions.filter(q => q.id !== qId);
    const updatedSet = { ...currentSetForQuestions, questions: updatedQs };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    await db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    let newUsers;
    if (editingUser.id) {
      newUsers = users.map(u => u.id === editingUser.id ? (editingUser as User) : u);
    } else {
      const newUser = { ...editingUser, id: db.generateId(), role: 'user' as const };
      newUsers = [...users, newUser as User];
    }
    await db.saveUsers(newUsers);
    setUsers(newUsers);
    setEditingUser(null);
  };

  const deleteUser = async (id: string) => {
    if (confirm('এই ইউজারটি মুছে ফেলতে চান?')) {
      const updated = users.filter(u => u.id !== id);
      await db.saveUsers(updated);
      setUsers(updated);
    }
  };

  // Helper to process results for display
  const getUserStats = () => {
    return users.filter(u => u.role !== 'admin').map((u, index) => {
      const userResults = results.filter(r => r.userId === u.id).sort((a, b) => b.timestamp - a.timestamp);
      const lastResult = userResults[0];
      return {
         serial: index + 1,
         name: u.name,
         userId: u.username,
         totalAttempts: userResults.length,
         lastAttemptDate: lastResult ? new Date(lastResult.timestamp).toLocaleDateString('bn-BD') + ' ' + new Date(lastResult.timestamp).toLocaleTimeString('bn-BD') : 'N/A',
         lastRatio: lastResult ? `${Math.round((lastResult.correctAnswers / lastResult.totalQuestions) * 100)}%` : 'N/A'
      };
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-[#004d40] text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">অ্যাডমিন কন্ট্রোল প্যানেল</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs opacity-70">লগইন করা আছে:</p>
            <p className="text-sm font-bold">{user.name}</p>
          </div>
          <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition-colors shadow-sm">লগআউট</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 bg-white border-r flex flex-col py-4 shadow-sm">
          <button 
            onClick={() => setActiveTab('sets')}
            className={`px-6 py-4 text-left font-bold text-sm transition-all border-l-4 ${activeTab === 'sets' || activeTab === 'editor' ? 'bg-teal-50 text-[#004d40] border-[#004d40]' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
          >
            📋 প্রশ্ন সেট ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-left font-bold text-sm transition-all border-l-4 ${activeTab === 'users' ? 'bg-teal-50 text-[#004d40] border-[#004d40]' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
          >
            👥 ইউজার ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-6 py-4 text-left font-bold text-sm transition-all border-l-4 ${activeTab === 'results' ? 'bg-teal-50 text-[#004d40] border-[#004d40]' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
          >
            📊 পরীক্ষার ফলাফল
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'sets' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">মোট প্রশ্ন সেট: {sets.length}</h2>
                </div>
                <button 
                  onClick={() => setEditingSet({ title: '', description: '', timeLimit: 10, category: 'পরিচিতি' } as any)}
                  className="bg-[#004d40] text-white px-6 py-2 rounded-md font-bold hover:bg-[#00332c]"
                >
                  + নতুন সেট যোগ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sets.map(set => (
                  <div key={set.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${set.isLive ? 'border-green-500' : 'border-transparent'}`}>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800">{set.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">বিভাগ: {set.category || 'পরিচিতি'}</p>
                      <div className="flex gap-2 pt-4 border-t">
                        <button onClick={() => handleToggleLive(set.id)} className={`flex-1 py-2 rounded text-xs font-bold ${set.isLive ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white'}`}>
                          {set.isLive ? 'বন্ধ করুন' : 'লাইভ করুন'}
                        </button>
                        <button onClick={() => openQuestionEditor(set)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded text-xs font-bold">প্রশ্ন এডিটর</button>
                        <button onClick={() => setEditingSet(set)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-xs font-bold">এডিট</button>
                        <button onClick={() => handleDeleteSet(set.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded text-xs font-bold">মুছে ফেলুন</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">ইউজার লিস্ট</h2>
                <button 
                  onClick={() => setEditingUser({ name: '', username: '', password: '', position: 'Load and Unload Worker', language: 'বাংলা' })}
                  className="bg-[#004d40] text-white px-6 py-2 rounded-md font-bold hover:bg-[#00332c]"
                >
                  নতুন ইউজার যোগ করুন
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">নাম</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">পদবি</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-teal-50/30">
                        <td className="px-6 py-4 font-bold text-gray-700">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.position}</td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <button onClick={() => setEditingUser(u)} className="text-blue-600 font-bold text-xs">এডিট</button>
                          {u.username !== 'admin' && <button onClick={() => deleteUser(u.id)} className="text-red-600 font-bold text-xs">মুছে ফেলুন</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">পরীক্ষার ফলাফল</h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Serial</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">User ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Total Attempts</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Last Attempt Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Correct Ratio (Last Exam)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getUserStats().map(stat => (
                      <tr key={stat.serial} className="hover:bg-teal-50/30">
                        <td className="px-6 py-4 font-bold text-gray-700 text-center">{stat.serial}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{stat.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{stat.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-bold text-center">{stat.totalAttempts}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{stat.lastAttemptDate}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          {stat.lastRatio !== 'N/A' ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${parseInt(stat.lastRatio) >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                              {stat.lastRatio}
                            </span>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getUserStats().length === 0 && (
                  <div className="p-12 text-center text-gray-400 text-sm">কোনো ফলাফল পাওয়া যায়নি</div>
                )}
              </div>
            </div>
          )}
          
          {/* QUESTION EDITOR code omitted for brevity but preserved */}
          {activeTab === 'editor' && currentSetForQuestions && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setActiveTab('sets')} className="text-gray-500 font-bold">← ফিরে যান</button>
                  <h2 className="text-2xl font-bold">প্রশ্ন এডিটর: {currentSetForQuestions.title}</h2>
                </div>
                <div className="space-y-4">
                  {currentSetForQuestions.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                      <div className="flex justify-between">
                        <span className="bg-[#004d40] text-white px-3 py-1 rounded-full text-xs font-bold">প্রশ্ন {idx + 1}</span>
                        <button onClick={() => deleteQuestion(q.id)} className="text-red-500 text-xs font-bold">মুছে ফেলুন</button>
                      </div>
                      <input type="text" value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} className="w-full text-lg font-bold border-b outline-none py-2" placeholder="প্রশ্নটি লিখুন..." />
                      
                      {/* Image URL Input */}
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ছবির লিঙ্ক (ঐচ্ছিক)</label>
                        <input type="text" value={q.imageUrl || ''} onChange={(e) => updateQuestion(q.id, { imageUrl: e.target.value })} className="w-full border rounded p-2 text-gray-600 outline-none" placeholder="https://..." />
                        {q.imageUrl && <img src={q.imageUrl} alt="preview" className="mt-2 h-20 object-contain" />}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map(key => (
                          <div key={key} className="flex items-center gap-2">
                            <button onClick={() => updateQuestion(q.id, { correctOption: key as any })} className={`w-8 h-8 rounded-full border-2 font-bold text-xs flex items-center justify-center ${q.correctOption === key ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>{key}</button>
                            <input type="text" value={q.options[key as 'A'|'B'|'C'|'D']} onChange={(e) => updateQuestion(q.id, { options: {...q.options, [key]: e.target.value} })} className="flex-1 border rounded p-2 text-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleAddQuestion} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 font-bold hover:bg-gray-50">+ নতুন প্রশ্ন যোগ করুন</button>
                </div>
             </div>
          )}
        </main>
      </div>

      {/* USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#004d40] p-4 text-white font-bold">ইউজার {editingUser.id ? 'সম্পাদনা' : 'তৈরি'} করুন</div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">পূর্ণ নাম (Candidate Name)</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">পদবি (Position)</label>
                <input required type="text" value={editingUser.position} onChange={e => setEditingUser({...editingUser, position: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ভাষা (Language)</label>
                <input required type="text" value={editingUser.language} onChange={e => setEditingUser({...editingUser, language: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ইউজার আইডি</label>
                <input required type="text" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">পাসওয়ার্ড</label>
                <input required type="text" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-500 font-bold text-sm">বাতিল</button>
              <button type="submit" className="bg-[#004d40] text-white px-6 py-2 rounded font-bold text-sm">সংরক্ষণ করুন</button>
            </div>
          </form>
        </div>
      )}
      
      {/* SET MODAL */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveSet} className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#004d40] p-4 text-white font-bold">সেট তথ্য {editingSet.id ? 'সম্পাদনা' : 'তৈরি'} করুন</div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">শিরোনাম</label>
                <input required type="text" value={editingSet.title} onChange={e => setEditingSet({...editingSet, title: e.target.value})} className="w-full border rounded p-2 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">বিভাগ (Category)</label>
                <input required type="text" value={editingSet.category} onChange={e => setEditingSet({...editingSet, category: e.target.value})} className="w-full border rounded p-2 outline-none" placeholder="উদা: পরিচিতি" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">সময়সীমা (মিনিট)</label>
                <input required type="number" value={editingSet.timeLimit} onChange={e => setEditingSet({...editingSet, timeLimit: parseInt(e.target.value)})} className="w-full border rounded p-2 outline-none" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingSet(null)} className="px-4 py-2 text-gray-500 font-bold text-sm">বাতিল</button>
              <button type="submit" className="bg-[#004d40] text-white px-6 py-2 rounded font-bold text-sm">সংরক্ষণ করুন</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
