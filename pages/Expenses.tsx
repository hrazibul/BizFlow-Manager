
import React, { useState } from 'react';
import { Expense, User } from '../types';
import { supabase } from '../supabase';
import DataTable from '../components/DataTable';
import { Plus, X, Loader2 } from 'lucide-react';

interface ExpensesProps {
  user: User;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const Expenses: React.FC<ExpensesProps> = ({ user, expenses, setExpenses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newExp, setNewExp] = useState({ description: '', category: '', amount: 0 });

  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description || loading) return;

    setLoading(true);
    const expData = {
      id: Math.random().toString(36).substr(2, 5),
      user_id: user.id,
      description: newExp.description,
      category: newExp.category,
      amount: newExp.amount,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase.from('expenses').insert([expData]).select();
      if (error) throw error;

      if (data) {
        setExpenses(prev => [data[0], ...prev]);
        setIsModalOpen(false);
        setNewExp({ description: '', category: '', amount: 0 });
      }
    } catch (err) {
      console.error(err);
      alert("খরচ সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'বিবরণ', accessor: (item: Expense) => item.description },
    { header: 'ক্যাটাগরি', accessor: (item: Expense) => item.category },
    { header: 'তারিখ', accessor: (item: Expense) => <span className="digit">{toBN(item.date)}</span> },
    { header: 'পরিমাণ', accessor: (item: Expense) => <span className="text-red-600 font-bold digit">৳{toBN(item.amount.toFixed(2))}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ব্যবসায়িক খরচ</h1>
          <p className="text-slate-500">আপনার ব্যবসার দৈনন্দিন খরচের হিসাব রাখুন।</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3.5 text-sm font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>নতুন খরচ যোগ করুন</span>
        </button>
      </div>

      <DataTable columns={columns} data={expenses} />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">খরচের তথ্য দিন</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">খরচের বিবরণ</label>
                <input type="text" placeholder="যেমন: দোকান ভাড়া বা ইলেকট্রিক বিল" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all" value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">ক্যাটাগরি</label>
                <input type="text" placeholder="যেমন: ভাড়া, বেতন, বিল" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">টাকার পরিমাণ (৳)</label>
                <input type="number" step="0.01" placeholder="0.00" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none digit text-xl font-bold text-red-600" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: parseFloat(e.target.value) || 0})} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-lg flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "খরচ সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
