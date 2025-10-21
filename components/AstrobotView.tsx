/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import CosmicLoading from './CosmicLoading';
import { StargazerIcon, DownloadIcon } from './icons';
import InteractiveHotspot from './InteractiveHotspot';
import HotspotDetailModal from './HotspotDetailModal';

interface AstrobotViewProps {
  imageUrl: string | null;
  isGenerating: boolean;
  appState: AppState;
  prompt: string;
  isAstrobotActive: boolean;
}

// Define a type for our hotspots for better type safety
type Hotspot = {
  id: number;
  x: number;
  y: number;
  label: string;
  details: string;
};

// Pre-defined hotspots to show on any generated image.
// In a real game, these could be dynamically generated.
const missionHotspots: Hotspot[] = [
  { id: 1, x: 25, y: 40, label: 'GÜÇ_KAVRAMASI', details: 'ANALİZ: Kavrama basıncı %98 nominal. Tork sensörleri kalibre edildi. Mikro çatlak tespit edilmedi.' },
  { id: 2, x: 55, y: 60, label: 'ANA_İŞLEMCİ', details: 'ANALİZ: Çekirdek sıcaklığı 45.2°C. Veri yolu %32 kullanımda. Kuantum ortak işlemci beklemede.' },
  { id: 3, x: 78, y: 30, label: 'OPTİK_SENSÖR', details: 'ANALİZ: Çok spektrumlu lens temiz. Odaklama mekanizması optimal. LIDAR dizisi hizalandı.' },
];

const AstrobotView: React.FC<AstrobotViewProps> = ({ imageUrl, isGenerating, appState, prompt: imagePrompt, isAstrobotActive }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    const filename = imagePrompt.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50) || 'astrobot_goruntusu';
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showLoader = isGenerating || isImageLoading;

  if (!isAstrobotActive) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center text-slate-500 p-4 bg-slate-900/50">
            <StargazerIcon className="w-16 h-16 mb-4 text-slate-600" />
            <h3 className="text-base font-bold tracking-widest text-slate-400 mb-2">[ ASTROBOT BEKLEMEDE ]</h3>
            <p className="text-xs">// Bağlantı protokolleri hazır durumda.</p>
            <p className="text-xs mt-1 text-slate-600">// Görev hedeflerine ulaşıldığında konuşlandırılacak.</p>
        </div>
    );
  }
  
  const HudFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div className="w-full h-full relative p-6 flex items-center justify-center">
        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400/50"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400/50"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400/50"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400/50"></div>
        {/* Grid and Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.blue.500/.1)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.blue.500/.1)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-transparent overflow-hidden pointer-events-none">
          <div className="w-full h-[200%] bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:100%_4px] animate-[scanline-anim_8s_linear_infinite]"></div>
        </div>
        {children}
      </div>
  );

  return (
    <>
      <div className="flex flex-col h-full text-gray-300 bg-slate-900/50">
        <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-black">
          <HudFrame>
            {showLoader && <CosmicLoading text="[ ASTROBOT GÖRÜNTÜSÜ OLUŞTURULUYOR ]" />}
            
            {imageUrl ? (
              <div className="w-full h-full relative group">
                <img
                  src={imageUrl}
                  alt="Astrobot tarafından üretilen görüntü"
                  className="w-full h-full object-contain transition-opacity duration-500"
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                  style={{ opacity: showLoader ? 0 : 1 }}
                />
                {!showLoader && missionHotspots.map(hotspot => (
                    <InteractiveHotspot 
                        key={hotspot.id}
                        x={hotspot.x}
                        y={hotspot.y}
                        label={hotspot.label}
                        onClick={() => setSelectedHotspot(hotspot)}
                    />
                ))}
              </div>
            ) : (
              !showLoader && (
                <div className="text-center text-slate-500 p-4">
                  <p className="text-base tracking-widest">[ ASTROBOT_HUD ]</p>
                  <p className="text-xs mt-2">// Bir onarım veya mühendislik görevi tanımlayın.</p>
                </div>
              )
            )}
          </HudFrame>
        </div>
        {imageUrl && (
            <div className="flex-shrink-0 p-2 border-t border-blue-500/20 bg-slate-900/50 text-xs text-slate-400">
                 <div className="flex items-center justify-between gap-2">
                    <p className="truncate flex-grow">
                      <span className="font-bold text-slate-300">// GÖREV: </span>
                      {imagePrompt}
                    </p>
                    <button onClick={handleDownload} className="p-1.5 bg-slate-800/50 hover:bg-blue-500/20 text-blue-300 rounded-full flex-shrink-0" aria-label="Görüntüyü İndir">
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
            </div>
        )}
      </div>
      {selectedHotspot && (
        <HotspotDetailModal
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
        />
      )}
    </>
  );
};

export default AstrobotView;
