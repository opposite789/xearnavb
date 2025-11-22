
import React, { useState } from 'react';
import { QuizData, Question, Language } from '../types';
import { CheckCircle2, XCircle, RefreshCw, ChevronRight, ChevronLeft, Award, User } from 'lucide-react';
import CertificateView from './CertificateView';

interface QuizViewProps {
  data: QuizData;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  uiLanguage: Language;      // For navigation, buttons, labels
  contentLanguage: Language; // For actual quiz text
  translations: any;
}

type ViewState = 'quiz' | 'nameInput' | 'certificate';

const QuizView: React.FC<QuizViewProps> = ({ data, onLoadMore, isLoadingMore, uiLanguage, contentLanguage, translations }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [viewState, setViewState] = useState<ViewState>('quiz');
  const [studentName, setStudentName] = useState('');

  const questions = data.questions;
  const currentQuestion = questions[currentIdx];
  const isUiRtl = uiLanguage === 'ar';
  const isContentRtl = contentLanguage === 'ar';

  const handleSelect = (optionIdx: number) => {
    if (showResult[currentQuestion.id]) return;
    
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIdx }));
    setShowResult(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // End of quiz
      setViewState('nameInput');
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) score++;
    });
    return Math.round((score / questions.length) * 100);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim().length > 0) {
      setViewState('certificate');
    }
  };

  // --- RENDER: CERTIFICATE ---
  if (viewState === 'certificate') {
    return (
      <CertificateView 
        studentName={studentName} 
        score={calculateScore()} 
        language={uiLanguage} // Certificate uses UI language structure
        translations={translations} 
      />
    );
  }

  // --- RENDER: NAME INPUT ---
  if (viewState === 'nameInput') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-zinc-900/50 border border-gold-500/30 text-center animate-fade-in-up" dir={isUiRtl ? 'rtl' : 'ltr'}>
        <div className="w-20 h-20 bg-black rounded-full border border-gold-500 mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          <Award className="text-gold-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{translations.quizCompleted}</h2>
        <p className="text-zinc-400 mb-8">{translations.enterNamePrompt}</p>
        
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="relative">
             <User className={`absolute top-3.5 text-zinc-500 ${isUiRtl ? 'right-4' : 'left-4'}`} size={20} />
             <input 
               type="text" 
               value={studentName}
               onChange={(e) => setStudentName(e.target.value)}
               placeholder={translations.namePlaceholder}
               className={`w-full bg-black border border-zinc-700 rounded-lg py-3 px-12 text-white placeholder:text-zinc-600 focus:border-gold-500 focus:outline-none transition-colors ${isUiRtl ? 'text-right' : 'text-left'}`}
               autoFocus
             />
          </div>
          <button 
            type="submit"
            disabled={studentName.trim().length === 0}
            className="w-full py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-gold-900/20"
          >
            {translations.getCertificate}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-zinc-500">
          {translations.finalScore}: <span className="text-gold-500 font-bold">{calculateScore()}%</span>
        </div>
      </div>
    );
  }

  // --- RENDER: QUIZ ---
  const isCorrect = selectedAnswers[currentQuestion.id] === currentQuestion.correctOptionIndex;
  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto pb-20" dir={isUiRtl ? 'rtl' : 'ltr'}>
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-gold-400 text-sm tracking-widest uppercase mb-1 font-medium">{translations.knowledgeCheck}</h2>
          <div className="text-zinc-400 text-sm">
            {translations.question} <span className="text-white font-bold">{currentIdx + 1}</span> {translations.of} {questions.length}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-gold-600/10 hover:bg-gold-600/20 text-gold-500 border border-gold-600/30 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50 font-medium"
          >
            {isLoadingMore ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {translations.generateMore}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1 rounded-full mb-8 overflow-hidden" dir="ltr">
        <div 
          className="bg-gradient-to-r from-gold-600 to-yellow-400 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-10 shadow-2xl relative">
        {/* Question Text uses Content Language Direction */}
        <h3 
           className={`text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed ${isContentRtl ? 'font-arabic' : ''}`}
           dir={isContentRtl ? 'rtl' : 'ltr'}
        >
          {currentQuestion.text}
        </h3>

        <div className="space-y-3" dir={isContentRtl ? 'rtl' : 'ltr'}>
          {currentQuestion.options.map((option, idx) => {
            let stateClass = "border-zinc-700 hover:bg-zinc-800 text-zinc-300";
            
            if (hasAnswered) {
              if (idx === currentQuestion.correctOptionIndex) {
                stateClass = "border-green-600/50 bg-green-900/10 text-green-400"; // Correct
              } else if (idx === selectedAnswers[currentQuestion.id]) {
                stateClass = "border-red-600/50 bg-red-900/10 text-red-400"; // Wrong selection
              } else {
                stateClass = "border-zinc-800 opacity-50"; // Others
              }
            } else if (selectedAnswers[currentQuestion.id] === idx) {
               stateClass = "border-gold-500 bg-gold-900/10 text-gold-400";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={hasAnswered}
                className={`w-full p-4 rounded-lg border transition-all duration-200 flex items-center group text-start ${stateClass} ${isContentRtl ? 'flex-row-reverse font-arabic' : ''}`}
              >
                <div className={`flex items-center gap-4 w-full ${isContentRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border flex-shrink-0 ${hasAnswered && idx === currentQuestion.correctOptionIndex ? 'border-green-500 bg-green-500 text-black' : 'border-zinc-600 text-zinc-500 group-hover:border-gold-500 group-hover:text-gold-500'}`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="flex-grow">{option}</span>
                </div>
                
                <div className="flex-shrink-0 mx-2">
                  {hasAnswered && idx === currentQuestion.correctOptionIndex && <CheckCircle2 size={20} className="text-green-500" />}
                  {hasAnswered && idx === selectedAnswers[currentQuestion.id] && idx !== currentQuestion.correctOptionIndex && <XCircle size={20} className="text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation Reveal */}
        {hasAnswered && (
          <div 
            className={`mt-8 p-4 rounded-lg border ${isCorrect ? 'border-green-900/50 bg-green-900/5' : 'border-red-900/50 bg-red-900/5'} animate-fade-in`}
            dir={isContentRtl ? 'rtl' : 'ltr'}
          >
            <p className="text-sm font-bold mb-1 opacity-80 uppercase tracking-wider">
              {isCorrect ? translations.correct : translations.incorrect}
            </p>
            <p className={`text-zinc-300 leading-relaxed ${isContentRtl ? 'font-arabic' : ''}`}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation - UI Language */}
      <div className={`flex mt-8 ${isUiRtl ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
        <button 
          onClick={prevQuestion}
          disabled={currentIdx === 0}
          className={`px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 transition-all flex items-center gap-2 font-medium ${isUiRtl ? 'flex-row-reverse' : ''}`}
        >
          {isUiRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} 
          {translations.previous}
        </button>
        
        <button 
          onClick={nextQuestion}
          disabled={!hasAnswered}
          className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg ${
            isLastQuestion 
              ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-gold-900/20' 
              : 'bg-gradient-to-r from-gold-600 to-yellow-500 text-black hover:from-gold-500 hover:to-yellow-400 shadow-gold-900/20'
            } disabled:opacity-30 disabled:grayscale ${isUiRtl ? 'flex-row-reverse' : ''}`}
        >
          {isLastQuestion ? translations.finishQuiz : translations.next}
          {isLastQuestion ? <Award size={18} /> : (isUiRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
        </button>
      </div>
    </div>
  );
};

export default QuizView;
