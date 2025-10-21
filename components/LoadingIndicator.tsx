/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AppState } from '../types';

interface LoadingIndicatorProps {
  appState: AppState;
}

const stateConfig = {
    [AppState.LOADING]: {
        title: "[ KOMUT_İŞLENİYOR ]",
        message: "HAL'DEN_YANIT_BEKLENİYOR..."
    },
    [AppState.GENERATING_IMAGE]: {
        title: "[ GÖRÜNTÜ_YAKALANIYOR ]",
        message: "TELESKOP_VERİLERİ_YÖNLENDİRİLİYOR..."
    },
    [AppState.GENERATING_VIDEO]: {
        title: "[ VİDEO_GÜNLÜĞÜ_DERLENİYOR ]",
        message: "GÖREV_SİNEMATİĞİ_OLUŞTURULUYOR..."
    },
    default: {
        title: "[ İŞLENİYOR ]",
        message: "LÜTFEN_BEKLEYİN..."
    }
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ appState }) => {
  const config = stateConfig[appState] || stateConfig.default;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.blue.500)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.blue.500)_1px,transparent_1px)] bg-[size:0.75rem_0.75rem] opacity-20"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.blue.400)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.blue.400)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 animate-scan"></div>
            <div className="absolute inset-0 border-2 border-blue-500/50"></div>
        </div>
      <h2 className="text-xl font-semibold tracking-widest text-blue-400 mb-2 animate-pulse">{config.title}</h2>
      <p className="text-blue-600 tracking-wider text-sm">{config.message}</p>
    </div>
  );
};

export default LoadingIndicator;