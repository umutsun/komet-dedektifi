/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SparklesIcon } from './icons';

interface MissionCompleteViewProps {
  videoUrl: string;
  onNewInvestigation: () => void;
}

const MissionCompleteView: React.FC<MissionCompleteViewProps> = ({ videoUrl, onNewInvestigation }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-3xl bg-slate-900 border border-blue-500/30 p-2">
        <div className="w-full bg-black border border-blue-500/50 p-0.5">
          <video src={videoUrl} controls autoPlay loop className="w-full aspect-video"></video>
        </div>
        <div className="w-full text-center p-2">
          <h3 className="text-lg font-bold text-blue-400 tracking-widest mb-3">// GÖREV_TAMAMLANDI</h3>
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors mx-auto text-sm">
            <SparklesIcon className="w-4 h-4" />
            YENİ_GÖREV_BAŞLAT
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionCompleteView;