
import { useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();

  // Query para obtener el rol del usuario
  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.log('User role not found, will be created on first brief submission');
        return 'user';
      }
      
      return data?.role || 'user';
    },
    enabled: !!user?.id && isSignedIn,
  });

  // Mutación para crear el primer admin
  const createFirstAdmin = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found');
      
      const { error } = await supabase.rpc('create_first_admin', {
        _user_id: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
    },
  });

  // Función para verificar si el usuario es admin
  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  return {
    user,
    isSignedIn,
    isLoaded,
    userRole,
    isLoadingRole,
    isAdmin,
    isUser,
    createFirstAdmin: createFirstAdmin.mutate,
    isCreatingAdmin: createFirstAdmin.isPending,
  };
};
