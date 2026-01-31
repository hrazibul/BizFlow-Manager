
import React, { useState } from 'react';
import { Supplier, User } from '../types';
import { supabase } from '../supabase';
import DataTable from '../components/DataTable';
import { Truck, Plus, X, Phone, MapPin, Loader2 } from 'lucide-react';

interface SuppliersProps {
  user: User;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ user, suppliers, setSuppliers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSup, setNewSup] = useState({ name: '', contactPerson: '', phone: '', address: '', category: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name || loading) return;

    setLoading(true);
    const supData = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      user_id: user.id,
      name: newSup.name,
      contactPerson: newSup.contactPerson,
      phone: newSup.phone,
      address: newSup.address,
      category: newSup.category
    };

    try {
      const { data, error } = await supabase.from('suppliers').insert([supData]).select();
      if (error) throw error;
      
      if (data) {
        setSuppliers(prev => [data[0], ...prev]);
        setIsModalOpen(false);
        setNewSup({ name: '', contactPerson: '', phone: '', address: '', category: '' });
      }
    } catch (err) {
      console.error(err);
      alert("সাপ্লায়ার সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">সাপ্লায়ার লিস্ট</h1>
          <p className="text-slate-500">পাইকারি বিক্রেতা এবং ভেন্ডরদের তথ্য রাখুন।</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100">
          <Plus size={18} /> নতুন সাপ্লায়ার
        </button>
      </div>

      <DataTable 
        columns={[
          { header: 'কোম্পানি ও ক্যাটাগরি', accessor: (s: Supplier) => <div><p className="font-bold">{s.name}</p><p className="text-xs text-slate-400">{s.category}</p></div> },
          { header: 'যোগাযোগ', accessor: (s: Supplier) => <div><p className="text-sm">{s.contactPerson}</p><div className="flex items-center text-xs text-slate-400 gap-1"><Phone size={10} /> <span className="digit">{s.phone}</span></div></div> },
          { header: 'ঠিকানা', accessor: (s: Supplier) => <div className="flex items-center gap-1 text-slate-500"><MapPin size={12} /> <span className="text-xs">{s.address}</span></div> },
        ]} 
        data={suppliers} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">সাপ্লায়ার তথ্য</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder="কোম্পানির নাম" required className="w-full p-3.5 bg-slate-50 border rounded-2xl outline-none" value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="যোগাযোগকারী ব্যক্তি" className="p-3.5 bg-slate-50 border rounded-2xl outline-none" value={newSup.contactPerson} onChange={e => setNewSup({...newSup, contactPerson: e.target.value})} />
                <input type="text" placeholder="মোবাইল" className="p-3.5 bg-slate-50 border rounded-2xl outline-none digit" value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})} />
              </div>
              <input type="text" placeholder="ক্যাটাগরি" className="w-full p-3.5 bg-slate-50 border rounded-2xl outline-none" value={newSup.category} onChange={e => setNewSup({...newSup, category: e.target.value})} />
              <textarea placeholder="ঠিকানা" className="w-full p-3.5 bg-slate-50 border rounded-2xl outline-none" value={newSup.address} onChange={e => setNewSup({...newSup, address: e.target.value})} />
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "সাপ্লায়ার সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
