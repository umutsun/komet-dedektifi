/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';

interface CosmicLoadingProps {
    text: string;
    variant?: 'telescope' | 'grid';
}

const telescopeArt = `
          .
         ":"
       ___:____     |
      ,'        \\\`.
      |  ( o )  |
      \`._/------\\\\_,'
         |      |
         |      |
        /|    , |
       | |   .  |
       | |  .   |
       | | .    |
       | |.     |
       \`|'      |
        '       '
`;

const nonAlphanumericChars = ['*', '#', '+', '=', '-', '|', '/', '\\', '%', '$', '@', '!', '?', '.', ',', ';', ':', '^', '~', '[', ']', '{', '}'];
const GRID_WIDTH = 20;
const GRID_HEIGHT = 8;
const TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT;

const GridLoader: React.FC = () => {
    const [grid, setGrid] = useState<string[]>([]);

    const randomDelays = useMemo(() => 
        Array.from({ length: TOTAL_CELLS }, () => `${Math.random() * 1.5}s`), 
    []);

    useEffect(() => {
        const generateGrid = () => {
            const newGrid = Array.from({ length: TOTAL_CELLS }, () => 
                nonAlphanumericChars[Math.floor(Math.random() * nonAlphanumericChars.length)]
            );
            setGrid(newGrid);
        };

        generateGrid();
        const intervalId = setInterval(generateGrid, 200);

        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <div 
            className="mb-4 font-mono text-xs leading-tight text-blue-400/70" 
            style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`}}
            aria-hidden="true"
        >
            {grid.map((char, index) => (
                <span 
                    key={index} 
                    className="animate-code-pulse" 
                    style={{ '--duration': '1.5s', '--delay': randomDelays[index] } as React.CSSProperties}
                >
                    {char}
                </span>
            ))}
        </div>
    );
};


const CosmicLoading: React.FC<CosmicLoadingProps> = ({ text, variant = 'grid' }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400" aria-live="polite" aria-busy="true">
            {variant === 'telescope' ? (
                <pre className="text-blue-400/70 text-xs leading-tight animate-pulse mb-4">
                    {telescopeArt}
                </pre>
            ) : (
                <GridLoader />
            )}
            <h2 className="text-sm font-semibold tracking-widest text-blue-400 animate-pulse">{text}</h2>
        </div>
    );
};

export default CosmicLoading;