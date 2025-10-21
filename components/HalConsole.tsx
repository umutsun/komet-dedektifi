/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { WindowMinimizeIcon } from './icons';
import HalResponseRenderer from './HalResponseRenderer';
import { HeaderSignal } from './graphics';
import PromptForm from './PromptForm';

// Fix: Add type definition for Web Speech API's SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface ConfirmationPromptProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPrompt: React.FC<ConfirmationPromptProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="bg-slate-800/50 p-2 text-center border-t border-b border-slate-700 animate-glow-bg">
      <p className="text-sm text-yellow-300 mb-2 tracking-wider animate-pulse">// ONAY BEKLENİYOR</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onConfirm}
          className="px-4 py-1 bg-green-600/80 hover:bg-green-500/80 text-white font-bold text-xs rounded-sm"
        >
          EVET
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1 bg-red-600/80 hover:bg-red-500/80 text-white font-bold text-xs rounded-sm"
        >
          HAYIR
        </button>
      </div>
    </div>
  );
};

interface HalConsoleProps {
  message: string;
  isError: boolean;
  onGenerate: (prompt: string) => void;
  isProcessing: boolean;
  onMaximize: () => void;
  headerStatusText?: string;
  playerName: string;
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  isAwaitingConfirmation: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const MIN_WIDTH = 320; // Tailwind `w-80`
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 240;

const HalConsole: React.FC<HalConsoleProps> = ({ message, isError, onGenerate, isProcessing, onMaximize, headerStatusText, playerName, prompt, onPromptChange, isAwaitingConfirmation, onConfirm, onCancel }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Window State
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('halWindowSize');
    try {
      return saved ? JSON.parse(saved) : { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    } catch (e) {
      return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    }
  });
  
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('halWindowPosition');
    try {
      if (saved) return JSON.parse(saved);
      // Default to right-center of the screen
      const defaultX = window.innerWidth - DEFAULT_WIDTH - 16; // 16px padding
      const defaultY = (window.innerHeight - DEFAULT_HEIGHT) / 2;
      return { x: defaultX, y: defaultY };
    } catch (e) {
       const defaultX = window.innerWidth - DEFAULT_WIDTH - 16;
       const defaultY = (window.innerHeight - DEFAULT_HEIGHT) / 2;
       return { x: defaultX, y: defaultY };
    }
  });

  const [minimizedPosition, setMinimizedPosition] = useState(() => {
    const saved = localStorage.getItem('halMinimizedPosition');
    try {
      return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    } catch (e) {
      return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    }
  });
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const interactionStartRef = useRef<{
      startX: number;
      startY: number;
      startWidth?: number;
      startHeight?: number;
      startLeft?: number;
      startTop?: number;
      direction?: string;
  } | null>(null);

  const nodeRef = useRef<HTMLDivElement>(null);

  // This effect ensures the window and cube stay within the viewport
  useEffect(() => {
    const clampPosition = (pos: {x: number, y: number}, width: number, height: number) => {
      // Add a 1rem (16px) padding from the edges
      const clampedX = Math.max(16, Math.min(pos.x, window.innerWidth - width - 16));
      const clampedY = Math.max(16, Math.min(pos.y, window.innerHeight - height - 16));
      
      if (isNaN(clampedX) || isNaN(clampedY)) {
        return pos; // Avoid setting NaN if width/height are not ready
      }
      return { x: clampedX, y: clampedY };
    };

    const handleResize = () => {
        setPosition(currentPos => clampPosition(currentPos, size.width, size.height));
        setMinimizedPosition(currentPos => clampPosition(currentPos, 80, 72)); // Approx cube + label size
    };
    
    // Initial clamp on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size.width, size.height]);


  // --- Speech Recognition Logic ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API bu tarayıcıda desteklenmiyor.');
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const results = event.results;
      if (results && results.length > 0 && results[0].length > 0) {
        const transcript = results[0][0].transcript;
        // Ensure transcript is a string to prevent setting prompt to undefined.
        onPromptChange(transcript || ''); 
      } else {
        console.warn('Speech recognition returned no results.');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Konuşma tanıma hatası:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [onPromptChange]);

  const handleToggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Konuşma tanıma işlemi başlatılamadı:", e);
        setIsListening(false);
      }
    }
  }, [isListening]);
  
  const handleGenerateClick = useCallback(() => {
    if (isProcessing || !prompt.trim() || isAwaitingConfirmation) return;
    onGenerate(prompt);
  }, [prompt, isProcessing, onGenerate, isAwaitingConfirmation]);
  
  // Flash effect on new message when minimized
  useEffect(() => {
    if (isMinimized && message) {
        setHasNewMessage(true);
        const timer = setTimeout(() => setHasNewMessage(false), 2000);
        return () => clearTimeout(timer);
    }
  }, [message, isMinimized]);

  // --- Dragging & Resizing Logic ---
  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    interactionStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: position.x,
        startTop: position.y,
    };
  }, [position]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    interactionStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: size.width,
        startHeight: size.height,
        startLeft: position.x,
        startTop: position.y,
        direction: direction,
    };
  }, [position, size]);
  
  const handleMinimizedMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true); // Re-use dragging state for the cube
    interactionStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: minimizedPosition.x,
      startTop: minimizedPosition.y,
    };
  }, [minimizedPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactionStartRef.current) return;

    const { startX, startY, startLeft, startTop, startWidth, startHeight, direction } = interactionStartRef.current;
    
    if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = startWidth!;
        let newHeight = startHeight!;
        let newX = startLeft!;
        let newY = startTop!;

        if (direction?.includes('e')) newWidth = Math.max(MIN_WIDTH, startWidth! + dx);
        if (direction?.includes('s')) newHeight = Math.max(MIN_HEIGHT, startHeight! + dy);
        
        if (direction?.includes('w')) {
            const potentialWidth = startWidth! - dx;
            if (potentialWidth >= MIN_WIDTH) {
                newWidth = potentialWidth;
                newX = startLeft! + dx;
            }
        }
        if (direction?.includes('n')) {
            const potentialHeight = startHeight! - dy;
            if (potentialHeight >= MIN_HEIGHT) {
                newHeight = potentialHeight;
                newY = startTop! + dy;
            }
        }
        
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });

    } else if (isDragging) {
      const newX = startLeft! + e.clientX - startX;
      const newY = startTop! + e.clientY - startY;

      if (isMinimized) {
        setMinimizedPosition({ x: newX, y: newY });
      } else {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isDragging, isResizing, isMinimized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    interactionStartRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // --- Persistence Logic ---
  useEffect(() => {
      localStorage.setItem('halWindowPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
      localStorage.setItem('halWindowSize', JSON.stringify(size));
  }, [size]);

  useEffect(() => {
      localStorage.setItem('halMinimizedPosition', JSON.stringify(minimizedPosition));
  }, [minimizedPosition]);

  const handleMaximize = () => {
      const windowWidth = size.width;
      const windowHeight = size.height;
      const cubeSize = 40;

      // Calculate top-left for the window to be centered on the cube
      let newX = minimizedPosition.x - (windowWidth / 2) + (cubeSize / 2);
      let newY = minimizedPosition.y - (windowHeight / 2) + (cubeSize / 2);
      
      // Clamp to be within viewport bounds, with some padding (1rem = 16px)
      newX = Math.max(16, Math.min(newX, window.innerWidth - windowWidth - 16));
      newY = Math.max(16, Math.min(newY, window.innerHeight - windowHeight - 16));

      setPosition({ x: newX, y: newY });
      
      onMaximize();
      setIsMinimized(false);
  };
  
  if (isMinimized) {
    return (
        <div 
          className="fixed z-30 cursor-pointer w-20"
          style={{ left: minimizedPosition.x, top: minimizedPosition.y }}
          onMouseDown={handleMinimizedMouseDown}
          onClick={handleMaximize}
          aria-label="HAL konsolunu büyüt"
        >
            <div className="flex flex-col items-center">
                <div className={`scene ${hasNewMessage ? 'animate-blue-glow' : ''}`}>
                  <div className="cube animate-rotate-cube">
                    <div className="face front"></div>
                    <div className="face back"></div>
                    <div className="face right"></div>
                    <div className="face left"></div>
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2 tracking-wider">[ HAL KONSOLU ]</p>
            </div>
        </div>
    );
  }
  
  const resizeHandles: {direction: string, className: string}[] = [
      { direction: 'nw', className: 'cursor-nwse-resize top-0 left-0' },
      { direction: 'ne', className: 'cursor-nesw-resize top-0 right-0' },
      { direction: 'sw', className: 'cursor-nesw-resize bottom-0 left-0' },
      { direction: 'se', className: 'cursor-nwse-resize bottom-0 right-0' },
  ];

  return (
      <div 
        ref={nodeRef}
        className="fixed z-30 bg-slate-900/70 backdrop-blur-md border border-slate-700 shadow-2xl flex flex-col"
        style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
      >
          <header 
            className="flex-shrink-0 flex justify-between items-center p-1.5 border-b border-slate-700 cursor-move"
            onMouseDown={handleDragMouseDown}
          >
              <h2 className="font-bold text-xs tracking-wider text-slate-400 truncate select-none">
                  {headerStatusText ? `// ${headerStatusText}` : '// BAĞLANTI_KURULDU'}
              </h2>
              <div className="flex items-center gap-1.5">
                  <div className="w-24 h-5">
                     <HeaderSignal isProcessing={isProcessing} />
                  </div>
                  <button onClick={() => setIsMinimized(true)} className="p-1 text-slate-400 hover:text-white" aria-label="Küçült">
                      <WindowMinimizeIcon className="w-4 h-4" />
                  </button>
              </div>
          </header>
          
          <div className="flex-grow min-h-0 p-2.5 overflow-y-auto custom-scrollbar">
              <HalResponseRenderer message={message} isError={isError} />
          </div>

          {isAwaitingConfirmation && (
            <ConfirmationPrompt onConfirm={onConfirm} onCancel={onCancel} />
          )}

          <div className="flex-shrink-0 border-t border-slate-700">
              <PromptForm
                prompt={prompt}
                onPromptChange={onPromptChange}
                onGenerate={handleGenerateClick}
                isProcessing={isProcessing || isAwaitingConfirmation}
                isListening={isListening}
                onToggleListening={handleToggleListening}
                playerName={playerName}
              />
          </div>
          
          {resizeHandles.map(handle => (
              <div
                key={handle.direction}
                onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                className={`absolute w-3 h-3 ${handle.className}`}
              />
          ))}
      </div>
  );
};

export default HalConsole;
