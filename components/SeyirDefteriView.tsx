/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { CaptainLogEntry, PlayerAsset } from '../types';
import ImageZoomModal from './ImageZoomModal';

interface SeyirDefteriViewProps {
  logEntries: CaptainLogEntry[];
  playerAssets: PlayerAsset[];
  onSaveLogEntry: (content: string) => void;
}

type ActiveTab = 'LOG' | 'GALLERY';

const SeyirDefteriView: React.FC<SeyirDefteriViewProps> = ({ logEntries, playerAssets, onSaveLogEntry }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('LOG');
  const [newLogContent, setNewLogContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string, prompt: string } | null>(null);

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

  const TabButton: React.FC<{ tabId: ActiveTab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-bold tracking-wider transition-colors ${
        activeTab === tabId ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400' : 'text-slate-400 hover:bg-slate-700/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="h-full w-full flex flex-col bg-slate-900/50">
        <header className="flex-shrink-0 flex items-center border-b border-blue-500/20">
          <TabButton tabId="LOG">SEYİR DEFTERİ KAYITLARI</TabButton>
          <TabButton tabId="GALLERY">VARLIK GALERİSİ</TabButton>
        </header>

        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'LOG' && (
            <div>
              <div className="mb-4">
                <textarea
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  placeholder="// Yeni bir kayıt girin..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 text-slate-200 text-sm custom-scrollbar"
                  disabled={isSaving}
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving || !newLogContent.trim()}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors text-sm tracking-widest disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'KAYDEDİLİYOR...' : 'KAYDI GÖNDER'}
                </button>
              </div>
              <div className="space-y-4">
                {logEntries.length > 0 ? (
                  logEntries.map(entry => (
                    <div key={entry.id} className="p-3 bg-slate-800/50 border-l-2 border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">
                        {new Date(entry.timestamp).toLocaleString('tr-TR')} - <span className="font-semibold text-slate-300">{entry.author}</span>
                      </p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-4">// Henüz seyir defteri kaydı yok.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'GALLERY' && (
            <div>
              {playerAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {playerAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      className="group relative aspect-square bg-black border border-slate-700 cursor-pointer"
                      onClick={() => setZoomedImage({ url: asset.imageDataUrl, prompt: asset.prompt })}
                    >
                      <img src={asset.imageDataUrl} alt={asset.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-xs">
                        <p className="font-bold text-blue-300 uppercase">{asset.type} / by {asset.author}</p>
                        <p className="text-slate-300 truncate">{asset.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-center py-4">// Henüz galeriye kaydedilmiş varlık yok.</p>
              )}
            </div>
          )}
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
