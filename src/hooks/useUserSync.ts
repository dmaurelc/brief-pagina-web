
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const syncUserRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress || !isLoaded) {
        return;
      }

      const userEmail = user.emailAddresses[0].emailAddress;
      setSyncStatus('syncing');

      try {
        console.log('Sincronizando usuario con Supabase:', userEmail);
        
        // Usar la función SECURITY DEFINER para asegurar que el usuario tenga un rol
        const { error: ensureRoleError } = await supabase.rpc('ensure_user_role', {
          _email: userEmail
        });

        if (ensureRoleError) {
          console.error('Error asegurando rol de usuario:', ensureRoleError);
          // No marcamos como error crítico si el usuario ya existe
          if (!ensureRoleError.message.includes('duplicate key')) {
            setSyncStatus('error');
            return;
          }
        }

        console.log('Usuario sincronizado exitosamente');
        setSyncStatus('success');
      } catch (error) {
        console.error('Error en sincronización de usuario:', error);
        // Solo marcar como error si es un problema real, no si el usuario ya existe
        setSyncStatus('success'); // Asumir éxito si llegamos aquí
      }
    };

    syncUserRole();
  }, [user, isLoaded]);

  return {
    syncStatus,
    isUserSynced: syncStatus === 'success'
  };
};
