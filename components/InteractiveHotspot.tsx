/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface InteractiveHotspotProps {
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  onClick: () => void;
  variant?: 'astrobot' | 'telescope';
  hotspotId?: number; // Sürükle-bırak tanımlaması için eklendi
}

const InteractiveHotspot: React.FC<InteractiveHotspotProps> = ({ x, y, label, onClick, variant = 'astrobot', hotspotId }) => {
  const isTelescope = variant === 'telescope';

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${y}%`, left: `${x}%` }}
      data-hotspot-id={hotspotId}
    >
      <button 
        onClick={onClick} 
        className="relative flex items-center justify-center w-8 h-8 group" // Tıklama alanını genişlettik
        aria-label={`Detayları görüntüle: ${label}`}
      >
        {isTelescope ? (
          <>
            {/* Yanıp sönen mavi dış halka */}
            <div className="absolute w-4 h-4 bg-blue-500/50 rounded-full animate-blue-dot-blink"></div>
            {/* Sabit iç mavi nokta */}
            <div className="absolute w-2 h-2 bg-blue-200 rounded-full"></div>
          </>
        ) : (
          <>
            {/* Orijinal astrobot darbe efekti */}
            <div className="absolute w-4 h-4 bg-cyan-400 rounded-full animate-[hotspot-pulse_2s_infinite] opacity-75"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full"></div>
          </>
        )}
      </button>
      <div 
        className={`absolute top-full left-1/2 mt-2 transform -translate-x-1/2 px-2 py-0.5 bg-slate-900/80 text-[10px] tracking-widest whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isTelescope ? 'text-blue-300' : 'text-cyan-300'}`}
      >
        {label}
      </div>
    </div>
  );
};

export default InteractiveHotspot;