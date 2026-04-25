import { useState, useEffect } from 'react';
import { countries } from './data';
import { Map, Users, Coins, ArrowLeft } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface QuizSectionProps {
  onExit: () => void;
}

type QuizCategory = 'capital' | 'neighbor' | 'currency' | null;

export default function QuizSection({ onExit }: QuizSectionProps) {
  const [category, setCategory] = useState<QuizCategory>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const [currenciesMap, setCurrenciesMap] = useState<Record<string, string>>({});
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  // Fetch currencies on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=cca2,currencies')
      .then(res => res.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((c: any) => {
          if (c.cca2 && c.currencies) {
            const currObj = Object.values(c.currencies)[0] as any;
            map[c.cca2.toLowerCase()] = currObj?.name || 'অজানা';
          }
        });
        setCurrenciesMap(map);
        setIsLoadingCurrencies(false);
      })
      .catch(err => {
        console.error("Failed to fetch currencies", err);
        setIsLoadingCurrencies(false);
      });
  }, []);

  const startQuiz = (selectedCategory: QuizCategory) => {
    if (!selectedCategory) return;
    setCategory(selectedCategory);

    const questions: Question[] = [];
    const tempCountries = [...countries].sort(() => 0.5 - Math.random());

    let validCountries = tempCountries;
    if (selectedCategory === 'currency') {
      validCountries = tempCountries.filter(c => currenciesMap[c.code] && currenciesMap[c.code] !== 'অজানা');
    }

    for (let i = 0; i < 10; i++) {
      const target = validCountries[i];
      let qText = '';
      let correctAns = '';

      if (selectedCategory === 'capital') {
        qText = `❓ '${target.country}' এর রাজধানী কী?`;
        correctAns = target.capital;
      } else if (selectedCategory === 'neighbor') {
        qText = `❓ '${target.country}' এর প্রতিবেশী দেশ কোনগুলো?`;
        correctAns = target.neighbors;
      } else if (selectedCategory === 'currency') {
        qText = `❓ '${target.country}' এর মুদ্রার নাম কী?`;
        correctAns = currenciesMap[target.code];
      }

      const options = [correctAns];
      while (options.length < 4) {
        const randCountry = validCountries[Math.floor(Math.random() * validCountries.length)];
        let wrongAns = '';
        if (selectedCategory === 'capital') wrongAns = randCountry.capital;
        else if (selectedCategory === 'neighbor') wrongAns = randCountry.neighbors;
        else if (selectedCategory === 'currency') wrongAns = currenciesMap[randCountry.code];

        if (!options.includes(wrongAns) && wrongAns !== 'নেই, নেই' && wrongAns !== 'অজানা' && wrongAns) {
          options.push(wrongAns);
        }
      }

      questions.push({
        question: qText,
        options: options.sort(() => 0.5 - Math.random()),
        answer: correctAns
      });
    }

    setQuizQuestions(questions);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsFinished(false);
  };

  const handleAnswer = (ans: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    setSelectedAnswer(ans);
    if (ans === quizQuestions[currentQIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < 9) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto bg-[#0a0a12] p-8 rounded-3xl border border-white/10 shadow-2xl text-center mt-10">
        <h2 className="text-3xl font-black text-white mb-2">কুইজের বিষয় নির্বাচন করুন</h2>
        <p className="text-gray-400 mb-8 font-medium">আপনি কোন বিষয়ের উপর পরীক্ষা দিতে চান তা নিচে থেকে বেছে নিন</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => startQuiz('capital')}
            className="flex items-center gap-4 p-5 bg-[#030712] border border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-white/5 transition-all text-left group shadow-lg"
          >
            <div className="bg-blue-600 text-white p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-500/20">
              <Map size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">দেশের রাজধানী</h3>
              <p className="text-sm text-gray-400 font-medium">বিভিন্ন দেশের রাজধানীর নাম নিয়ে কুইজ</p>
            </div>
          </button>

          <button 
            onClick={() => startQuiz('neighbor')}
            className="flex items-center gap-4 p-5 bg-[#030712] border border-white/10 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 transition-all text-left group shadow-lg"
          >
            <div className="bg-indigo-600 text-white p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/20">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">প্রতিবেশী দেশ</h3>
              <p className="text-sm text-gray-400 font-medium">কোন দেশের আশেপাশে কোন দেশ আছে তা নিয়ে কুইজ</p>
            </div>
          </button>

          <button 
            onClick={() => startQuiz('currency')}
            disabled={isLoadingCurrencies}
            className={`flex items-center gap-4 p-5 bg-[#030712] border border-white/10 rounded-2xl text-left transition-all group shadow-lg ${isLoadingCurrencies ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500/50 hover:bg-white/5'}`}
          >
            <div className="bg-emerald-600 text-white p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-emerald-500/20">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">দেশের মুদ্রা (Currency)</h3>
              <p className="text-sm text-gray-400 font-medium">
                {isLoadingCurrencies ? 'মুদ্রার তথ্য লোড হচ্ছে...' : 'বিভিন্ন দেশের মুদ্রার নাম নিয়ে কুইজ'}
              </p>
            </div>
          </button>
        </div>

        <button 
          onClick={onExit}
          className="mt-8 px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors font-bold flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> ফিরে যান
        </button>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return <div className="text-center py-20 text-gray-500 text-lg font-medium">প্রশ্ন তৈরি করা হচ্ছে...</div>;
  }

  if (isFinished) {
    const remark = score >= 8 
      ? "🌟 অসাধারণ পারফরম্যান্স!" 
      : score >= 5 
        ? "👍 ভালো, আরও প্র্যাকটিস করুন!" 
        : "😔 আপনাকে আরও পড়তে হবে!";

    return (
      <div className="max-w-2xl mx-auto bg-[#0a0a12] p-10 rounded-3xl border border-white/10 shadow-2xl text-center mt-10">
        <h2 className="text-4xl font-black text-white mb-6">🎉 পরীক্ষা শেষ!</h2>
        <div className="text-2xl font-bold text-gray-400 mb-8">
          ১০ এর মধ্যে আপনি পেয়েছেন: <span className="text-blue-500 text-6xl block mt-6 mb-4 font-black">{score}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-10">{remark}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setCategory(null)}
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors shadow-lg"
          >
            🔄 অন্য বিষয়ে পরীক্ষা দিন
          </button>
          <button 
            onClick={onExit}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            🏠 হোম পেজে যান
          </button>
        </div>
      </div>
    );
  }

  const qData = quizQuestions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto bg-[#0a0a12] p-6 md:p-10 rounded-[32px] border border-white/10 shadow-2xl mt-4 md:mt-10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
         <div 
           className="h-full bg-blue-500 transition-all duration-300" 
           style={{ width: `${((currentQIndex) / 10) * 100}%` }}
         />
      </div>
      <div className="flex justify-between items-center mb-8 font-bold border-b border-white/5 pb-4 mt-2">
        <span className="text-gray-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">প্রশ্ন: <span className="text-white">{currentQIndex + 1}</span>/১০</span>
        <span className="text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">স্কোর: <span className="font-black text-emerald-300">{score}</span></span>
      </div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white mb-10 leading-relaxed tracking-tight">{qData.question}</h3>
      
      <div className="flex flex-col gap-4 mb-10">
        {qData.options.map((opt, idx) => {
          let btnClass = "w-full p-5 text-left text-lg bg-[#030712] text-white border border-white/10 rounded-2xl transition-all shadow-sm font-medium ";
          
          if (selectedAnswer) {
            if (opt === qData.answer) {
              btnClass += "bg-emerald-600 border-none shadow-emerald-500/30 ring-2 ring-emerald-400 font-bold";
            } else if (opt === selectedAnswer) {
              btnClass += "bg-rose-600 border-none shadow-rose-500/30 font-bold";
            } else {
              btnClass += "opacity-40 cursor-not-allowed";
            }
          } else {
            btnClass += "hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg cursor-pointer active:scale-[0.98]";
          }

          return (
            <button 
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={!!selectedAnswer}
              className={btnClass}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black border ${selectedAnswer ? (opt === qData.answer ? 'bg-emerald-500 border-emerald-400 text-white' : opt === selectedAnswer ? 'bg-rose-500 border-rose-400 text-white' : 'bg-white/5 border-white/10 text-gray-400') : 'bg-white/5 border-white/10 text-gray-400 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:text-white'}`}>
                    {String.fromCharCode(65 + idx)}
                 </div>
                 {opt}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <button 
          onClick={() => setCategory(null)}
          className="px-6 py-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all font-bold active:scale-95"
        >
          ❌ বাতিল করুন
        </button>

        {selectedAnswer && (
          <button 
            onClick={nextQuestion}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
          >
            পরবর্তী প্রশ্ন ➡️
          </button>
        )}
      </div>
    </div>
  );
}
