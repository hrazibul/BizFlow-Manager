
import React, { useState } from 'react';
import { InventoryItem, User } from '../types';
import { supabase } from '../supabase';
import DataTable from '../components/DataTable';
import { Search, Plus, X, Package, Loader2 } from 'lucide-react';

interface InventoryProps {
  user: User;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ user, inventory, setInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, unit: 'পিস', costPrice: 0, price: 0, category: '' });

  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || loading) return;
    
    setLoading(true);
    const itemData = {
      id: `PROD-${Date.now().toString().slice(-6)}`,
      user_id: user.id,
      name: newItem.name,
      sku: newItem.sku || `SKU-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      quantity: newItem.quantity,
      unit: newItem.unit,
      costPrice: newItem.costPrice,
      price: newItem.price,
      category: newItem.category
    };

    try {
      if (user.id === 'guest') {
        // Guest Mode: Local Storage
        const updatedInv = [itemData, ...inventory];
        setInventory(updatedInv);
        localStorage.setItem('bizflow_guest_inventory', JSON.stringify(updatedInv));
        setIsModalOpen(false);
        setNewItem({ name: '', sku: '', quantity: 0, unit: 'পিস', costPrice: 0, price: 0, category: '' });
      } else {
        // Regular Mode: Supabase
        const { data, error } = await supabase
          .from('inventory')
          .insert([itemData])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setInventory(prev => [data[0], ...prev]);
          setIsModalOpen(false);
          setNewItem({ name: '', sku: '', quantity: 0, unit: 'পিস', costPrice: 0, price: 0, category: '' });
        }
      }
    } catch (error: any) {
      console.error("Error adding item:", error);
      alert("পণ্যটি সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'পণ্য', accessor: (item: InventoryItem) => (
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.quantity <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
          <Package size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-800">{item.name}</p>
          <p className="text-xs text-slate-400 digit">{toBN(item.sku)}</p>
        </div>
      </div>
    )},
    { header: 'পরিমাণ', accessor: (item: InventoryItem) => (
      <span className={`font-bold digit ${item.quantity <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
        {toBN(item.quantity)} {item.unit}
      </span>
    )},
    { header: 'ক্রয়মূল্য', accessor: (item: InventoryItem) => <span className="digit">৳{toBN(item.costPrice)}</span> },
    { header: 'বিক্রয়মূল্য', accessor: (item: InventoryItem) => <span className="digit font-bold text-indigo-600">৳{toBN(item.price)}</span> },
    { header: 'সম্ভাব্য লাভ', accessor: (item: InventoryItem) => <span className="digit text-emerald-600 font-bold">৳{toBN(((item.price - item.costPrice) * item.quantity).toFixed(0))}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ইনভেন্টরি স্টক</h1>
          <p className="text-slate-400 font-medium">আপনার দোকানের পণ্যের সঠিক হিসাব রাখুন।</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-4 text-sm font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all"
        >
          <Plus size={18} />
          <span>নতুন পণ্য যোগ করুন</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="পণ্যের নাম দিয়ে খুঁজুন..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))} />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">পণ্যের বিস্তারিত</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">পণ্যের নাম</label>
                <input type="text" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">ক্রয়মূল্য (৳)</label>
                  <input type="number" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none digit" value={newItem.costPrice} onChange={e => setNewItem({...newItem, costPrice: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">বিক্রয়মূল্য (৳)</label>
                  <input type="number" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none digit" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">পরিমাণ</label>
                  <input type="number" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none digit" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">একক (Unit)</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                  >
                    <option value="পিস">পিস (Pcs)</option>
                    <option value="কেজি">কেজি (Kg)</option>
                    <option value="মণ">মণ (Maund)</option>
                    <option value="লিটার">লিটার (Ltr)</option>
                    <option value="প্যাকেট">প্যাকেট (Pkt)</option>
                    <option value="ডজন">ডজন (Doz)</option>
                    <option value="গজ">গজ (Yard)</option>
                    <option value="বক্স">বক্স (Box)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">ক্যাটাগরি</label>
                <input type="text" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "স্টক সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
