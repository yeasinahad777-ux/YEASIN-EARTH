import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      role: 'model',
      content: 'হ্যালো! আমি YEASIN EARTH এর AI অ্যাসিস্ট্যান্ট। পৃথিবীর যেকোনো দেশ, ভূগোল, বা মুদ্রা সম্পর্কে আমাকে প্রশ্ন করতে পারেন।'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep track of the chat session
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Initialize chat session if it doesn't exist
      if (!chatSessionRef.current) {
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3.1-flash-lite-preview',
          config: {
            systemInstruction: "You are the AI Assistant for the 'YEASIN EARTH' web application. Your name is EarthBot. You represent the application built by Yeasin. The app allows users to explore 196 countries on a 3D globe, convert currencies, read geographical facts, and take tests. Answer questions gracefully and concisely about geography, currency, and the app itself, in the language the user speaks (defaulting to Bengali if possible).",
          }
        });
      }

      const response = await chatSessionRef.current.sendMessage({ message: userMessage });
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: response.text || 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।' 
      }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: 'দুঃখিত, সংযোগে কোনো সমস্যা হয়েছে। API Key ঠিক আছে কিনা চেক করুন বা কিছুক্ষণ পর চেষ্টা করুন।' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[80vh] sm:h-[600px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 sm:p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Earth AI গাইড</h3>
                  <p className="text-sm text-purple-200">স্মার্ট চ্যাটবট ও Q&A</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors self-start"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--bg)]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 sm:gap-4 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`p-2 sm:p-2.5 rounded-full h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={24} />}
                  </div>
                  <div className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500 text-white rounded-tr-none' 
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] rounded-tl-none'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="markdown-body prose-sm sm:prose-base prose-p:leading-tight prose-a:text-purple-500 dark:text-gray-100">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 sm:gap-4 max-w-[80%]">
                  <div className="p-2.5 rounded-full h-12 w-12 flex items-center justify-center shrink-0 shadow-sm bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    <Bot size={24} />
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-purple-500 rounded-tl-none flex items-center gap-3 shadow-sm">
                    <Loader2 size={20} className="animate-spin" /> <span className="font-medium">উত্তর তৈরি হচ্ছে...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-3 relative max-w-4xl mx-auto"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="আপনার প্রশ্ন জিজ্ঞাসা করুন (যেমন: বাংলাদেশের আয়তন কত?)"
                  className="flex-1 bg-[var(--hover-bg)] border border-[var(--border)] text-[var(--text-main)] px-5 py-4 rounded-full text-sm sm:text-base outline-none focus:border-purple-500 pr-14 transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
