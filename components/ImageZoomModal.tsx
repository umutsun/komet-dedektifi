/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { XMarkIcon, DownloadIcon } from './icons';

interface ImageZoomModalProps {
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, prompt, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    // Sanitize prompt to create a valid filename
    const filename = prompt.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50) || 'gorsel';
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 shadow-xl max-w-4xl w-full p-2 text-center flex flex-col items-center relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
          <button 
              onClick={handleDownload}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="İndir"
          >
              <DownloadIcon className="w-4 h-4" />
          </button>
          <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
          >
              <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-slate-300 tracking-widest mb-2 w-full text-left text-sm px-1">
            [ GELİŞMİŞ_GÖRÜNTÜ_DETAYI ]
        </h3>

        <div className="w-full h-[70vh] flex items-center justify-center bg-black/50 mb-2">
            <img src={imageUrl} alt={`Şunun için geliştirilmiş detay: ${prompt}`} className="max-w-full max-h-full object-contain" />
        </div>
        
        <p className="text-slate-400 text-xs w-full text-left bg-slate-800/50 p-2 border-t border-slate-700">
          <span className="font-bold text-slate-300">// İSTEM: </span>{prompt}
        </p>
      </div>
    </div>
  );
};

export default ImageZoomModal;
