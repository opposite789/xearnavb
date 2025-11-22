
import React, { useRef, useState } from 'react';
import { Language } from '../types';
import { Download, Share2, Award } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateViewProps {
  studentName: string;
  score: number;
  language: Language;
  translations: any;
  courseTitle?: string;
}

const CertificateView: React.FC<CertificateViewProps> = ({ studentName, score, language, translations, courseTitle = "AVB Education" }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const isRtl = language === 'ar';
  const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      // Slight delay to ensure fonts render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
        // Force font rendering
        onclone: (clonedDoc) => {
          const element = clonedDoc.querySelector('.certificate-container') as HTMLElement;
          if (element) {
             element.style.fontFamily = isRtl ? '"Cairo", sans-serif' : '"Inter", sans-serif';
          }
        }
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `AVB_Certificate_${studentName.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error("Certificate generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in w-full max-w-4xl mx-auto pb-20">
      
      {/* Controls */}
      <div className="flex gap-4 mb-8 no-print">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          {isDownloading ? <span className="animate-spin">⏳</span> : <Download size={20} />}
          {translations.downloadCert}
        </button>
      </div>

      {/* Certificate Container */}
      <div className="relative p-1 bg-gradient-to-br from-gold-600 via-yellow-300 to-gold-700 rounded-lg shadow-2xl w-full aspect-[1.414/1] max-w-[800px]">
        <div 
          ref={certificateRef}
          className={`certificate-container relative w-full h-full bg-black rounded-lg border-4 border-black p-8 flex flex-col items-center justify-between overflow-hidden text-center ${isRtl ? 'font-arabic' : 'font-sans'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Decorative Corners */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gold-500/50 rounded-tl-none"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-gold-500/50 rounded-tr-none"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-gold-500/50 rounded-bl-none"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gold-500/50 rounded-br-none"></div>

          {/* Header */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-80">
              <Award className="text-gold-500 w-8 h-8" />
              <span className={`text-gold-400 text-sm uppercase ${isRtl ? '' : 'tracking-[0.3em] font-sans'}`}>{translations.brandName}</span>
            </div>
            {/* Removed bg-clip-text for reliability in html2canvas */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-500 mb-2 shadow-black drop-shadow-lg">
              {translations.certTitle}
            </h1>
            <p className={`text-zinc-400 text-sm uppercase mt-2 ${isRtl ? '' : 'tracking-widest'}`}>{translations.certSubtitle}</p>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center items-center w-full my-4">
             <p className="text-zinc-300 italic font-serif text-lg mb-4">{translations.certPresent}</p>
             
             <div className="relative mb-6 w-3/4">
                <h2 className="text-3xl md:text-5xl font-bold text-white font-serif py-4 border-b border-zinc-800 w-full">
                  {studentName}
                </h2>
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
             </div>

             <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed">
               {translations.certBody}
             </p>

             <div className="mt-8 inline-block px-8 py-3 rounded-lg bg-zinc-900/50 border border-gold-500/30">
               <span className={`text-zinc-400 text-sm uppercase mr-2 ml-2 ${isRtl ? '' : 'tracking-wider'}`}>{translations.score}:</span>
               <span className="text-3xl font-bold text-gold-400">{score}%</span>
             </div>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-between items-end mt-8 px-8">
            <div className="text-center">
               <div className="h-px w-32 bg-zinc-700 mb-2"></div>
               <p className={`text-zinc-500 text-xs uppercase ${isRtl ? '' : 'tracking-wider'}`}>{date}</p>
            </div>

            <div className="mb-2">
               {/* Watermark Seal */}
               <div className="w-20 h-20 rounded-full border-2 border-gold-500/30 flex items-center justify-center opacity-50">
                 <div className="w-16 h-16 rounded-full border border-dashed border-gold-500/30"></div>
               </div>
            </div>

            <div className="text-center">
               <div className="font-serif text-gold-500 text-xl mb-1 font-italic signing-font">Youssef Jo</div>
               <div className="h-px w-32 bg-zinc-700 mb-2"></div>
               <p className={`text-zinc-500 text-xs uppercase ${isRtl ? '' : 'tracking-wider'}`}>{translations.developer}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateView;
