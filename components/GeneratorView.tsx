import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { PenTool, Download, Copy, Sparkles, Loader2, FileText, X, Globe } from 'lucide-react';
import { generateCustomContent } from '../services/geminiService';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface GeneratorViewProps {
  language: Language;
  translations: any;
  onClose: () => void;
}

const contentTypes = [
  { value: 'Research Paper', label: { en: 'Research Paper', ar: 'ورقة بحثية' } },
  { value: 'Article', label: { en: 'Article', ar: 'مقال' } },
  { value: 'Conversation', label: { en: 'Conversation', ar: 'محادثة' } },
  { value: 'Summary', label: { en: 'Summary', ar: 'ملخص' } },
  { value: 'Creative Writing', label: { en: 'Creative Writing', ar: 'كتابة إبداعية' } },
  { value: 'Business Email', label: { en: 'Business Email', ar: 'بريد إلكتروني رسمي' } },
  { value: 'Study Plan', label: { en: 'Study Plan', ar: 'خطة دراسية' } },
];

const GeneratorView: React.FC<GeneratorViewProps> = ({ language, translations, onClose }) => {
  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [topic, setTopic] = useState('');
  const [outputLang, setOutputLang] = useState<Language>(language); // Default to app language but allow toggle
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'ar';

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await generateCustomContent(topic, contentType, outputLang);
      setGeneratedContent(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleDownloadPdf = async () => {
    if (!generatedContent || !printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Wait a moment for fonts to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Higher resolution for crisp text
        useCORS: true,
        backgroundColor: '#09090b', // Force black background
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Initialize PDF (A4)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`AVB_${contentType.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header with Close Button */}
      <div className="container mx-auto px-6 pt-6 pb-2 flex justify-end">
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300 border border-zinc-800 hover:border-gold-500/50"
        >
          <span className="text-xs font-bold tracking-widest uppercase">Close</span>
          <X size={18} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="container max-w-6xl mx-auto px-6 pb-20 flex-1 overflow-y-auto animate-fade-in">
        <div className="mb-10 text-center">
          <h2 className="text-gold-500 font-serif text-sm md:text-base mb-2 tracking-[0.2em] uppercase font-medium">
            {translations.genSubtitle}
          </h2>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight font-serif">
            {translations.genTitle}
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-gold-500/30 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 to-zinc-900"></div>
              
              <div className="space-y-6">
                {/* Field 1: Type */}
                <div>
                  <label className="block text-gold-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} /> {translations.genTypeLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-zinc-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none appearance-none cursor-pointer transition-all"
                    >
                      {contentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {isRtl ? type.label.ar : type.label.en}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gold-500 ${isRtl ? 'left-4' : 'right-4'}`}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* Field 2: Topic */}
                <div>
                  <label className="block text-gold-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <PenTool size={14} /> {translations.genTopicLabel}
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={translations.genPlaceholder}
                    rows={6}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-zinc-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none resize-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Output Language Toggle */}
                <div>
                  <label className="block text-gold-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={14} /> Output Language
                  </label>
                  <div className="flex bg-black rounded-xl border border-zinc-700 p-1">
                    <button
                       onClick={() => setOutputLang('en')}
                       className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${outputLang === 'en' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      English
                    </button>
                    <button
                       onClick={() => setOutputLang('ar')}
                       className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all font-arabic ${outputLang === 'ar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      العربية
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !topic.trim()}
                  className="w-full py-4 bg-gradient-to-r from-gold-600 to-yellow-500 hover:from-gold-500 hover:to-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-gold-900/20 hover:shadow-gold-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isLoading ? translations.genProcessing : translations.genButton}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7">
            <div className="h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-2xl flex flex-col min-h-[600px]">
              <div className="bg-black w-full flex-1 rounded-t-xl p-6 md:p-8 overflow-y-auto relative">
                  
                  {!generatedContent && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 opacity-50 pointer-events-none">
                      <Sparkles size={64} className="mb-4 text-zinc-800" />
                      <p className="text-lg font-serif italic">{translations.genWaiting}</p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
                      <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gold-400 animate-pulse">{translations.genGenerating}</p>
                    </div>
                  )}

                  {generatedContent && (
                    <div className="prose prose-invert prose-gold max-w-none">
                      <div 
                        className={`whitespace-pre-wrap leading-relaxed text-zinc-300 font-serif text-lg ${outputLang === 'ar' ? 'font-arabic' : ''}`} 
                        dir={outputLang === 'ar' ? 'rtl' : 'ltr'}
                      >
                        {generatedContent}
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="bg-zinc-900 p-4 flex gap-4 border-t border-zinc-800 rounded-b-xl justify-end">
                  <button
                    onClick={handleCopy}
                    disabled={!generatedContent}
                    className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-gold-500 hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-30"
                  >
                    <Copy size={18} />
                    {translations.copy}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={!generatedContent || isGeneratingPdf}
                    className="px-5 py-2.5 rounded-lg bg-gold-600/10 border border-gold-500/50 text-gold-400 hover:bg-gold-600/20 hover:text-gold-300 transition-all flex items-center gap-2 disabled:opacity-30 shadow-lg shadow-gold-900/10"
                  >
                    {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isGeneratingPdf ? 'Generating PDF...' : translations.download}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Container for High Quality PDF Generation */}
      {/* Positioned off-screen but kept in DOM for html2canvas */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div 
          ref={printRef} 
          className="w-[794px] min-h-[1123px] bg-[#09090b] text-zinc-200 p-16 relative flex flex-col border-[12px] border-double border-gold-600"
          dir={outputLang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Decorative Corners */}
          <div className="absolute top-6 left-6 w-24 h-24 border-t-2 border-l-2 border-gold-500 rounded-tl-[2rem] opacity-80"></div>
          <div className="absolute top-6 right-6 w-24 h-24 border-t-2 border-r-2 border-gold-500 rounded-tr-[2rem] opacity-80"></div>
          <div className="absolute bottom-6 left-6 w-24 h-24 border-b-2 border-l-2 border-gold-500 rounded-bl-[2rem] opacity-80"></div>
          <div className="absolute bottom-6 right-6 w-24 h-24 border-b-2 border-r-2 border-gold-500 rounded-br-[2rem] opacity-80"></div>

          {/* PDF Header */}
          <div className="text-center border-b border-gold-500/30 pb-8 mb-12 relative">
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-2 bg-black border-l border-r border-gold-500/30"></div>
             <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-black font-serif font-bold text-2xl shadow-lg">A</div>
                <h1 className="text-5xl font-serif font-bold text-gold-500 tracking-wider drop-shadow-md">AVB</h1>
             </div>
            <p className="text-sm uppercase tracking-[0.5em] text-zinc-500 font-sans">Premium Educational Platform</p>
          </div>

          {/* PDF Content Type Badge */}
          <div className="flex justify-center mb-12">
            <span className="px-8 py-3 border-y border-gold-500/50 text-gold-400 uppercase tracking-widest text-base font-serif bg-gradient-to-r from-transparent via-gold-900/20 to-transparent">
              {contentType}
            </span>
          </div>

          {/* PDF Body */}
          <div className="flex-1">
             <div className="prose prose-invert max-w-none">
               <div className={`whitespace-pre-wrap font-serif text-lg leading-[2.2] text-zinc-300 text-justify ${outputLang === 'ar' ? 'font-arabic' : ''}`}>
                  {generatedContent}
               </div>
             </div>
          </div>

          {/* PDF Footer */}
          <div className="mt-20 pt-8 border-t border-zinc-800 flex justify-between items-center text-zinc-600 text-xs font-sans uppercase tracking-wider">
            <span>{new Date().toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-gold-500"></div>
               <span>Generated by AVB</span>
            </div>
            <span>Page 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorView;