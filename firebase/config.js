import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuqmMLtJyM30xaI7CbIyK_DiR0WqI_bBA",
  authDomain: "instractur-app.firebaseapp.com",
  projectId: "instractur-app",
  storageBucket: "instractur-app.appspot.com",
  messagingSenderId: "105009305765",
  appId: "1:105009305765:web:e8c8bcb1d9c0991f67d54c"
};

// Initialize Firebase only if not already initialized
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with AsyncStorage for persistence
export const FIREBASE_AUTH = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
