/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const HalLoadingCube: React.FC = () => {
  return (
    <div 
      className="fixed bottom-8 right-8 z-20 pointer-events-none" 
      aria-label="HAL 9000 yükleniyor"
    >
      <div className="scene">
        <div className="cube animate-rotate-cube-fast">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-2 tracking-widest animate-pulse">[ HAL BAŞLATILIYOR ]</p>
    </div>
  );
};

export default HalLoadingCube;