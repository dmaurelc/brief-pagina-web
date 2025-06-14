
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminRole = () => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Verificando rol de admin para:', user.emailAddresses[0].emailAddress);
        
        const { data, error } = await supabase.rpc('has_role_by_email', {
          _email: user.emailAddresses[0].emailAddress,
          _role: 'admin'
        });

        if (error) {
          console.error('Error verificando rol de admin:', error);
          setIsAdmin(false);
        } else {
          console.log('Resultado verificación admin:', data);
          setIsAdmin(data);
        }
      } catch (error) {
        console.error('Error verificando rol de admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      checkAdminRole();
    } else if (isLoaded && !user) {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, isLoaded]);

  return {
    isAdmin,
    loading: loading || !isLoaded,
    user
  };
};
