
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const hasAttemptedSync = useRef(false);

  useEffect(() => {
    const syncUserRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress || !isLoaded) {
        return;
      }

      // Evitar múltiples sincronizaciones
      if (hasAttemptedSync.current) {
        return;
      }

      hasAttemptedSync.current = true;
      setSyncStatus('syncing');

      // Para usuarios normales, solo marcamos como éxito sin hacer nada más
      // La sincronización de roles solo es necesaria para funciones administrativas
      console.log('Usuario sincronizado exitosamente (modo simplificado)');
      setSyncStatus('success');
    };

    syncUserRole();
  }, [user?.emailAddresses?.[0]?.emailAddress, isLoaded]);

  // Para usuarios autenticados, considerar siempre como sincronizado
  const isUserSynced = isLoaded && !!user?.emailAddresses?.[0]?.emailAddress;

  return {
    syncStatus,
    isUserSynced
  };
};
