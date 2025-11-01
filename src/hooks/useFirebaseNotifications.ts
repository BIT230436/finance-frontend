import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { initFirebase, requestNotificationPermission } from '../services/firebaseService';

/**
 * Hook to initialize Firebase and request notification permission
 * This should be called once when user logs in
 */
export const useFirebaseNotifications = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize Firebase
      initFirebase();

      // Request notification permission
      requestNotificationPermission()
        .then((token) => {
          if (token) {
            console.log('FCM Token:', token);
            // TODO: Send token to backend to register for notifications
            // Example: api.post('/notifications/register', { userId: user.id, fcmToken: token });
          }
        })
        .catch((error) => {
          console.error('Error requesting notification permission:', error);
        });
    }
  }, [isAuthenticated, user]);
};

