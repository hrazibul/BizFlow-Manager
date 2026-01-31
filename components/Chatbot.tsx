
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ChatbotProps {
  businessData: any;
}

const Chatbot: React.FC<ChatbotProps> = ({ businessData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'স্বাগতম! আমি আপনার বিজফ্লো এসিস্ট্যান্ট। আপনার ব্যবসা সম্পর্কে যেকোনো প্রশ্ন আমাকে করতে পারেন।' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize AI client only when needed
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const systemInstruction = `
    You are a smart business assistant for "BizFlow Manager" tailored for Bengali speaking users.
    Your task is to analyze the user's business data and provide concise, helpful answers in BENGALI language.
    
    Business Context:
    Business Name: ${businessData.businessName}
    Current Inventory Items: ${businessData.inventory?.length || 0}
    Current Sales Count: ${businessData.sales?.length || 0}
    Total Customers: ${businessData.customers?.length || 0}
    Raw Data Summary: ${JSON.stringify(businessData).slice(0, 2000)}...
    
    Guidelines:
    - Respond exclusively in BENGALI.
    - If user asks about stock, check inventory.
    - If user asks about profit/revenue, analyze sales and expenses.
    - Be professional, polite and use "আপনি" when addressing the user.
    - Keep responses short and actionable.
  `;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Create a chat session to maintain context
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        // We could pass history here, but for simplicity we start fresh each session or send cumulative prompt
      });

      const response = await chat.sendMessage({ message: userMsg });
      
      const botText = response.text || "দুঃখিত, আমি আপনার অনুরোধটি প্রসেস করতে পারছি না।";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      let errorMsg = 'দুঃখিত, এআই সার্ভারে সংযোগ করা যাচ্ছে না।';
      if (error.message?.includes('API_KEY')) {
        errorMsg = 'API Key সেট করা নেই। দয়া করে এডমিনের সাথে যোগাযোগ করুন।';
      }
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-[320px] md:w-[400px] h-[500px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-5 bg-indigo-600 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Bot size={22} />
              </div>
              <div>
                <p className="font-bold text-sm">বিজফ্লো এসিস্ট্যান্ট</p>
                <div className="flex items-center space-x-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                   <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">অনলাইন</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm font-medium'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ডাটা বিশ্লেষণ করছি</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="আপনার ব্যবসার প্রশ্ন এখানে লিখুন..."
                className="flex-1 text-sm bg-transparent px-3 py-2 outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()} 
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-90"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-16 h-16 bg-indigo-600 rounded-[24px] shadow-2xl flex items-center justify-center text-white hover:scale-110 hover:rotate-6 transition-all duration-300 relative group"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
          <MessageSquare size={28} />
          <span className="absolute right-20 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            এআই এসিস্ট্যান্ট
          </span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
