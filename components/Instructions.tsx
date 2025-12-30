
import React from 'react';
import { User, QuestionSet } from '../types';

interface InstructionsProps {
  user: User;
  activeSet: QuestionSet | null;
  onStart: () => void;
  onLogout: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ user, activeSet, onStart, onLogout }) => {
  return (
    <div className="flex-1 bg-white p-6 max-w-4xl mx-auto w-full my-8 rounded-lg shadow-sm border border-gray-200">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">পরীক্ষার নির্দেশাবলী</h1>
          <p className="text-gray-600">স্বাগতম, {user.name}</p>
        </div>
        <button onClick={onLogout} className="text-red-600 hover:text-red-700 text-sm font-medium">লগআউট</button>
      </div>

      {!activeSet ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">বর্তমানে কোনো পরীক্ষা সক্রিয় নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h2 className="font-semibold text-blue-800 mb-2">পরীক্ষার তথ্য:</h2>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>বিষয়: {activeSet.title}</li>
              <li>সময়সীমা: {activeSet.timeLimit} মিনিট</li>
              <li>মোট প্রশ্ন: {activeSet.questions.length} টি</li>
            </ul>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <h3 className="font-bold text-lg text-[#004d40]">সতর্কতা ও নিয়মাবলী:</h3>
            <p>১. পরীক্ষা শুরু করার পর টাইমার সক্রিয় হবে। নির্দিষ্ট সময়ের মধ্যে উত্তর প্রদান নিশ্চিত করুন।</p>
            <p>২. প্রতিটি প্রশ্নের জন্য ৪টি করে অপশন থাকবে। সঠিক অপশনটি নির্বাচন করে "এগিয়ে যান" বাটনে ক্লিক করুন।</p>
            <p>৩. পরীক্ষা শেষ হওয়ার আগে উইন্ডো বন্ধ করবেন না বা রিফ্রেশ করবেন না। এতে আপনার পরীক্ষা বাতিল হয়ে যেতে পারে।</p>
            <p>৪. সমস্ত প্রশ্ন উত্তর দেওয়ার পর "পরীক্ষা সমাপ্ত" বাটনে ক্লিক করে নিশ্চিত করুন।</p>
            <p>৫. সময় শেষ হয়ে গেলে আপনার দেওয়া উত্তরগুলো স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে এবং আপনি লগআউট হয়ে যাবেন।</p>
          </div>

          <div className="pt-8 border-t flex justify-end">
            <button
              onClick={onStart}
              className="bg-[#004d40] hover:bg-[#00332c] text-white px-8 py-3 rounded-md font-bold text-lg flex items-center gap-2 transition-transform active:scale-95 shadow-md"
            >
              পরীক্ষা শুরু করুন
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructions;
