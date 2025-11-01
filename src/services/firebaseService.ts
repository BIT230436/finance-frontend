// Firebase Cloud Messaging Service (Optional)
// This service is for future notification features

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';

let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from Firebase Console
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const initFirebase = (): void => {
  if (getApps().length === 0 && firebaseConfig.apiKey) {
    try {
      app = initializeApp(firebaseConfig);
      if ('serviceWorker' in navigator) {
        messaging = getMessaging(app);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export default {
  initFirebase,
  requestNotificationPermission,
};

