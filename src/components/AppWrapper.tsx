import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Initialize Firebase notifications when authenticated
  useFirebaseNotifications();

  return <>{children}</>;
};

export default AppWrapper;

