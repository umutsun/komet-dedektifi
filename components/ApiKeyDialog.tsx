/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        onContinue();
      } catch (error) {
        console.error('API anahtar seçim diyaloğu açılamadı:', error);
      }
    } else {
      console.warn('`window.aistudio` mevcut değil.');
      onContinue();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 shadow-xl max-w-md w-full p-6 text-center flex flex-col items-center panel-corners">
        <div className="border border-slate-600 p-3 mb-5">
          <KeyIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">Kimlik Doğrulama Gerekli</h2>
        <p className="text-slate-300 mb-5">
          // Bu uygulama, faturalandırması etkinleştirilmiş bir Google Cloud projesi gerektirir.
          Devam etmek için lütfen geçerli bir API anahtarı seçin.
        </p>
        <p className="text-slate-400 mb-6 text-xs">
          // Ayrıntılar için{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:underline font-medium"
          >
            fatura_kurulumu
          </a> belgelerine bakın.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-base"
        >
          API ANAHTARI SEÇ
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;