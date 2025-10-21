/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { User, AvatarProps } from '../types';
import { XMarkIcon, AdamIcon, EveIcon } from './icons';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedProfile: Partial<Pick<User, 'name' | 'avatar'>>) => void;
}

const AVATAR_TYPES: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
const AVATAR_COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#76e1ff', '#fa7ee3', '#ffffff'];

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave({ name, avatar });
    setIsSaving(false);
  };

  const AvatarComponent = user.gender === 'male' ? AdamIcon : EveIcon;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 shadow-xl max-w-lg w-full flex flex-col panel-corners"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-3 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-200 tracking-widest">// KAPTAN PROFİLİ</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-32 h-32 p-2 bg-slate-800/50 border border-slate-700">
                    <AvatarComponent className="w-full h-full text-slate-500" {...avatar} />
                </div>
                <p className="mt-2 text-slate-400 text-sm">KAPTAN {user.name}</p>
            </div>

            <div className="flex-grow space-y-4">
                <div>
                    <label htmlFor="captainName" className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">KAPTAN ADI</label>
                    <input
                      id="captainName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none p-2 text-slate-200"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">KASK TİPİ</label>
                    <div className="flex gap-2">
                        {AVATAR_TYPES.map(type => (
                            <button key={type} onClick={() => setAvatar(a => ({...a, type}))} className={`flex-1 p-2 border-2 ${avatar.type === type ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                                TİP {type}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">VİZÖR RENGİ</label>
                    <div className="flex gap-2 flex-wrap">
                        {AVATAR_COLORS.map(color => (
                            <button key={color} onClick={() => setAvatar(a => ({...a, color}))} className={`w-8 h-8 rounded-full border-2 ${avatar.color === color ? 'border-white' : 'border-transparent'}`} style={{backgroundColor: color}} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <footer className="p-3 border-t border-slate-700 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold text-sm">İPTAL</button>
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:bg-slate-700">
                {isSaving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UserProfileModal;
