
import React, { useState } from 'react';
import { Customer } from '../types';
import { supabase } from '../supabase';
import DataTable from '../components/DataTable';
import { UserPlus, X, MessageCircle, Phone, Search, Wallet, Calendar, Bell, Loader2 } from 'lucide-react';

interface CustomersProps {
  user: { id: string };
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Customers: React.FC<CustomersProps> = ({ user, customers, setCustomers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [newCust, setNewCust] = useState({ name: '', email: '', phone: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [reminderDate, setReminderDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'due'>('all');
  const [loading, setLoading] = useState(false);

  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const custId = `CUST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const custData = {
      id: custId,
      user_id: user.id,
      name: newCust.name,
      email: newCust.email,
      phone: newCust.phone,
      address: newCust.address,
      totalSpent: 0,
      totalDue: 0
    };

    try {
      const { data, error } = await supabase.from('customers').insert([custData]).select();
      if (error) throw error;
      if (data) setCustomers(prev => [data[0], ...prev]);
      setIsModalOpen(false);
      setNewCust({ name: '', email: '', phone: '', address: '' });
    } catch (err) {
      alert("কাস্টমার সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || loading) return;
    
    setLoading(true);
    const newDue = Math.max(0, selectedCustomer.totalDue - paymentAmount);
    // কাস্টমারের দেওয়া মোট টাকার পরিমাণও বাড়াতে হবে
    const newSpent = Number(selectedCustomer.totalSpent || 0) + paymentAmount;

    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          totalDue: newDue,
          totalSpent: newSpent 
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, totalDue: newDue, totalSpent: newSpent }
          : c
      ));
      
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      setSelectedCustomer(null);
      alert('পেমেন্ট সফলভাবে রেকর্ড করা হয়েছে!');
    } catch (err) {
      alert("পেমেন্ট আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({ reminderDate: reminderDate })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, reminderDate }
          : c
      ));

      setIsReminderModalOpen(false);
      setReminderDate('');
      setSelectedCustomer(null);
      alert('আদায়ের তারিখ সেট করা হয়েছে!');
    } catch (err) {
      alert("তারিখ সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const sendPromo = (customer: Customer) => {
    const msg = `আসসালামু আলাইকুম ${customer.name}, আমাদের দোকানে কেনাকাটা করার জন্য ধন্যবাদ। আপনার মোট বকেয়া ৳${toBN(customer.totalDue.toFixed(0))} টাকা পরিশোধ করার অনুরোধ রইলো।`;
    const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    const matchesView = viewMode === 'all' || (viewMode === 'due' && c.totalDue > 0);
    return matchesSearch && matchesView;
  });

  const columns = [
    { header: 'কাস্টমার প্রোফাইল', accessor: (item: Customer) => (
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-indigo-200">
          {item.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">{item.name}</p>
          <div className="flex items-center text-xs text-slate-400 mt-1">
             <Phone size={12} className="mr-1" />
             <span className="digit">{toBN(item.phone)}</span>
          </div>
        </div>
      </div>
    )},
    { header: 'বাকি পাওনা', accessor: (item: Customer) => (
      <div className="flex flex-col">
         <span className={`digit font-bold text-lg ${item.totalDue > 0 ? 'text-red-500' : 'text-slate-300'}`}>৳{toBN(item.totalDue.toFixed(0))}</span>
         {item.reminderDate && (
           <span className="flex items-center text-[10px] text-amber-600 font-bold mt-1">
             <Calendar size={10} className="mr-1" /> আদায়: {toBN(item.reminderDate)}
           </span>
         )}
      </div>
    )},
    { header: 'অ্যাকশন', accessor: (item: Customer) => (
      <div className="flex items-center space-x-2">
        {item.totalDue > 0 && (
          <>
            <button 
              onClick={() => { setSelectedCustomer(item); setIsPaymentModalOpen(true); }}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
              title="পেমেন্ট জমা নিন"
            >
              <Wallet size={16} />
            </button>
            <button 
              onClick={() => { setSelectedCustomer(item); setIsReminderModalOpen(true); }}
              className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
              title="তাগাদার তারিখ"
            >
              <Bell size={16} />
            </button>
          </>
        )}
        <button 
          onClick={() => sendPromo(item)}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
          title="মেসেজ পাঠান"
        >
          <MessageCircle size={16} />
        </button>
      </div>
    )},
  ];

  const totalDues = customers.reduce((acc, curr) => acc + Number(curr.totalDue), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">কাস্টমার ও বাকি ব্যবস্থাপনা</h1>
          <p className="text-slate-500">আপনার কাস্টমারদের বকেয়া পাওনার হিসাব রাখুন এবং আপডেট করুন।</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            <span>নতুন কাস্টমার</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">মোট কাস্টমার</p>
          <h3 className="text-3xl font-bold text-slate-800 digit">{toBN(customers.length)}</h3>
        </div>
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">মোট বকেয়া পাওনা</p>
          <h3 className="text-3xl font-bold text-red-600 digit">৳{toBN(totalDues.toFixed(0))}</h3>
        </div>
        <div className="md:col-span-2 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">খুঁজুন ও ফিল্টার</p>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 <button 
                   onClick={() => setViewMode('all')}
                   className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   সবাই
                 </button>
                 <button 
                   onClick={() => setViewMode('due')}
                   className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'due' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   বাকি আছে
                 </button>
              </div>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredCustomers} />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">নতুন কাস্টমার প্রোফাইল</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">কাস্টমারের নাম</label>
                <input type="text" placeholder="পুরো নাম লিখুন" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">মোবাইল নম্বর</label>
                <input type="text" placeholder="০১৭XXXXXXXX" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none digit" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">ঠিকানা</label>
                <textarea rows={2} placeholder="রাস্তা, শহর বা জেলা..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-lg flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "কাস্টমার সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">পেমেন্ট জমা নিন</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">কাস্টমার</p>
              <p className="font-bold text-slate-700">{selectedCustomer.name}</p>
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-slate-500">বাকি টাকা:</span>
                <span className="text-sm font-bold text-red-500 digit">৳{toBN(selectedCustomer.totalDue.toFixed(0))}</span>
              </div>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">জমা টাকার পরিমাণ (৳)</label>
                <input 
                  type="number" 
                  required 
                  autoFocus
                  max={selectedCustomer.totalDue}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-2xl font-bold text-emerald-600 digit" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                />
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center">
                 <span className="text-xs font-bold text-emerald-600 uppercase">নতুন বাকি</span>
                 <span className="text-lg font-bold text-emerald-700 digit">৳{toBN(Math.max(0, selectedCustomer.totalDue - paymentAmount).toFixed(0))}</span>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "পেমেন্ট নিশ্চিত করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isReminderModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">তাগাদার তারিখ</h2>
              <button onClick={() => setIsReminderModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleSetReminder} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">তারিখ নির্বাচন করুন</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 digit" 
                  value={reminderDate} 
                  onChange={e => setReminderDate(e.target.value)} 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "রিমাইন্ডার সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
