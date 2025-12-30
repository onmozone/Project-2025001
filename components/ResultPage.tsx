
import React, { useEffect } from 'react';

interface ResultPageProps {
  onLogout: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ onLogout }) => {
  // Auto logout after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onLogout, 10000);
    return () => clearTimeout(timer);
  }, [onLogout]);

  return (
    <div className="flex-1 bg-[#444] flex items-center justify-center p-4">
      <div className="bg-white rounded w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#444] text-white p-3 flex items-center gap-2 text-sm border-b border-teal-900">
          <button onClick={onLogout} className="hover:text-teal-400">← ফলাফল</button>
        </div>

        <div className="p-12 space-y-8 min-h-[300px]">
          <p className="text-gray-800 text-lg leading-relaxed">
            আপনি এই পরীক্ষা শেষ করেছেন। আপনার পরীক্ষা মূল্যায়ন করা হবে এবং ফলাফল শীঘ্রই পাওয়া যাবে। আপনি এখন ব্রাউজার বা উইন্ডোজ বন্ধ করতে পারেন।
          </p>
        </div>

        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 bg-gray-50">
          <button
            onClick={onLogout}
            className="text-[#004d40] font-bold text-sm hover:underline"
          >
            প্রস্থান করুন
          </button>
          <span className="text-[10px] text-gray-400">Prometric</span>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
