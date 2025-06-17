
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
        console.log('🔄 Sincronizando usuario:', userEmail);
        
        // Primero verificar si el usuario ya existe
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userEmail)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('❌ Error verificando usuario existente:', checkError);
          setSyncStatus('error');
          return;
        }

        if (existingRole) {
          console.log('✅ Usuario ya sincronizado');
          setSyncStatus('success');
          return;
        }

        // Si no existe, crear el usuario usando la función SECURITY DEFINER
        console.log('➕ Creando nuevo usuario...');
        const { error: ensureRoleError } = await supabase.rpc('ensure_user_role', {
          _email: userEmail
        });

        if (ensureRoleError) {
          console.error('❌ Error asegurando rol de usuario:', ensureRoleError);
          setSyncStatus('error');
          return;
        }

        console.log('✅ Usuario sincronizado exitosamente');
        setSyncStatus('success');
      } catch (error) {
        console.error('💥 Error en sincronización de usuario:', error);
        setSyncStatus('error');
      }
    };

    syncUserRole();
  }, [user?.emailAddresses?.[0]?.emailAddress, isLoaded]);

  // Resetear el estado de sincronización si hay un error para permitir reintentos
  useEffect(() => {
    if (syncStatus === 'error') {
      const timer = setTimeout(() => {
        console.log('🔄 Reintentando sincronización...');
        hasAttemptedSync.current = false;
        setSyncStatus('idle');
      }, 5000); // Reintentar después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const isUserSynced = syncStatus === 'success';
  
  // Log para debugging del botón
  if (!isUserSynced) {
    console.log('⚠️ Usuario no sincronizado - Estado del botón:', {
      syncStatus,
      isUserSynced,
      userEmail: user?.emailAddresses?.[0]?.emailAddress
    });
  }

  return {
    syncStatus,
    isUserSynced
  };
};
