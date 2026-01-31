
import React from 'react';
import { InventoryItem, Sale, Customer, Expense } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface ReportsProps {
  inventory: InventoryItem[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ inventory, sales, customers, expenses }) => {
  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  // নিট লাভ ক্যালকুলেশন
  const calculateNetProfit = () => {
    let revenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    let totalCostOfGoods = 0;
    sales.forEach(sale => {
      sale.items.forEach(si => {
        const item = inventory.find(i => i.id === si.itemId);
        if (item) totalCostOfGoods += (item.costPrice * si.quantity);
      });
    });
    let totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
    return revenue - totalCostOfGoods - totalExp;
  };

  const expenseBreakdown: any = {};
  expenses.forEach(e => {
    expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(expenseBreakdown).map(cat => ({
    name: cat,
    value: expenseBreakdown[cat]
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ব্যবসায়িক রিপোর্ট ও বিশ্লেষণ</h1>
          <p className="text-slate-500">আপনার ব্যবসার লাভ, ক্ষতি এবং খরচের গভীর বিশ্লেষণ।</p>
        </div>
        <div className="p-4 bg-indigo-600 rounded-[20px] text-white text-center min-w-[150px] shadow-xl shadow-indigo-100">
           <p className="text-[10px] font-bold uppercase opacity-60">নিট লাভ</p>
           <h3 className="text-xl font-bold digit">৳{toBN(calculateNetProfit().toFixed(0))}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">বিক্রয় বনাম নিট লাভ</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.slice(-7).map(s => ({ name: s.date.split(' ')[0], পরিমাণ: s.totalAmount }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} className="digit" />
                <Tooltip />
                <Bar dataKey="পরিমাণ" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">খরচের ক্যাটাগরি</h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name">
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">তথ্য নেই।</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
