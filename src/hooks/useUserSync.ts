
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

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

      const userEmail = user.emailAddresses[0].emailAddress;
      hasAttemptedSync.current = true;
      setSyncStatus('syncing');

      try {
        // Intentar crear el rol usando la función SECURITY DEFINER
        const { error: ensureRoleError } = await supabase.rpc('ensure_user_role', {
          _email: userEmail
        });

        if (ensureRoleError) {
          console.error('Error asegurando rol de usuario:', ensureRoleError);
          // No marcar como error si falla, solo log
          setSyncStatus('success');
        } else {
          setSyncStatus('success');
        }

      } catch (error) {
        console.error('Error en sincronización de usuario:', error);
        // No bloquear al usuario por errores de sincronización
        setSyncStatus('success');
      }
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
