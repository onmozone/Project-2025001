
import React, { useState, useEffect } from 'react';
import { db } from '../data';
import { User, QuestionSet, Question } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'sets' | 'users' | 'editor'>('sets');
  
  // State for forms
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [currentSetForQuestions, setCurrentSetForQuestions] = useState<QuestionSet | null>(null);

  useEffect(() => {
    setSets(db.getQuestionSets());
    setUsers(db.getUsers());
  }, []);

  const refreshData = () => {
    setSets(db.getQuestionSets());
    setUsers(db.getUsers());
  };

  // --- SET MANAGEMENT ---
  const handleSaveSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;
    
    let newSets;
    if (editingSet.id) {
      newSets = sets.map(s => s.id === editingSet.id ? editingSet : s);
    } else {
      const newSet = { ...editingSet, id: db.generateId(), questions: [], isLive: false };
      newSets = [...sets, newSet as QuestionSet];
    }
    db.saveQuestionSets(newSets);
    setSets(newSets);
    setEditingSet(null);
  };

  const handleToggleLive = (id: string) => {
    const updated = sets.map(s => ({
      ...s,
      isLive: s.id === id ? !s.isLive : false
    }));
    db.saveQuestionSets(updated);
    setSets(updated);
  };

  const handleDeleteSet = (id: string) => {
    if (confirm('এই সেটটি মুছে ফেলতে চান?')) {
      const updated = sets.filter(s => s.id !== id);
      db.saveQuestionSets(updated);
      setSets(updated);
    }
  };

  // --- QUESTION MANAGEMENT ---
  const openQuestionEditor = (set: QuestionSet) => {
    setCurrentSetForQuestions(set);
    setActiveTab('editor');
  };

  const handleAddQuestion = () => {
    if (!currentSetForQuestions) return;
    const newQ: Question = {
      id: db.generateId(),
      text: 'নতুন প্রশ্ন লিখুন',
      options: { A: 'অপশন ১', B: 'অপশন ২', C: 'অপশন ৩', D: 'অপশন ৪' },
      correctOption: 'A'
    };
    const updatedSet = { ...currentSetForQuestions, questions: [...currentSetForQuestions.questions, newQ] };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  const updateQuestion = (qId: string, fields: Partial<Question>) => {
    if (!currentSetForQuestions) return;
    const updatedQs = currentSetForQuestions.questions.map(q => q.id === qId ? { ...q, ...fields } : q);
    const updatedSet = { ...currentSetForQuestions, questions: updatedQs };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  const deleteQuestion = (qId: string) => {
    if (!currentSetForQuestions) return;
    const updatedQs = currentSetForQuestions.questions.filter(q => q.id !== qId);
    const updatedSet = { ...currentSetForQuestions, questions: updatedQs };
    const updatedSets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    db.saveQuestionSets(updatedSets);
    setSets(updatedSets);
    setCurrentSetForQuestions(updatedSet);
  };

  // --- USER MANAGEMENT ---
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    let newUsers;
    if (editingUser.id) {
      newUsers = users.map(u => u.id === editingUser.id ? (editingUser as User) : u);
    } else {
      const newUser = { ...editingUser, id: db.generateId(), role: 'user' as const };
      newUsers = [...users, newUser as User];
    }
    db.saveUsers(newUsers);
    setUsers(newUsers);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (confirm('এই ইউজারটি মুছে ফেলতে চান?')) {
      const updated = users.filter(u => u.id !== id);
      db.saveUsers(updated);
      setUsers(updated);
    }
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
        {/* Sidebar Nav */}
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
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* QUESTION SETS LIST */}
          {activeTab === 'sets' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">মোট প্রশ্ন সেট: {sets.length}</h2>
                  <p className="text-sm text-gray-500">এখান থেকে আপনি নতুন পরীক্ষা তৈরি এবং লাইভ করতে পারেন।</p>
                </div>
                <button 
                  onClick={() => setEditingSet({ title: '', description: '', timeLimit: 10 } as any)}
                  className="bg-[#004d40] text-white px-6 py-2 rounded-md font-bold hover:bg-[#00332c] transition-all flex items-center gap-2"
                >
                  <span>+</span> নতুন সেট যোগ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sets.map(set => (
                  <div key={set.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${set.isLive ? 'border-green-500' : 'border-transparent'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{set.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">ID: {set.id}</p>
                        </div>
                        {set.isLive && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse">Live Now</span>
                        )}
                      </div>
                      
                      <div className="flex gap-4 mb-6">
                        <div className="bg-gray-50 px-3 py-2 rounded text-center min-w-[80px]">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">প্রশ্ন</p>
                          <p className="text-lg font-bold text-[#004d40]">{set.questions.length}</p>
                        </div>
                        <div className="bg-gray-50 px-3 py-2 rounded text-center min-w-[80px]">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">সময়</p>
                          <p className="text-lg font-bold text-[#004d40]">{set.timeLimit}m</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => handleToggleLive(set.id)}
                          className={`flex-1 py-2 rounded text-xs font-bold transition-all ${set.isLive ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                          {set.isLive ? 'বন্ধ করুন' : 'লাইভ করুন'}
                        </button>
                        <button 
                          onClick={() => openQuestionEditor(set)}
                          className="flex-1 py-2 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100"
                        >
                          প্রশ্নগুলো দেখুন
                        </button>
                        <button 
                          onClick={() => setEditingSet(set)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200"
                        >
                          এডিট
                        </button>
                        <button 
                          onClick={() => handleDeleteSet(set.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100"
                        >
                          মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION EDITOR */}
          {activeTab === 'editor' && currentSetForQuestions && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => setActiveTab('sets')}
                  className="text-gray-500 hover:text-black font-bold"
                >
                  ← ফিরে যান
                </button>
                <h2 className="text-2xl font-bold">প্রশ্ন এডিটর: {currentSetForQuestions.title}</h2>
              </div>

              <div className="space-y-4">
                {currentSetForQuestions.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div className="flex justify-between">
                      <span className="bg-[#004d40] text-white px-3 py-1 rounded-full text-xs font-bold">প্রশ্ন {idx + 1}</span>
                      <button onClick={() => deleteQuestion(q.id)} className="text-red-500 text-xs font-bold hover:underline">মুছে ফেলুন</button>
                    </div>
                    
                    <input 
                      type="text" 
                      value={q.text} 
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      className="w-full text-lg font-bold border-b border-gray-200 focus:border-[#004d40] outline-none py-2"
                      placeholder="প্রশ্নটি এখানে লিখুন..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuestion(q.id, { correctOption: key as any })}
                            className={`w-8 h-8 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all ${q.correctOption === key ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'}`}
                          >
                            {key}
                          </button>
                          <input 
                            type="text"
                            value={q.options[key as 'A'|'B'|'C'|'D']}
                            onChange={(e) => {
                              const newOpts = { ...q.options, [key]: e.target.value };
                              updateQuestion(q.id, { options: newOpts });
                            }}
                            className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleAddQuestion}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 font-bold hover:bg-gray-50 transition-all"
                >
                  + নতুন প্রশ্ন যোগ করুন
                </button>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">ইউজার লিস্ট</h2>
                <button 
                  onClick={() => setEditingUser({ name: '', username: '', password: '' })}
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
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ইউজার আইডি</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-700">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{u.username}</td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <button onClick={() => setEditingUser(u)} className="text-blue-600 font-bold text-xs hover:underline">এডিট</button>
                          {u.username !== 'admin' && (
                            <button onClick={() => deleteUser(u.id)} className="text-red-600 font-bold text-xs hover:underline">মুছে ফেলুন</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SET MODAL */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveSet} className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#004d40] p-4 text-white font-bold">সেট তথ্য {editingSet.id ? 'সম্পাদনা' : 'তৈরি'} করুন</div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">শিরোনাম</label>
                <input required type="text" value={editingSet.title} onChange={e => setEditingSet({...editingSet, title: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">সময়সীমা (মিনিট)</label>
                <input required type="number" value={editingSet.timeLimit} onChange={e => setEditingSet({...editingSet, timeLimit: parseInt(e.target.value)})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingSet(null)} className="px-4 py-2 text-gray-500 font-bold text-sm">বাতিল</button>
              <button type="submit" className="bg-[#004d40] text-white px-6 py-2 rounded font-bold text-sm shadow-sm">সংরক্ষণ করুন</button>
            </div>
          </form>
        </div>
      )}

      {/* USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#004d40] p-4 text-white font-bold">ইউজার {editingUser.id ? 'সম্পাদনা' : 'তৈরি'} করুন</div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">পূর্ণ নাম</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-teal-500 outline-none" />
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
              <button type="submit" className="bg-[#004d40] text-white px-6 py-2 rounded font-bold text-sm shadow-sm">সংরক্ষণ করুন</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
