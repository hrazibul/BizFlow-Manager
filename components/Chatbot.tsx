
import React, { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    // Fix: Explicitly typing the new message to avoid 'string' inference for the 'role' property
    const newMessage: { role: 'user' | 'bot'; text: string } = { role: 'user', text: userMsg };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY not found in environment");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are a smart business assistant for "BizFlow Manager". Respond exclusively in BENGALI.
        Business Context:
        Name: ${businessData.businessName}
        Inventory: ${businessData.inventory?.length || 0} items
        Sales: ${businessData.sales?.length || 0} records
        Customers: ${businessData.customers?.length || 0} total
        
        Analyze the data provided and give business advice or answer queries specifically about this business.
        Data Context: ${JSON.stringify(businessData).slice(0, 3000)}
      `;

      // Fix: Use systemInstruction in the config object and simplified contents as per Gemini API guidelines
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: systemInstruction
        }
      });

      const botText = result.text || "দুঃখিত, আমি উত্তর খুঁজে পাচ্ছি না।";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = 'দুঃখিত, এআই সার্ভারে সংযোগ করা যাচ্ছে না।';
      if (error.message?.includes('API_KEY')) {
        errorMsg = 'API Key ভুল বা অনুপস্থিত। ভারসেল সেটিংসে API_KEY চেক করুন।';
      }
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-[320px] md:w-[400px] h-[500px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 overflow-hidden text-slate-800">
          <div className="p-5 bg-indigo-600 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Bot size={22} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">বিজফ্লো এসিস্ট্যান্ট</p>
                <div className="flex items-center space-x-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                   <span className="text-[10px] text-indigo-100 font-bold uppercase">অনলাইন</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-2">
                   <Loader2 className="animate-spin text-indigo-600" size={16} />
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">বিশ্লেষণ করছি...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="ব্যবসায়িক প্রশ্ন লিখুন..."
                className="flex-1 text-sm bg-transparent px-3 py-2 outline-none"
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white p-2.5 rounded-xl disabled:opacity-30">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-indigo-600 rounded-[24px] shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all">
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
