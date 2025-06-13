
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import BriefForm from '@/components/BriefForm';
import { Link } from 'react-router-dom';
import { FileText, Settings, User, Crown } from 'lucide-react';

const Index = () => {
  const { isAdmin, isLoaded, isLoadingRole } = useAuth();

  if (!isLoaded || isLoadingRole) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-700">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-dmaurel-white.svg" 
                alt="DMaurel - Desarrollo Web Profesional" 
                className="w-32 h-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Brief Página Web
              </div>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <Link to="/mi-cuenta">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Mi Cuenta</span>
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard">
                      <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <Crown className="w-4 h-4" />
                        <span>Admin</span>
                      </Button>
                    </Link>
                  )}
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-foreground mb-4">
            Solicitud de presupuesto web
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Completa este formulario para conocer tus requerimientos y poder generar una propuesta a medida. Tus datos se guardan automáticamente para que puedas continuar en cualquier momento.
          </p>
        </div>

        {/* Authentication Wall */}
        <SignedOut>
          <div className="max-w-md mx-auto bg-card rounded-lg p-8 shadow-lg text-center">
            <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Inicia sesión para continuar
            </h2>
            <p className="text-muted-foreground mb-6">
              Para crear tu solicitud de presupuesto, necesitas tener una cuenta. Es rápido y gratuito.
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">
                Iniciar Sesión / Registrarse
              </Button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Form for authenticated users */}
        <SignedIn>
          <div className="flex justify-center">
            <BriefForm />
          </div>
        </SignedIn>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Brief Página Web - Generador de presupuestos web personalizados por DMaurel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
