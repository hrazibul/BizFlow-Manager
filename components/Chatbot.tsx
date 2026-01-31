
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        You are a smart business assistant for "BizFlow Manager" tailored for Bengali speaking users.
        Your task is to analyze the user's business data and provide concise, helpful answers in BENGALI language.
        
        Business Context:
        Business Name: ${businessData.businessName}
        Current Data (JSON): ${JSON.stringify(businessData)}
        
        Guidelines:
        - Respond exclusively in BENGALI.
        - Sum up revenue from 'sales', check 'inventory' or 'expenses' as requested.
        - Be professional and encouraging.
      `;

      // Use the recommended model for complex reasoning and data analysis
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // Extract text from the response using the .text property
      const botText = response.text || "দুঃখিত, আমি আপনার অনুরোধটি প্রসেস করতে পারছি না।";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'দুঃখিত, এআই সার্ভারে সংযোগ করা যাচ্ছে না।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-indigo-600 rounded-t-2xl flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-bold">বিজফ্লো এসিস্ট্যান্ট</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-400 font-medium">চিন্তা করছি...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="কিছু লিখুন..."
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
