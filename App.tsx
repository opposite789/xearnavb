
import React, { useState } from 'react';
import { Upload, BrainCircuit, AlertCircle, FileType, Check, Globe, Sparkles, ArrowRight, GraduationCap, Coffee, FileText, Sun, Menu, X, PenTool } from 'lucide-react';
import { generateSummary, generateQuiz } from './services/geminiService';
import { SummaryData, QuizData, AppState, Tab, UploadedFile, Language, SummaryTone } from './types';
import SummaryView from './components/SummaryView';
import QuizView from './components/QuizView';
import GeneratorView from './components/GeneratorView';

// Localization Dictionary
const i18n = {
  en: {
    welcome: "Welcome to",
    chooseLang: "Choose Your Language",
    uploadTitle: "Smart Student Platform",
    uploadSubtitle: "Upload your study files and AVB will summarize them and quiz you immediately.",
    clickToUpload: "Click to upload file",
    fileType: "Supports PDF, DOCX, TXT",
    analyzing: "Reading file...",
    generatingSummary: "Analyzing content & generating summary...",
    craftingQuiz: "Crafting 30+ custom questions...",
    multiFormat: "Multi-Format",
    aiAnalysis: "AI Analysis",
    instantQuiz: "Instant Quiz",
    summary: "Summary",
    quiz: "Quiz",
    generator: "Pro Writer",
    footer: "Powered by Gemini 2.5 Flash.",
    error: "Failed to process file. Please ensure the API key is valid and the file is not corrupted.",
    fileError: "Please upload a PDF, DOCX, or TXT file.",
    summaryHeader: "Document Analysis",
    savePdf: "Print / Save PDF",
    knowledgeCheck: "Knowledge Check",
    question: "Question",
    of: "of",
    saveQuiz: "Download Quiz",
    generateMore: "Generate More",
    correct: "Correct",
    incorrect: "Incorrect",
    answer: "Answer",
    explanation: "Explanation",
    previous: "Previous",
    next: "Next",
    finishQuiz: "Finish & Get Certificate",
    quizCompleted: "Quiz Completed!",
    enterNamePrompt: "Enter your name to generate your official certificate.",
    namePlaceholder: "Your Full Name",
    getCertificate: "Get Certificate",
    finalScore: "Final Score",
    certTitle: "Certificate of Completion",
    certSubtitle: "Official Completion Document",
    certPresent: "This certifies that",
    certBody: "Has successfully completed the automated assessment based on the provided study material, demonstrating understanding of the core concepts.",
    score: "Score",
    downloadCert: "Download Certificate",
    currentAccuracy: "Current Accuracy",
    summaryStyle: "Choose Summary Style",
    formal: "Formal & Professional",
    formalDesc: "Academic structure.",
    friendly: "Friendly & Casual",
    friendlyDesc: "Simple & conversational.",
    uploadNew: "Upload New File",
    brandName: "AVB Education",
    developer: "Developer",
    // Generator Translations
    genTitle: "Content Studio",
    genSubtitle: "AI Professional Writer",
    genTypeLabel: "Choose Content Type",
    genTopicLabel: "Enter Topic / Main Idea",
    genPlaceholder: "e.g. The impact of artificial intelligence on modern education systems...",
    genButton: "Generate Content",
    genProcessing: "Writing...",
    genWaiting: "Content will appear here...",
    genGenerating: "Crafting your content...",
    copy: "Copy Content",
    download: "Download Text",
    // New
    chooseContentLang: "Output Language",
    contentLangDesc: "Select language for Summary & Quiz"
  },
  ar: {
    welcome: "مرحباً بك في",
    chooseLang: "اختر لغتك",
    uploadTitle: "منصة الطالب الذكية",
    uploadSubtitle: "ارفع ملفاتك الدراسية وسيقوم AVB بتلخيصها واختبارك فيها فوراً",
    clickToUpload: "اضغط لرفع ملف",
    fileType: "يدعم PDF, DOCX, TXT",
    analyzing: "جاري قراءة الملف...",
    generatingSummary: "جاري تحليل المحتوى وإنشاء الملخص...",
    craftingQuiz: "جاري إعداد أكثر من ٣٠ سؤال مخصص...",
    multiFormat: "تنسيقات متعددة",
    aiAnalysis: "تحليل ذكي",
    instantQuiz: "اختبار فوري",
    summary: "الملخص",
    quiz: "الاختبار",
    generator: "الكاتب المحترف",
    footer: "مدعوم بواسطة Gemini 2.5 Flash.",
    error: "فشل في معالجة الملف. يرجى التأكد من صلاحية مفتاح API وأن الملف غير تالف.",
    fileError: "يرجى رفع ملف بصيغة PDF أو DOCX أو TXT.",
    summaryHeader: "تحليل المستند",
    savePdf: "طباعة / حفظ PDF",
    knowledgeCheck: "اختبار المعلومات",
    question: "سؤال",
    of: "من",
    saveQuiz: "تحميل الاختبار",
    generateMore: "توليد المزيد",
    correct: "إجابة صحيحة",
    incorrect: "إجابة خاطئة",
    answer: "الإجابة",
    explanation: "التفسير",
    previous: "السابق",
    next: "التالي",
    finishQuiz: "إنهاء واستلام الشهادة",
    quizCompleted: "تم إنهاء الاختبار!",
    enterNamePrompt: "أدخل اسمك لاستخراج شهادتك المعتمدة.",
    namePlaceholder: "اسمك الكامل",
    getCertificate: "استخراج الشهادة",
    finalScore: "النتيجة النهائية",
    certTitle: "شهادة إنجاز",
    certSubtitle: "وثيقة رسمية",
    certPresent: "تشهد هذه الوثيقة بأن",
    certBody: "قد أتم بنجاح التقييم الآلي بناءً على المواد الدراسية المقدمة، مظهراً استيعاباً للمفاهيم الأساسية.",
    score: "الدرجة",
    downloadCert: "تحميل الشهادة",
    currentAccuracy: "الدقة الحالية",
    summaryStyle: "اختر نمط الملخص",
    formal: "رسمي واحترافي",
    formalDesc: "هيكل أكاديمي.",
    friendly: "ودي وبسيط",
    friendlyDesc: "محادثة مبسطة.",
    uploadNew: "رفع ملف جديد",
    brandName: "منصة AVB التعليمية",
    developer: "المطور",
    // Generator Translations
    genTitle: "استوديو المحتوى",
    genSubtitle: "الكاتب الذكي المحترف",
    genTypeLabel: "اختر نوع المحتوى",
    genTopicLabel: "أدخل الموضوع أو الفكرة الرئيسية",
    genPlaceholder: "مثال: تأثير الذكاء الاصطناعي على أنظمة التعليم الحديثة...",
    genButton: "توليد المحتوى",
    genProcessing: "جاري الكتابة...",
    genWaiting: "سيظهر المحتوى هنا...",
    genGenerating: "جاري صياغة المحتوى...",
    copy: "نسخ النص",
    download: "تحميل ملف",
    // New
    chooseContentLang: "لغة المخرجات",
    contentLangDesc: "اختر لغة الملخص والاختبار"
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANGUAGE_SELECT);
  const [language, setLanguage] = useState<Language>('en'); // UI Language
  const [generationLanguage, setGenerationLanguage] = useState<Language>('en'); // Content Language
  const [summaryTone, setSummaryTone] = useState<SummaryTone>('formal');
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = i18n[language];
  const isRtl = language === 'ar';

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setGenerationLanguage(lang); // Default generation language matches UI
    setState(AppState.UPLOAD);
  };

  // File handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt')) {
        setError(t.fileError);
        return;
      }

      setError(null);
      setState(AppState.PROCESSING);
      setLoadingMsg(t.analyzing);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        
        const uploadedFile = {
          name: selectedFile.name,
          mimeType: selectedFile.type,
          data: base64String
        };
        setFile(uploadedFile);

        try {
          await processContent(uploadedFile);
        } catch (err) {
          setError(t.error);
          setState(AppState.UPLOAD);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const processContent = async (uploadedFile: UploadedFile) => {
    setProgress(0);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const increment = Math.max(0.2, remaining * 0.05); 
        return prev + increment;
      });
    }, 200);

    try {
      // 1. Generate Summary with selected tone AND selected generation language
      setLoadingMsg(t.generatingSummary);
      const summaryData = await generateSummary(uploadedFile.data, uploadedFile.mimeType, generationLanguage, summaryTone);
      setSummary(summaryData);

      // 2. Generate Initial Quiz (Batch 1) with selected generation language
      setLoadingMsg(t.craftingQuiz);
      const quizData = await generateQuiz(uploadedFile.data, uploadedFile.mimeType, generationLanguage, 30);
      setQuiz(quizData);

      clearInterval(interval);
      setProgress(100);
      
      // Smooth transition
      setTimeout(() => {
        setState(AppState.DASHBOARD);
      }, 800);

    } catch (e) {
      clearInterval(interval);
      console.error(e);
      throw e;
    }
  };

  const handleLoadMoreQuestions = async () => {
    if (!file || !quiz) return;
    setIsLoadingMore(true);
    try {
      const existingIds = quiz.questions.map(q => q.text);
      // Generate batch of 10 more in the specific generation language
      const newBatch = await generateQuiz(file.data, file.mimeType, generationLanguage, 10, existingIds);
      
      // Re-index new questions to continue ID sequence
      const lastId = quiz.questions.length;
      const reindexedNewQuestions = newBatch.questions.map((q, i) => ({
        ...q,
        id: lastId + i + 1
      }));

      setQuiz(prev => prev ? ({
        questions: [...prev.questions, ...reindexedNewQuestions]
      }) : newBatch);
      
    } catch (err) {
      alert('Could not generate more questions at this time.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleUploadNew = () => {
    setFile(null);
    setSummary(null);
    setQuiz(null);
    setActiveTab('summary');
    setProgress(0);
    setState(AppState.UPLOAD);
  };

  const renderUploadSubtitle = () => {
     if (language === 'ar') {
       return (
         <>
           ارفع ملفاتك الدراسية وسيقوم <span className="text-gold-500 font-bold">AVB</span> بتلخيصها واختبارك فيها فوراً
         </>
       );
     }
     return (
       <>
         Upload your study files and <span className="text-gold-500 font-bold">AVB</span> will summarize them and quiz you immediately.
       </>
     );
  };

  return (
    <div className={`min-h-screen bg-black text-neutral-200 selection:bg-gold-500/30 ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Navigation Bar */}
      {state !== AppState.LANGUAGE_SELECT && (
        <nav className="bg-black sticky top-0 z-50 py-4 border-b border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
             {/* Left Icon (Sun) */}
             <button className="text-white p-2 hover:bg-zinc-900 rounded-full transition-colors">
               <Sun size={24} className="text-gold-500" />
             </button>

             {/* Center - Upload New Button (Visible only on Dashboard) */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {state === AppState.DASHBOARD && (
                  <button 
                    onClick={handleUploadNew}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-gold-400 hover:border-gold-500/50 transition-all text-sm font-medium backdrop-blur-sm group shadow-lg shadow-black/50"
                  >
                    <Upload size={16} className="group-hover:scale-110 transition-transform" />
                    <span>{t.uploadNew}</span>
                  </button>
                )}
             </div>

             {/* Right Icon (Menu) - Opens Generator */}
             <button 
               onClick={() => setIsMenuOpen(true)}
               className="text-white p-2 hover:bg-zinc-900 rounded-full transition-colors z-50 relative"
             >
               <Menu size={24} className="text-gold-500" />
             </button>
          </div>

          {/* Secondary Tab Bar for Dashboard */}
          {state === AppState.DASHBOARD && (
            <div className="flex justify-center mt-4 gap-2 pb-2 px-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
                    activeTab === 'summary' 
                      ? 'bg-gold-500/10 border-gold-500 text-gold-400' 
                      : 'border-transparent text-zinc-500 hover:text-white'
                  }`}
                >
                  {t.summary}
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
                    activeTab === 'quiz' 
                      ? 'bg-gold-500/10 border-gold-500 text-gold-400' 
                      : 'border-transparent text-zinc-500 hover:text-white'
                  }`}
                >
                  {t.quiz} ({quiz?.questions.length ?? 0})
                </button>
            </div>
          )}
        </nav>
      )}

      {/* OVERLAY: Content Generator (Menu Feature) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black animate-fade-in overflow-y-auto">
          <GeneratorView 
            language={language} 
            translations={t} 
            onClose={() => setIsMenuOpen(false)} 
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-140px)] flex flex-col">
        
        {/* VIEW: LANGUAGE SELECT */}
        {state === AppState.LANGUAGE_SELECT && (
          <div className="max-w-4xl mx-auto w-full animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
             <div className="text-center mb-16 flex flex-col items-center">
                <h1 className="text-6xl font-serif font-black text-gold-500 tracking-tighter mb-2">AVB</h1>
                <p className="text-zinc-400 text-xl mt-2 tracking-wide">Premium AI Learning Assistant</p>
             </div>

             <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
                {/* English Option */}
                <button 
                  onClick={() => handleLanguageSelect('en')}
                  className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-gold-500/50 rounded-2xl p-8 transition-all duration-300 hover:bg-zinc-900/80 hover:-translate-y-1 shadow-lg hover:shadow-gold-900/20"
                >
                  <div className="flex flex-col items-center gap-4">
                     <h3 className="text-2xl font-serif text-white">English</h3>
                  </div>
                </button>

                {/* Arabic Option */}
                <button 
                  onClick={() => handleLanguageSelect('ar')}
                  className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-gold-500/50 rounded-2xl p-8 transition-all duration-300 hover:bg-zinc-900/80 hover:-translate-y-1 shadow-lg hover:shadow-gold-900/20"
                >
                  <div className="flex flex-col items-center gap-4">
                     <h3 className="text-2xl font-bold font-arabic text-white">العربية</h3>
                  </div>
                </button>
             </div>
          </div>
        )}

        {/* VIEW: UPLOAD */}
        {state === AppState.UPLOAD && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up w-full max-w-lg mx-auto">
            
            {/* 1. Golden Icon */}
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full"></div>
               <div className="w-24 h-24 rounded-full bg-black border border-zinc-800 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                  <GraduationCap className="text-gold-500 w-12 h-12" />
               </div>
            </div>

            {/* 2. Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {t.uploadTitle}
            </h1>

            {/* 3. Subtitle */}
            <p className="text-zinc-400 text-base md:text-lg mb-12 leading-relaxed px-4">
              {renderUploadSubtitle()}
            </p>

            {/* 4. Upload Box */}
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-600/20 to-yellow-600/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <label 
                htmlFor="file-upload" 
                className="relative block w-full aspect-[4/3] md:aspect-video rounded-[2rem] bg-zinc-900/20 border-2 border-dashed border-zinc-700 hover:border-gold-500/50 hover:bg-zinc-900/40 transition-all cursor-pointer flex flex-col items-center justify-center p-8"
              >
                <div className="mb-6 p-4 rounded-full bg-zinc-800/50 group-hover:bg-gold-500/10 transition-colors">
                  <Upload size={32} className="text-zinc-400 group-hover:text-gold-500 transition-colors" />
                </div>
                <span className="text-xl font-bold text-white mb-2">{t.clickToUpload}</span>
                <span className="text-sm text-zinc-500 tracking-wide">{t.fileType}</span>
                
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-900/10 border border-red-900/30 flex items-center gap-3 text-red-200 text-left w-full">
                <AlertCircle className="flex-shrink-0 w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Settings Section */}
            <div className="mt-10 w-full bg-zinc-900/30 rounded-xl p-6 border border-zinc-800/50">
              
              {/* Content Language Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                     <Globe size={12} /> {t.chooseContentLang}
                   </span>
                   <span className="text-zinc-600 text-[10px] uppercase tracking-wider">{t.contentLangDesc}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGenerationLanguage('en')}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${generationLanguage === 'en' ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setGenerationLanguage('ar')}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all font-arabic ${generationLanguage === 'ar' ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                     <Sparkles size={12} /> {t.summaryStyle}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSummaryTone('formal')}
                    className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${summaryTone === 'formal' ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    {t.formal}
                  </button>
                  <button 
                    onClick={() => setSummaryTone('friendly')}
                    className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${summaryTone === 'friendly' ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    {t.friendly}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW: PROCESSING */}
        {state === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center w-full min-h-[60vh] animate-fade-in">
            
            {/* Animated Central Hub */}
            <div className="relative mb-16">
               {/* Outer Orbital Ring - Slow Rotation */}
               <div className="absolute -inset-8 rounded-full border border-zinc-800/50 border-t-zinc-600 animate-[spin_8s_linear_infinite]"></div>
               
               {/* Middle Gold Ring - Reverse Faster Rotation */}
               <div className="absolute -inset-4 rounded-full border border-gold-900/30 border-b-gold-500 animate-[spin_3s_linear_infinite]" style={{ animationDirection: 'reverse' }}></div>

               {/* Center Icon Container */}
               <div className="w-24 h-24 rounded-full bg-black border border-zinc-800 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                  <div className="absolute inset-0 bg-gold-500/5 rounded-full animate-pulse"></div>
                  
                  {/* Dynamic Icon Switching */}
                  {progress < 40 ? (
                    <FileText size={32} className="text-zinc-400 animate-pulse" />
                  ) : progress < 80 ? (
                     <BrainCircuit size={32} className="text-gold-500 animate-pulse" />
                  ) : (
                     <Sparkles size={32} className="text-white animate-pulse" />
                  )}
               </div>
            </div>
            
            {/* Progress Bar Section */}
            <div className="w-full max-w-md mb-12 px-8">
               <div className="flex justify-between items-end mb-3">
                 <span className="text-gold-500 font-mono text-xs tracking-widest uppercase">{loadingMsg}</span>
                 <span className="text-white font-bold font-mono">{Math.round(progress)}%</span>
               </div>
               
               <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-700 via-yellow-500 to-gold-400 transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse translate-x-[-100%]"></div>
                  </div>
               </div>
            </div>

            {/* Developer Credit Banner */}
            <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-4 px-8 opacity-50 hover:opacity-80 transition-opacity">
               <div className="h-px bg-zinc-800 flex-1"></div>
               <span className="font-serif text-xs tracking-[0.3em] text-zinc-500 uppercase whitespace-nowrap">
                 Developer Youssef Jo
               </span>
               <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {state === AppState.DASHBOARD && (
          <div className="w-full">
            {activeTab === 'summary' && summary && (
              <SummaryView 
                data={summary} 
                uiLanguage={language} 
                contentLanguage={generationLanguage}
                translations={t} 
              />
            )}
            {activeTab === 'quiz' && quiz && (
              <QuizView 
                data={quiz} 
                onLoadMore={handleLoadMoreQuestions}
                isLoadingMore={isLoadingMore}
                uiLanguage={language}
                contentLanguage={generationLanguage}
                translations={t}
              />
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
