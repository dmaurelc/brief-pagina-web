
import { ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useUserSync } from '@/hooks/useUserSync';

interface UserSyncProviderProps {
  children: ReactNode;
}

const UserSyncProvider = ({ children }: UserSyncProviderProps) => {
  const { isSignedIn } = useUser();
  const { syncStatus } = useUserSync();

  // Si el usuario está autenticado pero aún se está sincronizando, mostrar loading
  if (isSignedIn && syncStatus === 'syncing') {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sincronizando usuario...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserSyncProvider;
