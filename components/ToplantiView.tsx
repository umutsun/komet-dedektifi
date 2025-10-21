/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { spaceNewsData, SpaceNewsItem } from '../data/spaceNews';
import { SparklesIcon } from './icons';

interface ToplantiViewProps {
  history: { role: 'user' | 'model', content: string }[];
  playerName: string;
  onCommandSelect: (command: string) => void;
  isInitializing: boolean;
}

const NewsCard: React.FC<{ item: SpaceNewsItem, onAnalyze: (headline: string) => void }> = ({ item, onAnalyze }) => {
    return (
        <div className="flex-shrink-0 w-64 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
                <p className="text-xs text-slate-400 mb-1">{item.source} / {new Date(item.timestamp).toLocaleDateString()}</p>
                <h4 className="font-bold text-sm text-slate-200 mb-2">{item.headline}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
            </div>
            <button 
                onClick={() => onAnalyze(item.headline)}
                className="mt-3 w-full text-xs flex items-center justify-center gap-1.5 px-2 py-1.5 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition-colors rounded"
            >
                <SparklesIcon className="w-3.5 h-3.5" />
                ANALİZ İSTE
            </button>
        </div>
    );
};


const ToplantiView: React.FC<ToplantiViewProps> = ({ history, playerName, onCommandSelect, isInitializing }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [history]);
  
  const handleAnalyzeRequest = (headline: string) => {
    onCommandSelect(`Bu haber hakkında bana bir analiz sun: '${headline}'`);
  };
  
  const renderHistory = () => {
    if (isInitializing) {
        return <p className="text-slate-500 italic animate-pulse">// Görev kayıtları yükleniyor...</p>;
    }
    if (history.length === 0) {
        return <p className="text-slate-500 italic">// Kayıt bulunamadı. Yeni bir iletişim başlatın.</p>;
    }
    return history.map((entry, index) => (
      <div key={index}>
        {entry.role === 'user' ? (
          <p className="text-blue-300">
            <span className="font-bold select-none">// {playerName}: </span>{entry.content}
          </p>
        ) : (
          <p className="text-slate-300 whitespace-pre-wrap">{entry.content}</p>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900/50">
        {/* Harici Haber Bültenleri Bölümü */}
        <div className="flex-shrink-0 p-4 border-b border-blue-500/20">
            <h3 className="text-base font-bold text-blue-400 tracking-widest mb-3">// GÜNCEL BÜLTENLER</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {spaceNewsData.map(item => (
                    <NewsCard key={item.id} item={item} onAnalyze={handleAnalyzeRequest} />
                ))}
            </div>
        </div>
      
        {/* Görev Kayıtları Bölümü */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar text-sm">
            <h3 className="text-base font-bold text-blue-400 tracking-widest mb-4">// GÖREV KAYITLARI</h3>
            <div className="space-y-4">
                {renderHistory()}
                <div ref={logEndRef} />
            </div>
        </div>
    </div>
  );
};

export default ToplantiView;