
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  update,
  increment,
  get,
  child 
} from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsts8pItIBEA9AIPlhjSy4qOEfAh9rnsY",
  authDomain: "media-sync-app.firebaseapp.com",
  projectId: "media-sync-app",
  storageBucket: "media-sync-app.appspot.com",
  messagingSenderId: "58997809836",
  appId: "1:58997809836:web:3c2ef9dc4cb42dacb4659d",
  measurementId: "G-YJNRV88SHE",
  databaseURL: "https://media-sync-app-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Auth functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Media functions
export const uploadMedia = async (file: File, userId: string, type: string) => {
  const fileRef = storageRef(storage, `media/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  
  const mediaRef = ref(db, 'media');
  const newMediaRef = push(mediaRef);
  
  const media = {
    id: newMediaRef.key,
    url: downloadURL,
    type,
    userId,
    name: file.name,
    uploadTime: Date.now(),
    interactions: 0,
    active: false
  };
  
  await set(newMediaRef, media);
  return media;
};

export const syncMedia = async (mediaId: string | null, userId: string) => {
  if (!mediaId) {
    // Clear active media
    await set(ref(db, 'activeMedia'), null);
    return;
  }
  
  const mediaRef = ref(db, `media/${mediaId}`);
  const mediaSnapshot = await get(mediaRef);
  
  if (!mediaSnapshot.exists()) {
    throw new Error("Media not found");
  }
  
  const media = mediaSnapshot.val();
  
  // Set as active media
  await set(ref(db, 'activeMedia'), {
    ...media,
    activatedBy: userId,
    activatedAt: Date.now()
  });
  
  return media;
};

export const trackInteraction = async (mediaId: string) => {
  const mediaRef = ref(db, `media/${mediaId}`);
  
  // Increment the interactions count
  await update(mediaRef, {
    interactions: increment(1)
  });
};

// Listen to active media changes
export const onActiveMediaChange = (callback: (media: any) => void) => {
  const activeMediaRef = ref(db, 'activeMedia');
  return onValue(activeMediaRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const onMediaListChange = (callback: (media: any[]) => void) => {
  const mediaRef = ref(db, 'media');
  return onValue(mediaRef, (snapshot) => {
    const data = snapshot.val();
    const mediaList = data ? Object.values(data) : [];
    callback(mediaList as any[]);
  });
};

export {
  auth,
  db,
  storage,
  onAuthStateChanged
};
