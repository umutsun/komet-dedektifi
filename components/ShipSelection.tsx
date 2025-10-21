/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { User, Ship, MissionStep } from '../types';
import { createShip, joinShip, logOut } from '../services/firebaseService';
import HalLoadingCube from './HalLoadingCube';

interface ShipSelectionProps {
  user: User;
  missions: MissionStep[];
  onShipSelected: (ship: Ship) => void;
}

const ShipSelection: React.FC<ShipSelectionProps> = ({ user, missions, onShipSelected }) => {
  const [shipName, setShipName] = useState('');
  const [joinShipId, setJoinShipId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipName.trim() || missions.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const newShip = await createShip(user, shipName, missions[0].id);
      onShipSelected(newShip);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gemi oluşturulamadı.');
      setIsLoading(false);
    }
  };
  
  const handleJoinShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinShipId.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const ship = await joinShip(user, joinShipId.trim());
      if (ship) {
        onShipSelected(ship);
      } else {
        throw new Error("Gemi bulunamadı veya katılamadı.");
      }
    } catch (err) {
       setError(err instanceof Error ? err.message : 'Gemiye katılamadı.');
       setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-slate-950 font-mono flex flex-col items-center justify-center text-slate-300 p-4 relative overflow-hidden">
        <div className="starfield"><div className="stars stars-1"></div><div className="stars stars-2"></div><div className="stars stars-3"></div></div>
        <HalLoadingCube />
        
        <div className="absolute top-4 right-4 z-20">
            <span className="text-slate-400 mr-4">Hoş geldin, {user.name}</span>
            <button onClick={logOut} className="px-3 py-1 bg-red-600/50 hover:bg-red-500/80 text-white font-bold text-xs">ÇIKIŞ YAP</button>
        </div>

      <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-8 relative z-10 grid md:grid-cols-2 gap-8">
        {/* Create Ship */}
        <div className="text-left">
          <h2 className="text-xl font-bold tracking-widest uppercase mb-2 text-blue-400">// YENİ BİR GÖREV BAŞLAT</h2>
          <p className="text-slate-400 mb-6">Kendi geminizin kaptanı olun ve mürettebatınızı toplayın.</p>
          <form onSubmit={handleCreateShip}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">GEMİ ADI</label>
              <input type="text" value={shipName} onChange={(e) => setShipName(e.target.value)} placeholder="Örn: Odyssey II" className="w-full bg-slate-900 border border-slate-700 p-2.5" required />
            </div>
            <button type="submit" disabled={isLoading || !shipName.trim()} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest disabled:bg-slate-700">
                {isLoading ? 'OLUŞTURULUYOR...' : 'GEMİYİ OLUŞTUR'}
            </button>
          </form>
        </div>
        
        {/* Join Ship */}
        <div className="text-left border-t-2 md:border-t-0 md:border-l-2 border-slate-700 pt-8 md:pt-0 md:pl-8">
            <h2 className="text-xl font-bold tracking-widest uppercase mb-2 text-blue-400">// BİR MÜRETTEBATA KATIL</h2>
            <p className="text-slate-400 mb-6">Bir arkadaşınızın gemisine katılmak için davet kodunu girin.</p>
            <form onSubmit={handleJoinShip}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wider">GEMİ ID</label>
                <input type="text" value={joinShipId} onChange={(e) => setJoinShipId(e.target.value)} placeholder="Gemi ID'sini buraya yapıştırın" className="w-full bg-slate-900 border border-slate-700 p-2.5" required />
              </div>
              <button type="submit" disabled={isLoading || !joinShipId.trim()} className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest disabled:bg-slate-700">
                {isLoading ? 'KATILINIYOR...' : 'MÜRETTEBATA KATIL'}
              </button>
            </form>
        </div>

        {error && <p className="text-red-400 text-sm text-center col-span-full mt-4">{error}</p>}

      </div>
    </main>
  );
};

export default ShipSelection;
