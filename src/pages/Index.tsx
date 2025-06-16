
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import Landing from './Landing';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { isAdmin, loading } = useAdminRole();

  useEffect(() => {
    if (!isLoaded || loading) return;

    // Si el usuario está autenticado, redirigir según su rol
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/brief');
      }
    }
    // Si no está autenticado, mostrar la landing page (no redirigir)
  }, [user, isAdmin, loading, isLoaded, navigate]);

  // Mientras carga, mostrar el spinner
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la landing page
  if (!user) {
    return <Landing />;
  }

  // Si está autenticado pero aún está procesando la redirección
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default Index;
