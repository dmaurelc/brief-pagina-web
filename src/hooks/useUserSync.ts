
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
        console.log('Verificando si el usuario tiene rol en Supabase:', userEmail);
        
        // Verificar si el usuario ya tiene un rol
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userEmail)
          .maybeSingle();

        if (checkError) {
          console.error('Error verificando rol existente:', checkError);
          setSyncStatus('error');
          return;
        }

        if (!existingRole) {
          console.log('Usuario no tiene rol, creando rol de usuario...');
          
          // Crear rol de usuario por defecto
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userEmail,
              role: 'user'
            });

          if (insertError) {
            console.error('Error creando rol de usuario:', insertError);
            setSyncStatus('error');
            return;
          }

          console.log('Rol de usuario creado exitosamente');
        } else {
          console.log('Usuario ya tiene rol:', existingRole.role);
        }

        setSyncStatus('success');
      } catch (error) {
        console.error('Error en sincronización de usuario:', error);
        setSyncStatus('error');
      }
    };

    syncUserRole();
  }, [user, isLoaded]);

  return {
    syncStatus,
    isUserSynced: syncStatus === 'success'
  };
};
