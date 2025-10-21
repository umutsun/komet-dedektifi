/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { GoogleIcon } from './icons';
import HalLoadingCube from './HalLoadingCube';
import { signInWithGoogle } from '../services/firebaseService';
import { firebaseConfig } from '../firebaseConfig';

const Auth: React.FC = () => {
  const [error, setError] = useState<{message: string, isDomainError: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // App.tsx'teki onAuthStateChanged şimdi gezinmeyi ve kullanıcı durumu güncellemesini ele alacaktır.
      // Bu bileşenin tek işi oturum açma işlemini başlatmaktır.
    } catch (err) {
      let errorMessage = 'Bilinmeyen bir oturum açma hatası oluştu.';
      let isDomainError = false;

      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        if (firebaseError.code === 'auth/unauthorized-domain') {
          if (!window.location.hostname) {
             errorMessage = 'Uygulama yerel bir dosyadan çalıştırılıyor gibi görünüyor. Firebase kimlik doğrulaması için uygulamanın bir web sunucusu (örneğin localhost) üzerinden sunulması gerekir. Lütfen uygulamanızı bir sunucu üzerinden çalıştırın ve ardından o alan adını (örneğin "localhost") Firebase yetkili alan adlarınıza ekleyin.';
          } else {
             errorMessage = 'Bu uygulamanın alan adı Firebase projenizde yetkilendirilmemiş.';
          }
          isDomainError = true;
        } else {
          errorMessage = firebaseError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError({
        message: errorMessage,
        isDomainError: isDomainError,
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-slate-950 font-mono flex flex-col items-center justify-center text-slate-300 p-4 relative overflow-hidden">
        <div className="starfield">
            <div className="stars stars-1"></div>
            <div className="stars stars-2"></div>
            <div className="stars stars-3"></div>
        </div>
        <HalLoadingCube />
      <div className="w-full max-w-sm bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-8 text-center relative z-10">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-blue-400">
          // BAĞLANTI_KURULUYOR
        </h1>
        <p className="text-slate-400 mb-6">Devam etmek için kimliğinizi doğrulayın.</p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 text-sm mb-4 text-left">
                <p className="font-bold mb-2">// KİMLİK_DOĞRULAMA_HATASI</p>
                {error.isDomainError ? (
                  <>
                    <p className="mb-2">{error.message}</p>
                    {window.location.hostname && (
                      <>
                        <p className="mb-2">Firebase projenize aşağıdaki alan adını eklemeniz gerekiyor:</p>
                        <div className="bg-slate-800 p-2 my-2 border border-slate-600 text-center select-all">
                            <code className="text-blue-300 font-bold">{window.location.hostname}</code>
                        </div>
                        <p className="mb-3">Aşağıdaki düğmeyi kullanarak Firebase'i açın, ardından "Authentication" &rarr; "Settings" &rarr; "Authorized domains" listesine gidin ve alan adını ekleyin.</p>
                        <a 
                            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-3 block w-full text-center px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white font-bold text-xs rounded-sm transition-colors"
                        >
                            FIREBASE AYARLARINI AÇ
                        </a>
                      </>
                    )}
                  </>
                ) : (
                    <p>{error.message}</p>
                )}
            </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-3 text-white font-bold transition-colors text-base tracking-widest disabled:bg-slate-700/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            'DOĞRULANIYOR...'
          ) : (
            <>
              <GoogleIcon className="w-6 h-6" />
              GOOGLE İLE OTURUM AÇ
            </>
          )}
        </button>
      </div>
    </main>
  );
};

export default Auth;