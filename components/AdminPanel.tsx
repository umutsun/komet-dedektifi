/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { MissionStep } from '../types';
import { saveMission, deleteMission, seedMissions } from '../services/firebaseService';
import { missionData as defaultMissions } from '../missions';
import { XMarkIcon } from './icons';

interface AdminPanelProps {
  missions: MissionStep[];
  onClose: () => void;
  onMissionUpdate: () => void;
}

const MissionForm: React.FC<{
  mission: MissionStep;
  onSave: (mission: MissionStep) => void;
  onCancel: () => void;
}> = ({ mission: initialMission, onSave, onCancel }) => {
  const [mission, setMission] = useState<MissionStep>(initialMission);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'successPromptKeywords') {
      setMission({ ...mission, [name]: value.split(',').map(k => k.trim()) });
    } else {
      setMission({ ...mission, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.id.trim() || !mission.objective.trim()) {
        alert("Görev ID'si ve Hedefi boş olamaz.");
        return;
    }
    onSave(mission);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 space-y-4">
      <h3 className="text-lg font-bold text-blue-300">{mission.id.startsWith('new-mission-') ? 'Yeni Görev Oluştur' : 'Görevi Düzenle'}</h3>
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-slate-300">Görev ID</label>
        <input type="text" name="id" value={mission.id} onChange={handleChange} disabled={!mission.id.startsWith('new-mission-')} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-700" />
      </div>
      <div>
        <label htmlFor="objective" className="block text-sm font-medium text-slate-300">Hedef</label>
        <textarea name="objective" value={mission.objective} onChange={handleChange} rows={3} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="imagePrompt" className="block text-sm font-medium text-slate-300">Görüntü İstemi</label>
        <textarea name="imagePrompt" value={mission.imagePrompt} onChange={handleChange} rows={3} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="successPromptKeywords" className="block text-sm font-medium text-slate-300">Başarı Anahtar Kelimeleri (virgülle ayrılmış)</label>
        <input type="text" name="successPromptKeywords" value={mission.successPromptKeywords.join(', ')} onChange={handleChange} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md">İptal</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md">Kaydet</button>
      </div>
    </form>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ missions, onClose, onMissionUpdate }) => {
  const [editingMission, setEditingMission] = useState<MissionStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (mission: MissionStep) => {
    setIsLoading(true);
    try {
      await saveMission(mission);
      onMissionUpdate();
      setEditingMission(null);
    } catch (e) {
      alert(`Görev kaydedilemedi: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (missionId: string) => {
    if (window.confirm(`'${missionId}' görevini silmek istediğinizden emin misiniz?`)) {
      setIsLoading(true);
      try {
        await deleteMission(missionId);
        onMissionUpdate();
      } catch (e) {
        alert(`Görev silinemedi: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleSeed = async () => {
    if (window.confirm("Bu, mevcut görevlerin üzerine yazacaktır. Varsayılan görevleri Firestore'a eklemek istediğinizden emin misiniz?")) {
        setIsLoading(true);
        try {
            await seedMissions(defaultMissions);
            onMissionUpdate();
        } catch (e) {
            alert(`Görevler eklenemedi: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleCreateNew = () => {
    setEditingMission({
      id: `new-mission-${Date.now()}`,
      objective: '',
      imagePrompt: '',
      story: '',
      videoPrompt: '',
      successPromptKeywords: [],
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-400 tracking-widest">// GÖREV YÖNETİM PANELİ</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto">
          {editingMission ? (
            <MissionForm mission={editingMission} onSave={handleSave} onCancel={() => setEditingMission(null)} />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                  <button onClick={handleCreateNew} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md">Yeni Görev Oluştur</button>
                  <button onClick={handleSeed} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-md">Varsayılanları Yükle</button>
              </div>
              <div className="space-y-2">
                {missions.map(mission => (
                  <div key={mission.id} className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">{mission.id}</p>
                      <p className="text-sm text-slate-400 truncate max-w-lg">{mission.objective}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingMission(mission)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-md">Düzenle</button>
                      <button onClick={() => handleDelete(mission.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-md">Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {isLoading && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <p className="text-white text-lg animate-pulse">İşleniyor...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
