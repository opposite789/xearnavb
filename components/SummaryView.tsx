
import React, { useState } from 'react';
import { SummaryData, Language } from '../types';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface SummaryViewProps {
  data: SummaryData;
  uiLanguage: Language;      // Determines layout for labels (headers, buttons)
  contentLanguage: Language; // Determines layout for summary content (text, points)
  translations: any;
}

const SummaryView: React.FC<SummaryViewProps> = ({ data, uiLanguage, contentLanguage, translations }) => {
  const [openSections, setOpenSections] = useState<number[]>([0, 1, 2, 3, 4, 5]); 
  const isUiRtl = uiLanguage === 'ar';
  const isContentRtl = contentLanguage === 'ar';

  const toggleSection = (index: number) => {
    setOpenSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20" dir={isUiRtl ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-end border-b border-gold-500/30 pb-4 mb-8">
        <div>
           <h2 className="text-gold-400 text-sm tracking-widest uppercase mb-1 font-medium">{translations.summaryHeader}</h2>
           {/* Title follows content language direction */}
           <h1 
             className={`text-3xl md:text-4xl font-bold text-white leading-tight ${isContentRtl ? 'font-arabic' : ''}`}
             dir={isContentRtl ? 'rtl' : 'ltr'}
           >
             {data.title}
           </h1>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 text-zinc-400 hover:text-gold-400 transition-colors no-print group"
        >
          <Printer size={18} />
          <span className="text-sm font-medium group-hover:underline decoration-gold-400/50 underline-offset-4">{translations.savePdf}</span>
        </button>
      </div>

      <div className="space-y-4">
        {data.sections.map((section, idx) => {
          const isOpen = openSections.includes(idx);
          return (
            <div 
              key={idx} 
              className={`border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? 'bg-zinc-900/50' : 'bg-zinc-900/20 hover:bg-zinc-900/40'}`}
              dir={isContentRtl ? 'rtl' : 'ltr'}
            >
              <button
                onClick={() => toggleSection(idx)}
                className={`w-full flex items-center justify-between p-5 text-left focus:outline-none ${isContentRtl ? 'text-right flex-row-reverse' : 'text-left'}`}
              >
                <h3 className={`text-xl font-bold text-zinc-200 flex items-center gap-3 ${isContentRtl ? 'font-arabic flex-row-reverse' : ''}`}>
                  <span className="text-gold-500 text-lg opacity-80 font-serif">{idx + 1}.</span>
                  {section.heading}
                </h3>
                {isOpen ? <ChevronUp className="text-gold-500" /> : <ChevronDown className="text-zinc-600" />}
              </button>
              
              {isOpen && (
                <div className={`px-5 pb-6 ${isContentRtl ? 'pr-12' : 'pl-12'}`}>
                  <ul className="space-y-3">
                    {section.points.map((point, pIdx) => (
                      <li 
                        key={pIdx} 
                        className={`text-zinc-400 leading-relaxed flex items-start gap-3 ${isContentRtl ? 'font-arabic' : ''}`}
                      >
                        <span className="block w-1.5 h-1.5 mt-2.5 rounded-full bg-gold-600/60 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryView;
