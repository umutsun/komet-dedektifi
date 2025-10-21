/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useRef, useEffect} from 'react';
import { MicrophoneIcon } from './icons';

interface PromptFormProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  playerName: string;
}

const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isProcessing,
  isListening,
  onToggleListening,
  playerName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // We need to reset the height to 'auto' before we can get the new scrollHeight
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onPromptChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    onGenerate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to submit
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex items-center gap-1.5 p-2.5">
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? "HAL İŞLİYOR..." : ""}
          className={`relative flex-grow bg-transparent focus:outline-none resize-none py-1.5 pr-1.5 pl-12 text-sm w-full custom-scrollbar block max-h-40 text-right ${isProcessing ? 'animate-pulse placeholder-blue-400/50' : ''}`}
          disabled={isProcessing}
          rows={1}
        />
        <button
          type="button"
          onClick={onToggleListening}
          className={`absolute z-20 top-1/2 -translate-y-1/2 left-1.5 flex-shrink-0 p-2 rounded-full transition-all duration-300 disabled:text-slate-600 disabled:cursor-not-allowed ${isListening ? 'text-red-400 bg-red-500/20 animate-mic-pulse animate-mic-glow' : 'text-slate-400 hover:text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-400/60'}`}
          disabled={isProcessing}
          aria-label={isListening ? 'Dinlemeyi durdur' : 'Sesli komutu başlat'}
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
      </div>
      
      <button
        type="submit"
        className="flex-shrink-0 px-4 py-1.5 text-blue-400 font-bold transition-colors disabled:text-slate-600 disabled:cursor-not-allowed text-lg"
        disabled={isProcessing || !prompt.trim()}
        aria-label="Komutu Gönder"
      >
        <span className={!isProcessing ? 'animate-blink' : 'opacity-20'}>&gt;</span>
      </button>
    </form>
  );
};

export default PromptForm;