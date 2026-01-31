
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, Building2, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { supabase } from '../supabase';

interface AuthProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
  initialMode: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { businessName } }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          onSignup({
            id: data.user.id,
            email: data.user.email || '',
            businessName: businessName
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email || '',
            businessName: data.user.user_metadata?.businessName || 'আমার ব্যবসা'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'অথেনটিকেশন ফেইল হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    try {
      sessionStorage.setItem('bizflow_is_guest', 'true');
      onLogin({
        id: 'guest',
        email: 'guest@local.browser',
        businessName: 'গেস্ট ব্যবসা'
      });
    } catch (e) {
      alert("ব্রাউজার গেস্ট মোড সাপোর্ট করছে না।");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Column: Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 max-w-lg text-white space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-[28px] text-white font-black text-4xl mb-4 border border-white/20 shadow-2xl">
            B
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black leading-tight tracking-tight">
              আপনার ব্যবসাকে করুন <br />
              <span className="text-indigo-200">স্মার্ট ও গতিশীল</span>
            </h2>
            <p className="text-lg text-indigo-100 font-medium leading-relaxed">
              বিজফ্লো ম্যানেজারের মাধ্যমে ইনভেন্টরি, সেলস এবং কাস্টমার ম্যানেজমেন্ট এখন হবে আরও সহজ ও নির্ভুল।
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-2 bg-indigo-400/20 rounded-lg text-indigo-200"><Zap size={24} /></div>
              <div>
                <p className="font-bold">রিয়েল-টাইম ট্র্যাকিং</p>
                <p className="text-sm text-indigo-200/80">প্রতিটি বিক্রয় ও স্টকের হিসাব রাখুন সাথে সাথে।</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-2 bg-indigo-400/20 rounded-lg text-indigo-200"><BarChart3 size={24} /></div>
              <div>
                <p className="font-bold">অটোমেটেড রিপোর্ট</p>
                <p className="text-sm text-indigo-200/80">ব্যবসায়িক লাভ-ক্ষতির পূর্ণাঙ্গ রিপোর্ট এক ক্লিকেই।</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-2 bg-indigo-400/20 rounded-lg text-indigo-200"><ShieldCheck size={24} /></div>
              <div>
                <p className="font-bold">নিরাপদ ডাটাবেস</p>
                <p className="text-sm text-indigo-200/80">আপনার সকল তথ্য থাকবে আমাদের শক্তিশালী ক্লাউডে।</p>
              </div>
            </div>
          </div>

          <p className="pt-8 text-indigo-300 text-sm font-bold flex items-center">
             <CheckCircle2 className="mr-2 text-indigo-200" size={16} />
             ৫০০+ ক্ষুদ্র ব্যবসায়ী আমাদের ওপর আস্থাশীল
          </p>
        </div>
      </div>

      {/* Right Column: Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-slate-50 md:bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl text-white font-bold text-xl mb-4 shadow-xl">B</div>
            <h1 className="text-3xl font-bold text-slate-800">বিজফ্লো</h1>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {mode === 'login' ? 'স্বাগতম জানাই!' : 'একাউন্ট তৈরি করুন'}
            </h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? 'আপনার ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন।' : 'আপনার ব্যবসার তথ্য দিয়ে প্রোফাইল তৈরি করুন।'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ব্যবসার নাম</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text" required placeholder="যেমন: জননী ট্রেডার্স" value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-600 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="email" required placeholder="example@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">পাসওয়ার্ড</label>
                {mode === 'login' && <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="password" required placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <span className="text-lg">{mode === 'login' ? 'লগইন করুন' : 'সাইন আপ করুন'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white md:bg-white px-4 text-slate-400 font-bold tracking-[0.2em]">অথবা</span></div>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="w-full py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Zap className="text-amber-500" size={18} />
            <span>সরাসরি ডেমো দেখুন (গেস্ট)</span>
          </button>

          <div className="pt-6 text-center text-sm font-semibold text-slate-500">
            <p>
              {mode === 'login' ? "আমাদের সিস্টেমে নতুন?" : "ইতিমধ্যেই একাউন্ট আছে?"}{' '}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                className="text-indigo-600 font-bold hover:underline transition-all"
              >
                {mode === 'login' ? 'নতুন একাউন্ট খুলুন' : 'লগইন করুন'}
              </button>
            </p>
          </div>

          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-10">
            &copy; ২০২৪ বিজফ্লো ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
