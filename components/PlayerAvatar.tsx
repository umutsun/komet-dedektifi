/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import { AdamIcon, EveIcon } from './icons';

interface PlayerAvatarProps {
  profile: User | null;
  onClick?: () => void;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ profile, onClick }) => {
  if (!profile) return null;

  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('playerAvatarPosition');
      if (saved) return JSON.parse(saved);

      // Varsayılan olarak sol alta ayarla
      const avatarHeight = 80; // Bileşenin tahmini yüksekliği
      return { x: 16, y: window.innerHeight - avatarHeight };
    } catch (e) {
      // Hata durumunda sol alta ayarla
      const avatarHeight = 80;
      return { x: 16, y: window.innerHeight - avatarHeight };
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const interactionStartRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number; } | null>(null);
  const hasMoved = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !interactionStartRef.current) return;
    
    const { startX, startY, startLeft, startTop } = interactionStartRef.current;

    // Sadece küçük bir hareketin ötesinde bir sürükleme olup olmadığını kontrol et
    if (!hasMoved.current) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 5) { // 5px'lik bir eşik
            hasMoved.current = true;
        }
    }
    
    const newX = startLeft + e.clientX - startX;
    const newY = startTop + e.clientY - startY;

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && !hasMoved.current) {
        onClick?.();
    }
    setIsDragging(false);
    interactionStartRef.current = null;
  }, [isDragging, onClick]);

  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    hasMoved.current = false;
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
    localStorage.setItem('playerAvatarPosition', JSON.stringify(position));
  }, [position]);


  return (
    <div 
      className="fixed z-40 animate-float cursor-move select-none" 
      style={{
        '--float-offset': '-6px',
        left: position.x,
        top: position.y,
      } as React.CSSProperties}
      onMouseDown={handleDragMouseDown}
    >
      <div className="group relative flex flex-col items-center">
        <div className="p-2 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-full shadow-lg">
          {profile.gender === 'male' ? (
            <AdamIcon className="w-12 h-12 text-slate-500" {...profile.avatar} />
          ) : (
            <EveIcon className="w-12 h-12 text-slate-500" {...profile.avatar} />
          )}
        </div>
        <div className="absolute bottom-[-1.5rem] bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider text-blue-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {profile.name}
        </div>
      </div>
    </div>
  );
};

export default PlayerAvatar;