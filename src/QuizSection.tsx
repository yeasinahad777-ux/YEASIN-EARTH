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
      <div className="max-w-2xl mx-auto bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)] shadow-lg text-center mt-10">
        <h2 className="text-3xl font-bold text-[var(--primary)] mb-2">কুইজের বিষয় নির্বাচন করুন</h2>
        <p className="text-[var(--text-muted)] mb-8">আপনি কোন বিষয়ের উপর পরীক্ষা দিতে চান তা নিচে থেকে বেছে নিন</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => startQuiz('capital')}
            className="flex items-center gap-4 p-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--hover-bg)] transition-all text-left group"
          >
            <div className="bg-[var(--primary)] text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Map size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)]">দেশের রাজধানী</h3>
              <p className="text-sm text-[var(--text-muted)]">বিভিন্ন দেশের রাজধানীর নাম নিয়ে কুইজ</p>
            </div>
          </button>

          <button 
            onClick={() => startQuiz('neighbor')}
            className="flex items-center gap-4 p-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--hover-bg)] transition-all text-left group"
          >
            <div className="bg-blue-500 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)]">প্রতিবেশী দেশ</h3>
              <p className="text-sm text-[var(--text-muted)]">কোন দেশের আশেপাশে কোন দেশ আছে তা নিয়ে কুইজ</p>
            </div>
          </button>

          <button 
            onClick={() => startQuiz('currency')}
            disabled={isLoadingCurrencies}
            className={`flex items-center gap-4 p-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl text-left transition-all group ${isLoadingCurrencies ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--primary)] hover:bg-[var(--hover-bg)]'}`}
          >
            <div className="bg-amber-500 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)]">দেশের মুদ্রা (Currency)</h3>
              <p className="text-sm text-[var(--text-muted)]">
                {isLoadingCurrencies ? 'মুদ্রার তথ্য লোড হচ্ছে...' : 'বিভিন্ন দেশের মুদ্রার নাম নিয়ে কুইজ'}
              </p>
            </div>
          </button>
        </div>

        <button 
          onClick={onExit}
          className="mt-8 px-6 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-bg)] rounded-full transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> ফিরে যান
        </button>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return <div className="text-center py-20 text-[var(--text-muted)] text-lg">প্রশ্ন তৈরি করা হচ্ছে...</div>;
  }

  if (isFinished) {
    const remark = score >= 8 
      ? "🌟 অসাধারণ পারফরম্যান্স!" 
      : score >= 5 
        ? "👍 ভালো, আরও প্র্যাকটিস করুন!" 
        : "😔 আপনাকে আরও পড়তে হবে!";

    return (
      <div className="max-w-2xl mx-auto bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)] shadow-lg text-center mt-10">
        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-6">🎉 পরীক্ষা শেষ!</h2>
        <div className="text-2xl font-bold text-[var(--text-muted)] mb-8">
          ১০ এর মধ্যে আপনি পেয়েছেন: <span className="text-red-500 text-5xl block mt-4">{score}</span>
        </div>
        <p className="text-xl font-medium text-[var(--primary)] mb-8">{remark}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setCategory(null)}
            className="px-6 py-3 bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border)] rounded-full font-bold hover:bg-[var(--border)] transition-colors"
          >
            🔄 অন্য বিষয়ে পরীক্ষা দিন
          </button>
          <button 
            onClick={onExit}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            🏠 হোম পেজে যান
          </button>
        </div>
      </div>
    );
  }

  const qData = quizQuestions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto bg-[var(--surface)] p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6 font-bold">
        <span className="text-[var(--text-muted)]">প্রশ্ন: {currentQIndex + 1}/১০</span>
        <span className="text-green-600 dark:text-green-400">স্কোর: {score}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-[var(--primary)] mb-8 leading-relaxed">{qData.question}</h3>
      
      <div className="flex flex-col gap-3 mb-8">
        {qData.options.map((opt, idx) => {
          let btnClass = "w-full p-4 text-left text-lg bg-[var(--bg)] text-[var(--text-main)] border-2 border-[var(--border)] rounded-xl transition-colors ";
          
          if (selectedAnswer) {
            if (opt === qData.answer) {
              btnClass += "bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600";
            } else if (opt === selectedAnswer) {
              btnClass += "bg-red-500 border-red-500 text-white dark:bg-red-600 dark:border-red-600";
            } else {
              btnClass += "opacity-50 cursor-not-allowed";
            }
          } else {
            btnClass += "hover:bg-[var(--hover-bg)] hover:border-[var(--primary)] cursor-pointer";
          }

          return (
            <button 
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={!!selectedAnswer}
              className={btnClass}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={() => setCategory(null)}
          className="px-4 py-2 text-red-500 border border-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
        >
          ❌ বাতিল করুন
        </button>

        {selectedAnswer && (
          <button 
            onClick={nextQuestion}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            পরবর্তী প্রশ্ন ➡️
          </button>
        )}
      </div>
    </div>
  );
}
