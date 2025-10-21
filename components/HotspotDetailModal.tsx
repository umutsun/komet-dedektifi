/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { XMarkIcon } from './icons';

type Hotspot = {
  id: number;
  x: number;
  y: number;
  label: string;
  details: string;
};

interface HotspotDetailModalProps {
  hotspot: Hotspot;
  onClose: () => void;
}

const HotspotDetailModal: React.FC<HotspotDetailModalProps> = ({ hotspot, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-cyan-500/30 shadow-2xl max-w-md w-full text-left flex flex-col panel-corners"
        style={{ borderColor: 'rgba(34, 211, 238, 0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-3 border-b border-cyan-500/30">
          <h3 className="font-bold text-cyan-300 tracking-widest text-sm">
            // BİLEŞEN_ANALİZİ: {hotspot.label}
          </h3>
          <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Kapat"
          >
              <XMarkIcon className="w-4 h-4" />
          </button>
        </header>

        <div className="p-4 text-slate-300 text-sm leading-relaxed">
          <p>{hotspot.details}</p>
        </div>

        <footer className="p-3 border-t border-cyan-500/30 text-right">
            <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800/50 hover:bg-cyan-500/20 text-cyan-300 text-xs tracking-wider transition-colors"
            >
                KAPAT
            </button>
        </footer>
      </div>
    </div>
  );
};

export default HotspotDetailModal;
