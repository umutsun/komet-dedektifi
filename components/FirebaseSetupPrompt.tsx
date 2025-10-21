/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WifiIcon } from './icons';

interface FirebaseSetupPromptProps {
  onContinueOffline: () => void;
}

const FirebaseSetupPrompt: React.FC<FirebaseSetupPromptProps> = ({ onContinueOffline }) => {
  const configSnippet = `
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 shadow-xl max-w-2xl w-full p-6 text-center flex flex-col items-center panel-corners">
        <div className="border border-red-500/50 p-3 mb-5">
          <WifiIcon className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">Firebase Yapılandırması Gerekli</h2>
        <p className="text-slate-300 mb-5">
          // İlerlemenizi kaydetmek ve tüm özellikleri kullanmak için uygulamanın bir Firebase projesine bağlanması gerekir.
        </p>
        <div className="text-left bg-slate-950 p-4 border border-slate-700 w-full mb-6">
            <p className="text-slate-400 mb-2 text-sm">// 1. Bir Firebase projesi oluşturun: <a href="https://firebase.google.com/docs/web/setup" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Talimatlar</a></p>
            <p className="text-slate-400 mb-4 text-sm">// 2. Proje kimlik bilgilerinizi aşağıdaki gibi <code className="bg-slate-800 px-1 py-0.5 text-blue-300">firebaseConfig.ts</code> dosyasına ekleyin:</p>
            <pre className="bg-slate-800 text-slate-300 text-xs p-3 overflow-x-auto custom-scrollbar"><code>{configSnippet}</code></pre>
        </div>
        <button
          onClick={onContinueOffline}
          className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-base"
        >
          ÇEVRİMDIŞI MODDA DEVAM ET
        </button>
         <p className="text-slate-500 mt-3 text-xs">
          // Not: Çevrimdışı modda ilerlemeniz kaydedilmeyecektir.
        </p>
      </div>
    </div>
  );
};

export default FirebaseSetupPrompt;
