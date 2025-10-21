/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { PlayerProfile, AvatarProps } from '../types';
import { AdamIcon, EveIcon } from './icons';
import HalLoadingCube from './HalLoadingCube';

interface CharacterSelectionProps {
  onMissionStart: (profile: PlayerProfile) => void;
}

const getRandomType = (): 'A' | 'B' | 'C' => {
  const types: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  return types[Math.floor(Math.random() * types.length)];
};

const getRandomColor = (): string => {
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#76e1ff', '#fa7ee3'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateRandomAvatarProps = (): AvatarProps => ({
  type: getRandomType(),
  color: getRandomColor(),
});

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onMissionStart }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  // Generate and memoize random avatar props for this session
  const [adamAvatar] = useState(generateRandomAvatarProps);
  const [eveAvatar] = useState(generateRandomAvatarProps);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && gender) {
      const selectedAvatar = gender === 'male' ? adamAvatar : eveAvatar;
      onMissionStart({ name: name.trim(), gender, avatar: selectedAvatar });
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
      <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-8 text-center relative z-10">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-blue-400">
          // KOMET DEDEKTİFİ
        </h1>
        <p className="text-slate-400 mb-6">Göreve başlamadan önce kimliğinizi doğrulayın.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="captainName" className="block text-left text-sm font-bold text-slate-300 mb-2 tracking-wider">KAPTAN ADI</label>
            <input
              id="captainName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="İsminizi girin..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 text-slate-200"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-left text-sm font-bold text-slate-300 mb-2 tracking-wider">KARAKTER SEÇİN</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-4 border-2 transition-colors flex flex-col items-center justify-center ${gender === 'male' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <AdamIcon className="w-20 h-20 mb-2 text-slate-500" {...adamAvatar} />
                <div className="font-bold tracking-wider">ADAM</div>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-4 border-2 transition-colors flex flex-col items-center justify-center ${gender === 'female' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <EveIcon className="w-20 h-20 mb-2 text-slate-500" {...eveAvatar} />
                <div className="font-bold tracking-wider">EVE</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !gender}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors text-base tracking-widest disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            GÖREVİ BAŞLAT
          </button>
        </form>
      </div>
    </main>
  );
};

export default CharacterSelection;