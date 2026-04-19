import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'হ্যালো! আমি আপনার 3D এক্সপ্লোরার এআই (AI) অ্যাসিস্ট্যান্ট। পৃথিবীর যেকোনো দেশ বা ভূগোল সম্পর্কে আমাকে সরাসরি প্রশ্ন করতে পারেন!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const aiClient = getAiClient();
      if (!aiClient) {
        setMessages(prev => [...prev, { role: 'model', text: 'দয়া করে ড্যাশবোর্ড থেকে API Key সেট করুন।' }]);
        setIsLoading(false);
        return;
      }

      // Convert history to format needed by API, skipping the first hardcoded greeting if you want, 
      // but let's just pass the user's new message and a system instruction config
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview', // fast and general
        contents: [
          ...messages.filter(m => m.role === 'user' || m.text !== 'হ্যালো! আমি আপনার 3D এক্সপ্লোরার এআই (AI) অ্যাসিস্ট্যান্ট। পৃথিবীর যেকোনো দেশ বা ভূগোল সম্পর্কে আমাকে সরাসরি প্রশ্ন করতে পারেন!').map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "You are an expert geography, mapping, and globe assistant for the 'YEASIN EARTH' platform. Provide facts about countries, population, and geography. Always reply in clear Bengali.",
          tools: [{ googleSearch: {} }] // Add search grounding to the chatbot
        }
      });

      if (response && response.text) {
         setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', text: 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' }]);
      }

    } catch (error: any) {
      console.error("Chat error", error);
      const errStr = JSON.stringify(error).toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota')) {
        setMessages(prev => [...prev, { role: 'model', text: 'দুঃখিত, এআই (AI)-এর ফ্রি কোটা শেষ হয়ে গেছে।' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-[var(--primary)] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 flex items-center justify-center group"
      >
        <MessageCircle size={28} />
        <span className="absolute -top-10 bg-black text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
          AI-কে প্রশ্ন করুন
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 md:right-10 w-[350px] md:w-[400px] h-[500px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-main)] leading-none mb-1">Earth AI</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Powered by Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--hover-bg)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[var(--primary)] text-white rounded-br-sm' 
                        : 'bg-[var(--bg)] text-[var(--text-main)] border border-[var(--border)] rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'model' && msg.text !== messages[0].text && <span className="block mb-1 opacity-50 text-[10px]">🤖 AI</span>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-bl-sm p-3 flex gap-1">
                    <span className="w-2 h-2 bg-[var(--primary)]/50 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[var(--primary)]/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-[var(--primary)]/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[var(--bg)] border-t border-[var(--border)]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-2 focus-within:border-[var(--primary)] transition-colors shadow-sm"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 text-[var(--primary)] disabled:opacity-50 hover:bg-[var(--primary)]/10 rounded-full transition-colors disabled:hover:bg-transparent"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
