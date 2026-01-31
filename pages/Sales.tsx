
import React, { useState } from 'react';
import { Sale, InventoryItem, Customer, SaleItem, User } from '../types';
import { supabase } from '../supabase';
import DataTable from '../components/DataTable';
import { ShoppingBag, X, Trash2, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SalesProps {
  user: User;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Sales: React.FC<SalesProps> = ({ user, sales, setSales, inventory, setInventory, customers, setCustomers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const toBN = (num: number | string) => num.toLocaleString('bn-BD');

  const addItemToCart = (itemId: string) => {
    const product = inventory.find(i => i.id === itemId);
    if (!product || product.quantity <= 0) return alert('পণ্যটি স্টকে নেই!');
    
    setSelectedItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { itemId, itemName: product.name, quantity: 1, price: product.price, unit: product.unit }];
    });
  };

  const calculateTotal = () => selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const dueAmount = Math.max(0, calculateTotal() - paidAmount);

  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !customerInfo.name || loading) return;

    setLoading(true);
    const total = calculateTotal();
    
    const saleData = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      user_id: user.id,
      date: new Date().toLocaleString('bn-BD'),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      totalAmount: total,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      status: dueAmount > 0 ? 'pending' : 'completed',
      items: selectedItems
    };

    try {
      if (user.id === 'guest') {
        // Guest Mode
        const newSales = [saleData, ...sales] as Sale[];
        setSales(newSales);
        localStorage.setItem('bizflow_guest_sales', JSON.stringify(newSales));

        // Update Inventory
        const updatedInv = inventory.map(invItem => {
          const sold = selectedItems.find(si => si.itemId === invItem.id);
          return sold ? { ...invItem, quantity: invItem.quantity - sold.quantity } : invItem;
        });
        setInventory(updatedInv);
        localStorage.setItem('bizflow_guest_inventory', JSON.stringify(updatedInv));

        // Update Customer
        let updatedCusts = [...customers];
        const existingIdx = updatedCusts.findIndex(c => c.phone === customerInfo.phone);
        if (existingIdx > -1) {
          updatedCusts[existingIdx] = {
            ...updatedCusts[existingIdx],
            totalSpent: updatedCusts[existingIdx].totalSpent + total,
            totalDue: updatedCusts[existingIdx].totalDue + dueAmount
          };
        } else {
          // Fix: Added missing 'email' property to match Customer type
          updatedCusts.unshift({
            id: `CUST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            name: customerInfo.name, 
            email: '', 
            phone: customerInfo.phone, 
            address: customerInfo.address,
            totalSpent: total, 
            totalDue: dueAmount
          });
        }
        setCustomers(updatedCusts);
        localStorage.setItem('bizflow_guest_customers', JSON.stringify(updatedCusts));
      } else {
        // Regular Mode (Supabase)
        const { data: savedSale, error: saleError } = await supabase.from('sales').insert([saleData]).select();
        if (saleError) throw saleError;
        if (savedSale) setSales(prev => [savedSale[0], ...prev]);
        // Note: Inventory & Customer updates would happen here via RPC or separate calls in a real app
      }

      setLastSale(saleData as Sale);
      setSelectedItems([]); setCustomerInfo({ name: '', phone: '', address: '' }); setPaidAmount(0);
    } catch (err) {
      console.error(err);
      alert("বিক্রয় সম্পন্ন করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">বিক্রয় ও ইনভয়েসিং</h1>
        <button onClick={() => { setLastSale(null); setIsModalOpen(true); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 transition-transform active:scale-95">
          <ShoppingBag size={18} /> নতুন বিক্রয়
        </button>
      </div>

      <DataTable 
        columns={[
          { header: 'রসিদ নং', accessor: (s: Sale) => <span className="digit font-bold text-slate-500">{s.id}</span> },
          { header: 'কাস্টমার', accessor: (s: Sale) => <div><p className="font-bold">{s.customerName}</p><p className="text-[10px] text-slate-400 digit">{s.customerPhone}</p></div> },
          { header: 'মোট টাকা', accessor: (s: Sale) => <span className="digit font-bold text-indigo-600">৳{toBN(s.totalAmount)}</span> },
          { header: 'বাকি', accessor: (s: Sale) => <span className={`digit font-bold ${s.dueAmount > 0 ? 'text-red-500' : 'text-slate-300'}`}>৳{toBN(s.dueAmount)}</span> },
          { header: 'অ্যাকশন', accessor: (s: Sale) => <button onClick={() => {}} className="p-2 text-emerald-500"><MessageCircle size={18} /></button> },
        ]} 
        data={sales} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-5xl p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
            {!lastSale && (
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-20"
              >
                <X size={28} />
              </button>
            )}

            {lastSale ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 text-center">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} /></div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">বিক্রয় সম্পন্ন হয়েছে!</h2>
                 <p className="text-slate-500 mb-8">৳{toBN(lastSale.totalAmount)} টাকার মেমো সফলভাবে সেভ হয়েছে।</p>
                 <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">বন্ধ করুন</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-hidden pt-4">
                <div className="lg:col-span-7 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                   <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">কাস্টমার তথ্য</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-1">নাম</label>
                            <input type="text" placeholder="কাস্টমারের নাম" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 ml-1">মোবাইল</label>
                            <input type="text" placeholder="মোবাইল নম্বর" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none digit" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">পণ্য নির্বাচন করুন</h3>
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.map(item => (
                          <button 
                            key={item.id} onClick={() => addItemToCart(item.id)} 
                            className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all text-left group"
                          >
                             <div>
                               <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600">{item.name}</p>
                               <p className="text-[10px] text-slate-400 digit">স্টক: {toBN(item.quantity)} {item.unit}</p>
                             </div>
                             <span className="font-bold text-indigo-600 digit">৳{toBN(item.price)}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="lg:col-span-5 bg-slate-900 rounded-[32px] p-8 text-white flex flex-col shadow-2xl overflow-hidden relative">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">মেমো সামারি</h3>
                   <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar text-slate-200">
                      {selectedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                           <ShoppingBag size={48} className="mb-2" />
                           <p className="text-xs font-bold">কোনো পণ্য যোগ করা হয়নি</p>
                        </div>
                      ) : selectedItems.map(item => (
                        <div key={item.itemId} className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                           <div>
                             <p className="font-bold">{item.itemName}</p>
                             <p className="text-[10px] text-slate-500 digit">{toBN(item.quantity)} {item.unit} x ৳{toBN(item.price)}</p>
                           </div>
                           <button onClick={() => setSelectedItems(prev => prev.filter(i => i.itemId !== item.itemId))} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                      <div className="flex justify-between font-bold text-2xl">
                        <span className="text-slate-400">মোট বিল</span>
                        <span className="digit text-indigo-400">৳{toBN(calculateTotal())}</span>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">পরিশোধিত (৳)</label>
                         <input 
                            type="number" 
                            className="w-full bg-slate-800 border-none p-4 rounded-2xl outline-none digit text-emerald-400 font-bold text-xl focus:ring-2 focus:ring-emerald-500/20" 
                            value={paidAmount} 
                            onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)} 
                          />
                      </div>
                      <div className="flex justify-between font-bold text-lg px-1">
                        <span className="text-slate-400">বাকি</span>
                        <span className={`digit ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>৳{toBN(dueAmount)}</span>
                      </div>
                      <button 
                        onClick={handleCompleteSale} 
                        disabled={loading || selectedItems.length === 0} 
                        className="w-full bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "বিক্রয় সম্পন্ন করুন"}
                      </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
