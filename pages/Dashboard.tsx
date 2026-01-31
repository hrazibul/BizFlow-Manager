
import React from 'react';
import { User, InventoryItem, Sale, Expense, Customer } from '../types';
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  AlertTriangle,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  inventory: InventoryItem[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, inventory, sales, customers, expenses }) => {
  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  // মোট বিক্রয় (নগদ + বাকি)
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  
  // বর্তমানে কাস্টমারদের কাছে মোট বাকি
  const totalDues = customers.reduce((acc, customer) => acc + (Number(customer.totalDue) || 0), 0);
  
  // নগদ আদায় = মোট বিক্রয় থেকে বাকি বাদ দিলে যা থাকে (এটিই ক্যাশে আসা টাকা)
  const totalCashReceived = Math.max(0, totalRevenue - totalDues);
  
  let totalCostOfGoods = 0;
  sales.forEach(sale => {
    sale.items.forEach(saleItem => {
      const invItem = inventory.find(i => i.id === saleItem.itemId);
      if (invItem) {
        totalCostOfGoods += (invItem.costPrice * saleItem.quantity);
      }
    });
  });
  
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalRevenue - totalCostOfGoods - totalExpenses;

  const lowStockItems = inventory.filter(item => item.quantity <= 5);

  const stats = [
    { 
      label: 'মোট বিক্রয়', 
      value: `৳${toBN(totalRevenue.toFixed(0))}`, 
      icon: <DollarSign size={22} />, 
      color: 'bg-indigo-50 text-indigo-600',
      sub: 'নগদ ও বাকি মিলিয়ে'
    },
    { 
      label: 'নগদ আদায়', 
      value: `৳${toBN(totalCashReceived.toFixed(0))}`, 
      icon: <Wallet size={22} />, 
      color: 'bg-emerald-50 text-emerald-600',
      sub: 'প্রকৃত ক্যাশ ইন'
    },
    { 
      label: 'বাকি পাওনা', 
      value: `৳${toBN(totalDues.toFixed(0))}`, 
      icon: <AlertTriangle size={22} />, 
      color: 'bg-amber-50 text-amber-600',
      sub: 'কাস্টমারদের কাছে বাকি'
    },
    { 
      label: 'নিট লাভ', 
      value: `৳${toBN(netProfit.toFixed(0))}`, 
      icon: <TrendingUp size={22} />, 
      color: 'bg-rose-50 text-rose-600',
      sub: 'খরচ বাদে প্রকৃত লাভ'
    },
  ];

  const chartData = sales.slice(-7).reverse().map(s => ({
    name: s.date.split(' ')[0],
    revenue: s.totalAmount
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">আসসালামু আলাইকুম, {user.businessName}!</h1>
          <p className="text-slate-500">আপনার ব্যবসার আর্থিক অবস্থা একনজরে দেখে নিন।</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>লাইভ ট্র্যাকিং</span>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 p-5 rounded-[24px] flex items-center justify-between shadow-sm animate-pulse-subtle">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-inner">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">স্টক সতর্কতা!</p>
              <p className="text-xs text-red-600/80 font-medium">{lowStockItems.length}টি পণ্যের স্টক শেষ হয়ে আসছে।</p>
            </div>
          </div>
          <div className="hidden sm:flex -space-x-3 overflow-hidden">
             {lowStockItems.slice(0, 4).map(item => (
               <div key={item.id} title={item.name} className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                 {item.name.charAt(0)}
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="group p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-sm`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1 digit">{stat.value}</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">বিক্রয়ের গতিধারা</h3>
              <p className="text-xs text-slate-400 font-medium">গত ৭ দিনের সেলস রিপোর্ট</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} className="digit" />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">শীর্ষ বকেয়া কাস্টমার</h3>
          <p className="text-xs text-slate-400 font-medium mb-8">যাদের থেকে টাকা দ্রুত আদায় করা প্রয়োজন</p>
          
          <div className="space-y-6 flex-1">
            {customers.filter(c => c.totalDue > 0).sort((a,b) => b.totalDue - a.totalDue).slice(0, 5).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shadow-sm border border-amber-200">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{customer.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium digit">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500 digit">৳{toBN(customer.totalDue.toFixed(0))}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">
                    {customer.reminderDate ? `আদায়: ${toBN(customer.reminderDate)}` : 'বকেয়া'}
                  </p>
                </div>
              </div>
            ))}
            
            {customers.filter(c => c.totalDue > 0).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                 <Users size={48} className="mb-4" />
                 <p className="text-sm font-bold">সব বাকি পরিশোধিত!</p>
              </div>
            )}
          </div>
          
          {customers.length > 5 && (
            <button className="mt-6 w-full py-3 bg-slate-50 text-slate-400 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors uppercase tracking-widest">
              সবাইকে দেখুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
