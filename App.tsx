/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState, useRef} from 'react';
import { User as FirebaseUser } from "firebase/auth";
import TelescopeView from './components/TelescopeView';
import {missionData} from './missions';
import {
  generateHalResponse,
  generateMissionCompleteVideo,
  editNasaImage,
  generateInitialHalGreeting,
  generateAstrobotMission,
  generateFinalVideoPrompt,
  interpretUserCommand,
  interpretNasaData,
  generateHalErrorResponse,
  generateInitialMissionData
} from './services/geminiService';
import { getSmallBodyData } from './services/nasaService';
import {AppState, User, Ship, InterpretedData, InterpretedCommand, MissionStep, CaptainLogEntry, PlayerAsset, TelescopeHotspot, PlayerProfile} from './types';
import MissionCompleteView from './components/MissionCompleteView';
import AstrobotView from './components/AstrobotView';
import HalConsole from './components/HalConsole';
import ToplantiView from './components/ToplantiView';
import PlayerAvatar from './components/PlayerAvatar';
import { onAuthStateChanged, getUserProfile, getMissions, getShip, saveConversationHistory, saveLogEntry, isFirebaseConfigured, updateUserProfile, listenToLogEntries, listenToPlayerAssets, savePlayerAsset, createUserProfile } from './services/firebaseService';
import AdminPanel from './components/AdminPanel';
import { WifiIcon } from './components/icons';
import SeyirDefteriView from './components/SeyirDefteriView';
import Auth from './components/Auth';
import ShipSelection from './components/ShipSelection';
import HalLoadingCube from './components/HalLoadingCube';
import CosmosView from './components/CosmosView';
import UserProfileModal from './components/UserProfileModal';
import FirebaseSetupPrompt from './components/FirebaseSetupPrompt';
import ProfileSetup from './components/ProfileSetup';
import AstrobotWidget from './components/AstrobotWidget';

const ADMIN_UIDS = ['YOUR_ADMIN_UID_HERE']; // Gerçek admin UID'nizi buraya ekleyin

type PanelId = 'TELESKOP' | 'ASTROBOT' | 'KOZMOS' | 'TOPLANTI' | 'SEYİR DEFTERİ';
type ViewState = 'SETUP_REQUIRED' | 'AUTH' | 'PROFILE_SETUP' | 'SHIP_SELECTION' | 'GAME' | 'LOADING';

// --- Accordion Component ---
const AccordionItem: React.FC<{ title: string; panelId: PanelId; isOpen: boolean; onToggle: (panelId: PanelId | null) => void; children: React.ReactNode; }> = ({ title, panelId, isOpen, onToggle, children }) => {
  const handleToggle = () => onToggle(isOpen ? null : panelId);
  return (
    <div className={`flex bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-lg overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'flex-grow min-w-0 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'flex-shrink-0 w-[50px]'}`}>
      <button onClick={handleToggle} className="h-full w-[50px] flex-shrink-0 px-2.5 py-4 text-sm font-bold tracking-widest text-blue-300 hover:bg-blue-500/10 flex flex-col items-center justify-center gap-4" aria-expanded={isOpen}>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
        <span className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap">// {title}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 flex-grow min-w-0' : 'opacity-0 w-0'}`}>
        {isOpen && <div className="h-full w-full">{children}</div>}
      </div>
    </div>
  );
};


function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [viewState, setViewState] = useState<ViewState>('LOADING');
  const [error, setError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentShip, setCurrentShip] = useState<Ship | null>(null);

  const [conversationHistory, setConversationHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
  
  const [allMissions, setAllMissions] = useState<MissionStep[]>([]);
  const [currentMission, setCurrentMission] = useState<MissionStep | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [openPanel, setOpenPanel] = useState<PanelId | null>('TELESKOP');
  
  const telescopePanelRef = useRef<HTMLDivElement>(null);
  const [telescopeImage, setTelescopeImage] = useState<string | null>(null);
  const [telescopePrompt, setTelescopePrompt] = useState('');
  const [telescopeHotspots, setTelescopeHotspots] = useState<TelescopeHotspot[]>([]);
  
  const [astrobotImage, setAstrobotImage] = useState<string | null>(null);
  const [astrobotPrompt, setAstrobotPrompt] = useState('');
  const [isAstrobotActive] = useState(true);
  
  const [interpretedData, setInterpretedData] = useState<InterpretedData | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [consolePrompt, setConsolePrompt] = useState('');
  const [confirmationRequest, setConfirmationRequest] = useState<InterpretedCommand | null>(null);
  
  // Admin & UI State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [firebaseUserForSetup, setFirebaseUserForSetup] = useState<FirebaseUser | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);


  const [logEntries, setLogEntries] = useState<CaptainLogEntry[]>([]);
  const [playerAssets, setPlayerAssets] = useState<PlayerAsset[]>([]);

  const isProcessing = appState === AppState.LOADING || appState === AppState.GENERATING_IMAGE || appState === AppState.GENERATING_VIDEO || isInterpreting || isInitializing;
  
  const startOfflineMode = (asAdmin = false) => {
    console.warn("Firebase yapılandırılmamış. Uygulama çevrimdışı modda çalışıyor.");
    // Developer mode bypass for localhost
    if (window.location.hostname === 'localhost' && !currentUser) {
        console.log("// DEV MODE: Admin bypass enabled.");
        const dummyAdmin: User = { uid: 'admin_user', name: 'Admin', gender: 'male', avatar: {type: 'A', color: '#ff0000'}, currentShipId: 'dev_ship' };
        const dummyShip: Ship = { id: 'dev_ship', name: 'Dev Ship', captainId: 'admin_user', crew: ['admin_user'], currentMissionId: missionData[0].id, conversationHistory: [], logEntries: [], playerAssets: [] };
        setCurrentUser(dummyAdmin);
        setCurrentShip(dummyShip);
        setIsAdmin(true);
        setViewState('GAME');
        return;
    }

    const uid = asAdmin ? 'admin_user' : 'local_user';
    const name = asAdmin ? 'Admin' : 'Kaptan';
    
    const dummyUser: User = {
        uid,
        name,
        gender: 'male',
        avatar: { type: 'A', color: '#00ffff' },
        currentShipId: 'local_ship',
    };
    const dummyShip: Ship = {
        id: 'local_ship',
        name: 'Odyssey (Çevrimdışı)',
        captainId: uid,
        crew: [uid],
        currentMissionId: 'mission-1',
        conversationHistory: [],
        logEntries: [],
        playerAssets: [],
    };

    setCurrentUser(dummyUser);
    setCurrentShip(dummyShip);
    if(asAdmin) setIsAdmin(true);
    setViewState('GAME');
  };

  // --- Auth & Profile Loading Effect ---
  useEffect(() => {
    if (!isFirebaseConfigured) {
        // Allow developer bypass even if firebase isn't configured
        if (window.location.hostname === 'localhost') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('admin') === 'true') {
                 startOfflineMode(true);
                 return;
            }
        }
        setViewState('SETUP_REQUIRED');
        return;
    }
    
    // Developer mode bypass for localhost
    if (window.location.hostname === 'localhost' && !currentUser) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            startOfflineMode(true);
            return;
        }
    }
      
    const unsubscribe = onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        setViewState('LOADING');
        if (firebaseUser) {
            console.log(`// Auth state changed: User found (UID: ${firebaseUser.uid}). Veri yükleniyor...`);
            setIsAdmin(ADMIN_UIDS.includes(firebaseUser.uid));
            try {
                const userProfile = await getUserProfile(firebaseUser.uid);
                if (userProfile) {
                    console.log(`// Profil bulundu: ${userProfile.name}. Gemi bilgisi kontrol ediliyor...`);
                    setCurrentUser(userProfile);
                    if (userProfile.currentShipId) {
                        const ship = await getShip(userProfile.currentShipId);
                        if (ship) {
                            console.log(`// Gemi bulundu: ${ship.name}. Oyuna giriliyor.`);
                            setCurrentShip(ship);
                            setViewState('GAME');
                        } else {
                            console.warn(`// Gemi ID'si (${userProfile.currentShipId}) profilde var ama bulunamadı. Gemi seçimine yönlendiriliyor.`);
                            setViewState('SHIP_SELECTION');
                        }
                    } else {
                        console.log("// Kullanıcının mevcut bir gemisi yok. Gemi seçimine yönlendiriliyor.");
                        setViewState('SHIP_SELECTION');
                    }
                } else {
                    console.log(`// Firebase kullanıcısı var ama profil bulunamadı (UID: ${firebaseUser.uid}). Profil oluşturmaya yönlendiriliyor.`);
                    setFirebaseUserForSetup(firebaseUser);
                    setCurrentUser(null);
                    setCurrentShip(null);
                    setViewState('PROFILE_SETUP');
                }
            } catch (error) {
                console.error("// Profil veya gemi bilgileri yüklenirken kritik hata:", error);
                setCurrentUser(null);
                setCurrentShip(null);
                setViewState('AUTH');
            }
        } else {
            console.log("// Auth state changed: Kullanıcı bulunamadı. Oturum açma ekranına yönlendiriliyor.");
            setIsAdmin(false);
            setFirebaseUserForSetup(null);
            setCurrentUser(null);
            setCurrentShip(null);
            setViewState('AUTH');
        }
    });
    return () => unsubscribe();
  }, []);

  // --- Game State Loading from Ship ---
  useEffect(() => {
    if (viewState === 'GAME' && currentShip) {
        setConversationHistory(currentShip.conversationHistory);
        const mission = allMissions.find(m => m.id === currentShip.currentMissionId);
        setCurrentMission(mission || allMissions[0]);
    }
  }, [viewState, currentShip, allMissions]);

  // --- Real-time data listeners for subcollections ---
  useEffect(() => {
      if (viewState === 'GAME' && currentShip && isFirebaseConfigured) {
          const unsubscribeLogs = listenToLogEntries(currentShip.id, (entries) => {
              setLogEntries(entries.sort((a, b) => b.timestamp - a.timestamp));
          });
          const unsubscribeAssets = listenToPlayerAssets(currentShip.id, (assets) => {
              setPlayerAssets(assets);
          });

          return () => {
              unsubscribeLogs();
              unsubscribeAssets();
          };
      }
  }, [viewState, currentShip]);

  const addLogEntry = async (author: string, content: string) => {
    if (!currentUser || !currentShip || !content.trim()) return;
    if (!isFirebaseConfigured) {
        const newEntry: CaptainLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            author,
            content
        };
        setLogEntries(prev => [newEntry, ...prev].sort((a,b) => b.timestamp - a.timestamp));
        return;
    }
    await saveLogEntry(currentShip.id, author, content);
  };

  // --- Mission Initialization ---
  const initializeMission = useCallback(async () => {
    if (!currentUser || !currentMission || !currentShip) return;

    setIsInitializing(true);
    setError(null);
    setTelescopePrompt(currentMission.imagePrompt);
    setTelescopeHotspots([]);

    try {
        if (currentShip.conversationHistory.length === 0) {
            const [missionData, halGreeting] = await Promise.all([
                generateInitialMissionData(currentMission.imagePrompt, currentUser.name),
                generateInitialHalGreeting(currentUser.name, currentMission.objective)
            ]);
            
            setTelescopeImage(`data:image/jpeg;base64,${missionData.imageBase64}`);
            setTelescopeHotspots(missionData.hotspots);
            
            const halMessage = { role: 'model' as const, content: halGreeting };
            
            if (isFirebaseConfigured) {
                await saveConversationHistory(currentShip.id, [halMessage]);
            }
            setConversationHistory([halMessage]);
            await addLogEntry('HAL', halGreeting);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu.';
        setError(errorMessage);
        const halErrorResponse = await generateHalErrorResponse(errorMessage, currentUser.name);
        addMessageToHistory('model', halErrorResponse);
    } finally {
        setIsInitializing(false);
    }
  }, [currentUser, currentMission, currentShip]);

  // --- Fetch Missions Effect ---
  const fetchAndSetMissions = useCallback(async () => {
      const missionsFromDb = isFirebaseConfigured ? await getMissions() : [];
      const missions = (missionsFromDb.length > 0) ? missionsFromDb : missionData;
      setAllMissions(missions);
  }, []);

  useEffect(() => {
    fetchAndSetMissions();
  }, [fetchAndSetMissions]);

  useEffect(() => {
    if (viewState === 'GAME' && currentUser && currentMission && currentShip) {
      initializeMission();
    }
  }, [viewState, currentUser, currentMission, currentShip, initializeMission]);


  const addMessageToHistory = async (role: 'user' | 'model', content: string) => {
    if (!currentShip) return;
    const newHistory = [...conversationHistory, { role, content }];
    setConversationHistory(newHistory);
    if(isFirebaseConfigured) {
        await saveConversationHistory(currentShip.id, newHistory);
    }
    await addLogEntry(role === 'user' ? (currentUser?.name ?? 'Kaptan') : 'HAL', content);
  };

  const handleSaveLog = async (content: string) => {
    if (!currentUser || !currentShip || !content.trim()) return;
    await addLogEntry(currentUser.name, content);
  };
  
  const handleProfileCreated = async (profile: PlayerProfile) => {
    if (!firebaseUserForSetup) return;
    setIsCreatingProfile(true);
    setError(null);
    try {
        await createUserProfile(firebaseUserForSetup, profile.name, profile.gender, profile.avatar);
        const newUserProfile = await getUserProfile(firebaseUserForSetup.uid);
        if (newUserProfile) {
            setCurrentUser(newUserProfile);
            setViewState('SHIP_SELECTION');
        } else {
            throw new Error("Profil oluşturuldu ancak alınamadı.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Profil oluşturulamadı.';
        setError(errorMessage);
        console.error("// Profil oluşturulurken hata:", error);
    } finally {
        setIsCreatingProfile(false);
        setFirebaseUserForSetup(null);
    }
  };

  const handleSaveProfile = async (updatedProfile: Partial<Pick<User, 'name' | 'gender' | 'avatar'>>) => {
    if (!currentUser) return;
    try {
        const newProfile = { ...currentUser, ...updatedProfile };
        if (isFirebaseConfigured) {
            await updateUserProfile(currentUser.uid, updatedProfile);
        }
        setCurrentUser(newProfile);
        setIsProfileModalOpen(false);
        const profileUpdateMsg = '// HAL: Kaptan profili güncellendi.';
        await addMessageToHistory('model', profileUpdateMsg);
    } catch (error) {
        console.error("Profil güncellenirken hata oluştu:", error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
        const halErrorResponse = await generateHalErrorResponse(errorMessage, currentUser.name);
        await addMessageToHistory('model', halErrorResponse);
    }
  };

  const executeCommand = async (command: InterpretedCommand) => {
    if (!currentUser || !currentMission || !currentShip) return;

    try {
        switch (command.action) {
            case 'COMPLETE_MISSION':
                setAppState(AppState.GENERATING_VIDEO);
                await addMessageToHistory('model', `// HAL: Anlaşıldı, Kaptan. Görev günlüğünü derliyor ve video kaydını oluşturuyorum.`);
                const videoPrompt = await generateFinalVideoPrompt(conversationHistory, currentMission.objective, currentUser.name);
                const generatedVideoUrl = await generateMissionCompleteVideo(videoPrompt);
                setVideoUrl(generatedVideoUrl);
                setAppState(AppState.MISSION_COMPLETE);
                break;

            case 'EDIT_IMAGE':
                if (telescopeImage && command.params.prompt) {
                    setAppState(AppState.GENERATING_IMAGE);
                    const { base64, mimeType } = await imageUrlToBase64(telescopeImage);
                    const newBase64 = await editNasaImage(base64, mimeType, command.params.prompt);
                    const newImageUrl = `data:image/jpeg;base64,${newBase64}`;
                    setTelescopeImage(newImageUrl);
                    
                    const newAsset = { type: 'telescope' as const, prompt: command.params.prompt, imageDataUrl: newImageUrl };
                    if (isFirebaseConfigured) {
                        await savePlayerAsset(currentShip.id, currentUser.name, newAsset);
                    } else {
                        setPlayerAssets(prev => [{...newAsset, id: `asset-${Date.now()}`, author: currentUser.name, timestamp: Date.now()}, ...prev]);
                    }

                    await addMessageToHistory('model', `// HAL: Görüntü geliştirildi ve gemi galerisine kaydedildi, ${currentUser.name}.`);
                    await addLogEntry('Sistem', `Teleskop görüntüsü, Kaptan ${currentUser.name} tarafından verilen "${command.params.prompt}" komutuyla düzenlendi.`);
                }
                break;
            
            case 'ASTROBOT_MISSION':
                if (isAstrobotActive && command.params.prompt) {
                    setAppState(AppState.GENERATING_IMAGE);
                    const { imageBase64, missionDescription } = await generateAstrobotMission(command.params.prompt, currentUser.name);
                    const newAstrobotImageUrl = `data:image/jpeg;base64,${imageBase64}`;
                    setAstrobotImage(newAstrobotImageUrl);
                    setAstrobotPrompt(missionDescription);
                    
                    const newAsset = { type: 'astrobot' as const, prompt: missionDescription, imageDataUrl: newAstrobotImageUrl };
                    if(isFirebaseConfigured) {
                        await savePlayerAsset(currentShip.id, currentUser.name, newAsset);
                    } else {
                        setPlayerAssets(prev => [{...newAsset, id: `asset-${Date.now()}`, author: currentUser.name, timestamp: Date.now()}, ...prev]);
                    }
                    await addMessageToHistory('model', `// HAL: Astrobot için yeni görev atandı ve galeriye kaydedildi. Detaylar HUD'da.`);
                    await addLogEntry('Sistem', `Astrobot'a yeni görev atandı: ${missionDescription}`);
                }
                break;

            case 'INTERPRET_DATA':
                if (command.params.target) {
                    setIsInterpreting(true);
                    setInterpretedData(null);
                    await addLogEntry('Sistem', `NASA veritabanından '${command.params.target}' için veri isteniyor.`);
                    const nasaData = await getSmallBodyData(command.params.target);
                    const interpretation = nasaData ? await interpretNasaData(nasaData, currentUser.name) : { summary: `// VERİ ALINAMADI: '${command.params.target}' hedefi bulunamadı.`, objectName: command.params.target, distance: "N/A", velocity: "N/A" };
                    setInterpretedData(interpretation);
                    const halInterpretationMsg = `// HAL: Kaptan, ${interpretation.objectName} hakkındaki verileri yorumladım. Detaylar teleskop HUD'unda mevcut.`;
                    await addMessageToHistory('model', halInterpretationMsg);
                    setIsInterpreting(false);
                }
                break;

            case 'GENERAL_CONVERSATION':
            case 'UNKNOWN':
            default:
                setAppState(AppState.LOADING);
                const { text } = await generateHalResponse(currentMission.objective, currentUser.name, conversationHistory);
                await addMessageToHistory('model', text);
                break;
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu.';
        setError(errorMessage);
        console.error("Execute command error:", e);
        const halErrorResponse = await generateHalErrorResponse(errorMessage, currentUser.name);
        await addMessageToHistory('model', halErrorResponse);
    } finally {
        setAppState(AppState.IDLE);
    }
  };

  const handleGenerate = async (prompt: string) => {
    if (!currentUser || !prompt.trim()) return;

    await addMessageToHistory('user', prompt);
    setConsolePrompt('');

    if (confirmationRequest) {
        const affirmative = ['evet', 'onayla', 'doğru'].some(w => prompt.toLowerCase().includes(w));
        if (affirmative) {
            await executeCommand(confirmationRequest);
        } else {
            await addMessageToHistory('model', '// HAL: Anlaşıldı. Eylem iptal edildi.');
        }
        setConfirmationRequest(null);
        return;
    }

    setAppState(AppState.LOADING);
    const command = await interpretUserCommand(prompt, currentUser.name);
    
    if (command.isCritical) {
        setConfirmationRequest(command);
        await addMessageToHistory('model', `// HAL: Kaptan, '${command.action.replace(/_/g, ' ')}' eylemini onaylıyor musunuz?`);
        setAppState(AppState.IDLE);
    } else {
        await executeCommand(command);
    }
  };

  const handleHotspotClick = (prompt: string) => {
    if (isProcessing) return;
    setConsolePrompt(prompt);
  };
  
  const handleAstrobotDrop = (x: number, y: number) => {
    if (!telescopePanelRef.current) return;
    
    const telescopeRect = telescopePanelRef.current.getBoundingClientRect();
    const hotspotElements = telescopePanelRef.current.querySelectorAll('[data-hotspot-id]');
    
    let droppedOnHotspot: TelescopeHotspot | null = null;
    
    hotspotElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Bırakma koordinatlarının hotspot'un sınırlayıcı kutusu içinde olup olmadığını kontrol et
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const id = parseInt(el.getAttribute('data-hotspot-id') || '', 10);
        const hotspotData = telescopeHotspots.find(h => h.id === id);
        if (hotspotData) {
            droppedOnHotspot = hotspotData;
        }
      }
    });

    if (droppedOnHotspot) {
      const newPrompt = `Astrobot'u kullanarak '${droppedOnHotspot.label}' hedefini analiz et.`;
      setConsolePrompt(newPrompt);
      addMessageToHistory('model', `// HAL: Astrobot, '${droppedOnHotspot.label}' hedefine yönlendirildi. Komutu onaylayın.`);
    }
  };

  const imageUrlToBase64 = async (url: string): Promise<{base64: string, mimeType: string}> => {
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      return { base64: parts[1], mimeType };
    }
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({ base64: base64Data, mimeType: blob.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (viewState === 'LOADING') {
      return (
          <main className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center">
              <HalLoadingCube />
          </main>
      );
  }
  
  if (viewState === 'SETUP_REQUIRED') {
      return <FirebaseSetupPrompt onContinueOffline={() => startOfflineMode(false)} />;
  }
  
  if (viewState === 'PROFILE_SETUP' && firebaseUserForSetup) {
      return <ProfileSetup user={firebaseUserForSetup} onProfileCreated={handleProfileCreated} isCreating={isCreatingProfile} />;
  }

  if (viewState === 'AUTH' || !currentUser) {
      return <Auth />;
  }

  if (viewState === 'SHIP_SELECTION' || !currentShip) {
      return <ShipSelection user={currentUser} onShipSelected={(ship) => { setCurrentShip(ship); setViewState('GAME'); }} missions={allMissions} />;
  }
  
  const lastMessage = [...conversationHistory].reverse().find(m => m.role === 'model')?.content ?? `// HAL: ${currentUser.name}, göreve hazırım.`;

  return (
    <main className="h-screen w-screen bg-slate-950 font-mono flex flex-col items-stretch justify-center text-slate-300 p-2 relative overflow-hidden">
        <PlayerAvatar profile={currentUser} onClick={() => setIsProfileModalOpen(true)} />
        <AstrobotWidget onDrop={handleAstrobotDrop} />
        
        <div className="flex-grow w-full max-w-full mx-auto flex items-stretch gap-2 py-2">
            <div ref={telescopePanelRef} className="flex-grow flex min-w-0">
                <AccordionItem title="TELESKOP" panelId="TELESKOP" isOpen={openPanel === 'TELESKOP'} onToggle={setOpenPanel}>
                <TelescopeView 
                    imageUrl={telescopeImage} 
                    isGenerating={isProcessing && appState === AppState.GENERATING_IMAGE} 
                    isInitializing={isInitializing} 
                    prompt={telescopePrompt} 
                    interpretedData={interpretedData} 
                    isInterpretingData={isInterpreting}
                    hotspots={telescopeHotspots}
                    onHotspotClick={handleHotspotClick}
                />
                </AccordionItem>
            </div>
            <AccordionItem title="ASTROBOT" panelId="ASTROBOT" isOpen={openPanel === 'ASTROBOT'} onToggle={setOpenPanel}>
              <AstrobotView imageUrl={astrobotImage} isGenerating={isProcessing && appState === AppState.GENERATING_IMAGE} appState={appState} prompt={astrobotPrompt} isAstrobotActive={isAstrobotActive} />
            </AccordionItem>
            <AccordionItem title="KOZMOS" panelId="KOZMOS" isOpen={openPanel === 'KOZMOS'} onToggle={setOpenPanel}>
              <CosmosView />
            </AccordionItem>
            <AccordionItem title="TOPLANTI" panelId="TOPLANTI" isOpen={openPanel === 'TOPLANTI'} onToggle={setOpenPanel}>
                <ToplantiView history={conversationHistory} playerName={currentUser.name} onCommandSelect={(cmd) => setConsolePrompt(cmd)} isInitializing={isInitializing} />
            </AccordionItem>
            <AccordionItem title="SEYİR DEFTERİ" panelId="SEYİR DEFTERİ" isOpen={openPanel === 'SEYİR DEFTERİ'} onToggle={setOpenPanel}>
                <SeyirDefteriView logEntries={logEntries} playerAssets={playerAssets} onSaveLogEntry={handleSaveLog} />
            </AccordionItem>
        </div>

        <HalConsole
          message={error ? `// HATA: ${error}` : lastMessage}
          isError={error !== null}
          onGenerate={handleGenerate}
          isProcessing={isProcessing}
          onMaximize={() => {}}
          headerStatusText={isProcessing ? 'İŞLENİYOR' : confirmationRequest ? 'ONAY BEKLENİYOR' : 'HAZIR'}
          playerName={currentUser.name}
          prompt={consolePrompt}
          onPromptChange={setConsolePrompt}
          isAwaitingConfirmation={!!confirmationRequest}
          onConfirm={() => handleGenerate('evet')}
          onCancel={() => handleGenerate('hayır')}
        />
        
        {isAdmin && (
          <button onClick={() => setIsAdminPanelOpen(true)} className="fixed top-4 left-4 z-40 p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-all" title="Yönetim Paneli">
              <WifiIcon className="w-5 h-5" />
          </button>
        )}

        {isAdminPanelOpen && (
          <AdminPanel missions={allMissions} onClose={() => setIsAdminPanelOpen(false)} onMissionUpdate={fetchAndSetMissions} />
        )}
        
        {isProfileModalOpen && currentUser && (
            <UserProfileModal 
                user={currentUser}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
            />
        )}

        {appState === AppState.MISSION_COMPLETE && videoUrl && (
          <MissionCompleteView videoUrl={videoUrl} onNewInvestigation={() => {
              setAppState(AppState.IDLE);
              setVideoUrl(null);
          }} />
        )}
    </main>
  );
}

export default App;