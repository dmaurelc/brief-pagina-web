
import { ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';

interface UserSyncProviderProps {
  children: ReactNode;
}

const UserSyncProvider = ({ children }: UserSyncProviderProps) => {
  const { isSignedIn, isLoaded } = useUser();

  // Mostrar loading solo si Clerk no ha terminado de cargar
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // En todos los demás casos, mostrar la aplicación normalmente
  return <>{children}</>;
};

export default UserSyncProvider;
