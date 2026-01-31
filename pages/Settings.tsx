
import React, { useState } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Building2, Lock, Bell, LogOut } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    businessName: user.businessName,
    email: user.email,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      businessName: formData.businessName,
      email: formData.email
    });
    alert('সেটিংস আপডেট করা হয়েছে!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">সেটিংস</h1>
        <p className="text-slate-500">আপনার ব্যবসা এবং একাউন্টের তথ্য এখানে পরিবর্তন করুন।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl">
            <Building2 size={18} />
            <span>ব্যবসার তথ্য</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <UserIcon size={18} />
            <span>একাউন্ট</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Lock size={18} />
            <span>নিরাপত্তা</span>
          </button>
        </aside>

        <div className="md:col-span-3 space-y-6">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">ব্যবসার তথ্য</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ব্যবসার নাম</label>
                <input 
                  type="text" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">কন্টাক্ট ইমেইল</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center justify-end pt-4">
                <button 
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  <Save size={18} />
                  <span>তথ্য সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">একাউন্ট ম্যানেজমেন্ট</h3>
            <p className="text-sm text-slate-500 mb-6">একাউন্ট এবং লগআউট সম্পর্কিত সেটিংস।</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onLogout}
                className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                <LogOut size={18} />
                <span>লগ আউট করুন</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-red-600 border border-red-100 bg-red-50/50 rounded-xl hover:bg-red-50 transition-all">
                একাউন্ট ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
