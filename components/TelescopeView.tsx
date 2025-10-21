/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons';
import CosmicLoading from './CosmicLoading';
import { InterpretedData, TelescopeHotspot } from '../types';
import InteractiveHotspot from './InteractiveHotspot';

interface TelescopeViewProps {
  imageUrl: string | null;
  isGenerating: boolean;
  isInitializing: boolean;
  prompt: string;
  interpretedData: InterpretedData | null;
  isInterpretingData: boolean;
  hotspots?: TelescopeHotspot[];
  onHotspotClick?: (prompt: string) => void;
}

const HudDisplay: React.FC<{ title: string; data: { label: string; value: string }[]; alignment?: 'left' | 'right' }> = ({ title, data, alignment = 'left' }) => {
    const isRight = alignment === 'right';
    return (
        <div className={`absolute top-3 ${isRight ? 'right-3 text-right' : 'left-3 text-left'} p-2 bg-slate-900/40 backdrop-blur-sm border-blue-400/60 ${isRight ? 'border-r-2' : 'border-l-2'}`}>
            <h4 className="tracking-widest text-blue-400/80 mb-1 text-[10px]">{`// ${title}`}</h4>
            <div className="space-y-0.5">
                {data.map(item => (
                    <div key={item.label}>
                        <span className="text-blue-500/80">{item.label}: </span>
                        <span className="text-slate-200 font-bold tracking-wider">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NoSignalView = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
        <pre className="text-yellow-300/50 text-xs leading-tight animate-pulse mb-4" aria-hidden="true">
{`
       //
      ( )
   ,..;'-'--.
  ///(     )
  ' \\/     )
     '-----'
`}
        </pre>
        <p className="text-base tracking-widest text-slate-400">[ GÖRÜNTÜ BEKLENİYOR ]</p>
        <p className="text-xs mt-2 text-slate-500">// HAL'e bir görüntü oluşturma komutu verin.</p>
    </div>
);


const TelescopeView: React.FC<TelescopeViewProps> = ({ imageUrl, isGenerating, isInitializing, prompt: imagePrompt, interpretedData, isInterpretingData, hotspots, onHotspotClick }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

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

  const handleImageError = () => {
    setIsImageLoading(false);
    console.error("Teleskop görüntüsü yüklenemedi:", imageUrl);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    const filename = imagePrompt.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50) || 'teleskop_goruntusu';
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showLoader = isInitializing || (isGenerating && !imageUrl) || (imageUrl && isImageLoading);

  let loadingText = '';
  if (isInitializing) {
    loadingText = '[ GÖREV VERİLERİ YÜKLENİYOR... ]';
  } else if (isGenerating) {
    loadingText = '[ TELESKOP GÖRÜNTÜSÜ OLUŞTURULUYOR... ]';
  } else if (imageUrl && isImageLoading) {
    loadingText = '[ GÖRÜNTÜ İŞLENİYOR... ]';
  }


  return (
      <div className="flex flex-col h-full text-slate-300">
        <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-black">
          {showLoader && <CosmicLoading text={loadingText} variant="telescope" />}
          
          {imageUrl ? (
            <div 
              className="w-full h-full relative group"
            >
              <img
                src={imageUrl}
                alt={imagePrompt || "Teleskop görüntüsü"}
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: showLoader ? 0 : 1 }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {interpretedData && !isInterpretingData && (
                <div className="absolute inset-0 pointer-events-none text-xs">
                    <HudDisplay
                        title="HEDEF VERİLERİ"
                        data={[{ label: 'İSİM', value: interpretedData.objectName }]}
                        alignment="left"
                    />
                    <HudDisplay
                        title="TELEMETRİ"
                        data={[
                            { label: 'MESAFE', value: interpretedData.distance },
                            { label: 'HIZ', value: interpretedData.velocity },
                        ]}
                        alignment="right"
                    />
                </div>
              )}

              {/* Görüntü üzerine yerleştirilmiş etkileşimli noktalar */}
              {!showLoader && hotspots && onHotspotClick && hotspots.map(hotspot => (
                <InteractiveHotspot
                  key={hotspot.id}
                  hotspotId={hotspot.id}
                  x={hotspot.x}
                  y={hotspot.y}
                  label={hotspot.label}
                  onClick={() => onHotspotClick(hotspot.prompt)}
                  variant="telescope"
                />
              ))}

            </div>
          ) : (
            !isGenerating && !isInitializing && <NoSignalView />
          )}
        </div>
        
        <div className="flex-shrink-0 border-t border-blue-500/20 bg-slate-900/50 text-xs text-slate-400">
            {imageUrl ? (
                <>
                    {(isInterpretingData || interpretedData) && (
                        <div className="p-2 border-b border-blue-500/10">
                            {isInterpretingData ? (
                               <p className="animate-pulse">// HAL: NASA verileri yorumlanıyor...</p>
                            ) : interpretedData ? (
                               <p>{interpretedData.summary}</p>
                            ) : null}
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2 p-2">
                        <p className="truncate flex-grow">
                          <span className="font-bold text-slate-300">// İSTEM: </span>
                          {imagePrompt}
                        </p>
                        <button onClick={handleDownload} className="p-1.5 bg-slate-800/50 hover:bg-blue-500/20 text-blue-300 rounded-full flex-shrink-0" aria-label="Görüntüyü İndir">
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : (
                <div className="p-2">
                  {isInterpretingData ? (
                     <p className="animate-pulse">// HAL: NASA verileri yorumlanıyor...</p>
                  ) : (
                     <p>// Beklemede</p>
                  )}
                </div>
            )}
        </div>
      </div>
  );
};

export default TelescopeView;