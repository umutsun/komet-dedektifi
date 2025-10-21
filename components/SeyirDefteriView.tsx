/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { CaptainLogEntry, PlayerAsset } from '../types';
import ImageZoomModal from './ImageZoomModal';
import { SparklesIcon } from './icons';

interface SeyirDefteriViewProps {
  logEntries: CaptainLogEntry[];
  playerAssets: PlayerAsset[];
  onSaveLogEntry: (content: string) => void;
}

type TimelineItem = (CaptainLogEntry & { type: 'log' }) | (PlayerAsset & { type: 'asset' });

const SeyirDefteriView: React.FC<SeyirDefteriViewProps> = ({ logEntries, playerAssets, onSaveLogEntry }) => {
  const [newLogContent, setNewLogContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string, prompt: string } | null>(null);

  const timeline = useMemo((): TimelineItem[] => {
    const combined = [
      ...logEntries.map(entry => ({ ...entry, type: 'log' as const })),
      ...playerAssets.map(asset => ({ ...asset, type: 'asset' as const }))
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [logEntries, playerAssets]);

  const handleSave = async () => {
    if (!newLogContent.trim()) return;
    setIsSaving(true);
    try {
      await onSaveLogEntry(newLogContent);
      setNewLogContent('');
    } catch (e) {
      console.error("Seyir defteri girişi kaydedilirken hata oluştu:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="h-full w-full flex flex-col bg-slate-900/50">
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {/* Yeni Kayıt Formu */}
          <div className="mb-6 bg-slate-800/50 p-3 border border-slate-700/50">
            <h3 className="text-sm font-bold text-blue-300 tracking-wider mb-2">// YENİ SEYİR DEFTERİ KAYDI</h3>
            <textarea
              value={newLogContent}
              onChange={(e) => setNewLogContent(e.target.value)}
              placeholder="// Kaptanın notları..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:outline-none p-2 text-slate-200 text-sm custom-scrollbar"
              disabled={isSaving}
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !newLogContent.trim()}
              className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors text-xs tracking-widest disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isSaving ? 'KAYDEDİLİYOR...' : 'ZAMAN TÜNELİNE EKLE'}
            </button>
          </div>
          
          {/* Zaman Tüneli Akışı */}
          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.map(item => (
                <div key={`${item.type}-${item.id}`} className="p-3 bg-slate-800/50 border-l-2 border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">
                    {new Date(item.timestamp).toLocaleString('tr-TR')} - <span className="font-semibold text-slate-300">{item.author}</span>
                  </p>
                  {item.type === 'log' ? (
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.content}</p>
                  ) : (
                    <div className="mt-1">
                      <div 
                        className="group relative aspect-video bg-black border border-slate-700 cursor-pointer max-w-sm"
                        onClick={() => setZoomedImage({ url: item.imageDataUrl, prompt: item.prompt })}
                      >
                        <img src={item.imageDataUrl} alt={item.prompt} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-xs">
                          <p className="font-bold text-blue-300 uppercase">{item.type} GÖRÜNTÜSÜ</p>
                          <p className="text-slate-300 truncate">{item.prompt}</p>
                        </div>
                      </div>
                       <p className="text-xs text-slate-500 mt-2 italic ">// Görüntü istemi: "{item.prompt}"</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-4">// Seyir defteri zaman tüneli boş. HAL ile etkileşime geçin.</p>
            )}
          </div>
        </div>
      </div>
      {zoomedImage && (
        <ImageZoomModal
          imageUrl={zoomedImage.url}
          prompt={zoomedImage.prompt}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </>
  );
};

export default SeyirDefteriView;
