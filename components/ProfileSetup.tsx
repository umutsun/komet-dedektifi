/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { PlayerProfile, AvatarProps } from '../types';
import { AdamIcon, EveIcon } from './icons';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileSetupProps {
  user: FirebaseUser;
  onProfileCreated: (profile: PlayerProfile) => void;
  isCreating: boolean;
}

const AVATAR_TYPES: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
const AVATAR_COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#76e1ff', '#fa7ee3', '#ffffff'];

const getRandomType = (): 'A' | 'B' | 'C' => AVATAR_TYPES[Math.floor(Math.random() * AVATAR_TYPES.length)];
const getRandomColor = (): string => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onProfileCreated, isCreating }) => {
  const [name, setName] = useState(user.displayName || '');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatar, setAvatar] = useState<AvatarProps>({
    type: getRandomType(),
    color: getRandomColor(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onProfileCreated({ name: name.trim(), gender, avatar });
    }
  };

  const AvatarComponent = gender === 'male' ? AdamIcon : EveIcon;

  return (
    <main className="h-screen w-screen bg-slate-950 font-mono flex flex-col items-center justify-center text-slate-300 p-4 relative overflow-hidden">
      <div className="starfield">
        <div className="stars stars-1"></div>
        <div className="stars stars-2"></div>
        <div className="stars stars-3"></div>
      </div>
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-8 relative z-10">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-blue-400 text-center">
          // PROFİL_OLUŞTUR
        </h1>
        <p className="text-slate-400 mb-6 text-center">Hoş geldin, Kaptan. Göreve başlamadan önce profilini tamamla.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Preview and Customization */}
            <div className="flex-shrink-0 flex flex-col items-center md:w-1/3">
              <div className="w-40 h-40 p-2 bg-slate-800/50 border border-slate-700 mb-4">
                <AvatarComponent className="w-full h-full text-slate-500" {...avatar} />
              </div>
               <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider text-center">VİZÖR RENGİ</label>
                  <div className="flex gap-2 flex-wrap justify-center">
                      {AVATAR_COLORS.map(color => (
                          <button key={color} type="button" onClick={() => setAvatar(a => ({...a, color}))} className={`w-8 h-8 rounded-full border-2 ${avatar.color === color ? 'border-white' : 'border-transparent'}`} style={{backgroundColor: color}} />
                      ))}
                  </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="flex-grow space-y-4">
              <div>
                <label htmlFor="captainName" className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">KAPTAN ADI</label>
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
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">CİNSİYET</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`p-2 border-2 transition-colors text-center ${gender === 'male' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >ADAM</button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`p-2 border-2 transition-colors text-center ${gender === 'female' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >EVE</button>
                </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">KASK TİPİ</label>
                  <div className="grid grid-cols-3 gap-2">
                      {AVATAR_TYPES.map(type => (
                          <button key={type} type="button" onClick={() => setAvatar(a => ({...a, type}))} className={`p-2 border-2 ${avatar.type === type ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                              TİP {type}
                          </button>
                      ))}
                  </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="w-full mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors text-base tracking-widest disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {isCreating ? 'PROFİL OLUŞTURULUYOR...' : 'GÖREVE BAŞLA'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ProfileSetup;
