/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
    getFirestore, doc, setDoc, getDoc, Firestore, collection, 
    getDocs, deleteDoc, writeBatch, addDoc, serverTimestamp, 
    query, orderBy, updateDoc, arrayUnion, onSnapshot, Unsubscribe
} from "firebase/firestore";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    onAuthStateChanged as onFirebaseAuthStateChanged, Auth, User as FirebaseUser, signOut,
    GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";
import type { User, Ship, MissionStep, CaptainLogEntry, PlayerAsset, AvatarProps } from "../types";

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    } catch (e) {
        console.error("Firebase başlatılamadı.", e);
    }
} else {
    console.warn("Firebase yapılandırılmamış. Tüm online özellikler devre dışı bırakıldı.");
}

// --- Auth Functions ---
const getRandomType = (): 'A' | 'B' | 'C' => {
  const types: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  return types[Math.floor(Math.random() * types.length)];
};
const getRandomColor = (): string => {
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#76e1ff', '#fa7ee3'];
  return colors[Math.floor(Math.random() * colors.length)];
};
const generateRandomAvatarProps = (): AvatarProps => ({ type: getRandomType(), color: getRandomColor() });

export const signInWithGoogle = async (): Promise<void> => {
    if (!auth || !db) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user profile already exists
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // New user, create a profile
            const randomAvatar = generateRandomAvatarProps();
            await createUserProfile(
                user,
                user.displayName || `Kaptan-${user.uid.substring(0, 4)}`,
                'male', // Default gender, user can change later
                randomAvatar
            );
        }
        // If user exists, onAuthStateChanged will handle the rest.
    } catch (error) {
        console.error("Google ile oturum açma hatası:", error);
        throw error;
    }
};

export const signUp = (email: string, pass: string) => auth ? createUserWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error("Firebase not configured"));
export const signIn = (email: string, pass: string) => auth ? signInWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error("Firebase not configured"));
export const logOut = () => auth ? signOut(auth) : Promise.resolve();

export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
    if (!auth) return () => {};
    return onFirebaseAuthStateChanged(auth, callback);
};

export const createUserProfile = async (
    firebaseUser: FirebaseUser, 
    name: string, 
    gender: 'male' | 'female', 
    avatar: AvatarProps
): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const userRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = {
        uid: firebaseUser.uid,
        name,
        gender,
        avatar,
    };
    await setDoc(userRef, newUser);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
    if (!db) return null;
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as User;
    }
    return null;
};

export const updateUserProfile = async (uid: string, profileData: Partial<User>): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, profileData);
};

// --- Ship Functions ---

export const createShip = async (user: User, shipName: string, initialMissionId: string): Promise<Ship> => {
    if (!db) throw new Error("Firebase not configured");
    const newShipRef = doc(collection(db, "ships"));
    const newShip: Ship = {
        id: newShipRef.id,
        name: shipName,
        captainId: user.uid,
        crew: [user.uid],
        currentMissionId: initialMissionId,
        conversationHistory: [],
        logEntries: [],
        playerAssets: [],
    };
    
    const userRef = doc(db, "users", user.uid);
    
    const batch = writeBatch(db);
    batch.set(newShipRef, newShip);
    batch.update(userRef, { currentShipId: newShip.id });
    
    await batch.commit();
    
    return newShip;
};

export const joinShip = async (user: User, shipId: string): Promise<Ship | null> => {
    if (!db) throw new Error("Firebase not configured");
    const shipRef = doc(db, "ships", shipId);
    const userRef = doc(db, "users", user.uid);

    const shipDoc = await getDoc(shipRef);
    if (!shipDoc.exists()) {
        throw new Error("Gemi bulunamadı.");
    }

    const batch = writeBatch(db);
    batch.update(shipRef, {
        crew: arrayUnion(user.uid)
    });
    batch.update(userRef, { currentShipId: shipId });

    await batch.commit();
    
    const updatedShipDoc = await getDoc(shipRef);
    return updatedShipDoc.data() as Ship;
};

export const getShip = async (shipId: string): Promise<Ship | null> => {
    if (!db) return null;
    const shipRef = doc(db, "ships", shipId);
    const docSnap = await getDoc(shipRef);
    return docSnap.exists() ? docSnap.data() as Ship : null;
};

// --- Game State Functions ---

export const saveConversationHistory = async (shipId: string, history: {role: 'user' | 'model', content: string}[]) => {
    if (!db) throw new Error("Firebase not configured");
    const shipRef = doc(db, "ships", shipId);
    await updateDoc(shipRef, { conversationHistory: history });
};

export const saveLogEntry = async (shipId: string, author: string, content: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const logCollectionRef = collection(db, "ships", shipId, "logEntries");
    await addDoc(logCollectionRef, {
        author,
        content,
        timestamp: serverTimestamp()
    });
};

export const listenToLogEntries = (shipId: string, callback: (entries: CaptainLogEntry[]) => void): Unsubscribe => {
    if (!db) return () => {};
    const logCollectionRef = collection(db, "ships", shipId, "logEntries");
    const q = query(logCollectionRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, (querySnapshot) => {
        const entries: CaptainLogEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toMillis() || Date.now()
            } as CaptainLogEntry);
        });
        callback(entries);
    });
};

export const savePlayerAsset = async (shipId: string, author: string, asset: Omit<PlayerAsset, 'id' | 'timestamp' | 'author'>): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const assetCollectionRef = collection(db, "ships", shipId, "playerAssets");
    await addDoc(assetCollectionRef, {
        ...asset,
        author,
        timestamp: serverTimestamp()
    });
};

export const listenToPlayerAssets = (shipId: string, callback: (assets: PlayerAsset[]) => void): Unsubscribe => {
    if (!db) return () => {};
    const assetCollectionRef = collection(db, "ships", shipId, "playerAssets");
    const q = query(assetCollectionRef, orderBy("timestamp", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const assets: PlayerAsset[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            assets.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toMillis() || Date.now()
            } as PlayerAsset);
        });
        callback(assets);
    });
};


// --- Mission Admin Functions ---

export const getMissions = async (): Promise<MissionStep[]> => {
    if (!db) return [];
    const missionsCollection = collection(db, "missions");
    const missionSnapshot = await getDocs(missionsCollection);
    const missionList = missionSnapshot.docs.map(doc => doc.data() as MissionStep);
    return missionList;
};

export const saveMission = async (mission: MissionStep): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const missionRef = doc(db, "missions", mission.id);
    await setDoc(missionRef, mission, { merge: true });
};

export const deleteMission = async (missionId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const missionRef = doc(db, "missions", missionId);
    await deleteDoc(missionRef);
};

export const seedMissions = async (missions: MissionStep[]): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const batch = writeBatch(db);
    const missionsCollection = collection(db, "missions");
    
    const existingMissions = await getDocs(missionsCollection);
    existingMissions.forEach(doc => batch.delete(doc.ref));

    missions.forEach((mission) => {
        const docRef = doc(db, "missions", mission.id);
        batch.set(docRef, mission);
    });
    
    await batch.commit();
};