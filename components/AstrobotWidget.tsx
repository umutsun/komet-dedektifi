/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AstrobotIcon, AdamIcon, EveIcon } from './icons';
import { User } from '../types';

interface AstrobotWidgetProps {
  onDrop: (x: number, y: number) => void;
}

const AstrobotWidget: React.FC<AstrobotWidgetProps> = ({ onDrop }) => {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('astrobotWidgetPosition');
      if (saved) return JSON.parse(saved);
      // Varsayılan olarak sol alta ayarla
      const widgetHeight = 80;
      return { x: 16, y: window.innerHeight - widgetHeight - 16 };
    } catch (e) {
      const widgetHeight = 80;
      return { x: 16, y: window.innerHeight - widgetHeight - 16 };
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const interactionStartRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number; } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !interactionStartRef.current) return;
    
    const { startX, startY, startLeft, startTop } = interactionStartRef.current;
    
    const newX = startLeft + e.clientX - startX;
    const newY = startTop + e.clientY - startY;

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
        // Widget'ın son bırakma koordinatlarını (merkezini) ilet
        if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            onDrop(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    }
    setIsDragging(false);
    interactionStartRef.current = null;
  }, [isDragging, onDrop]);

  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    interactionStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
    };
  }, [position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    localStorage.setItem('astrobotWidgetPosition', JSON.stringify(position));
  }, [position]);


  return (
    <div 
      ref={nodeRef}
      className={`fixed z-40 animate-float cursor-move select-none transition-transform duration-200 ${isDragging ? 'scale-110' : 'scale-100'}`}
      style={{
        '--float-offset': '6px',
        left: position.x,
        top: position.y,
      } as React.CSSProperties}
      onMouseDown={handleDragMouseDown}
    >
      <div className="group relative flex flex-col items-center">
        <div className="relative p-2 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-full shadow-lg">
          <AstrobotIcon className="w-12 h-12 text-slate-500" />
        </div>
        <div className="absolute bottom-[-1.5rem] bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider text-blue-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          ASTROBOT
        </div>
      </div>
    </div>
  );
};

export default AstrobotWidget;