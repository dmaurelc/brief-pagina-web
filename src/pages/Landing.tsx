import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Users, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useAdminRole } from '@/hooks/useAdminRole';

const Landing = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAdminRole();

  // Redirección inteligente para usuarios autenticados
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/brief');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-dmaurel-white.svg" 
                alt="DMaurel - Desarrollo Web Profesional" 
                className="w-32 h-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm">
                      Iniciar Sesión
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button size="sm">
                      Comenzar Ahora
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <Button onClick={() => navigate('/my-account')} variant="outline" size="sm">
                  Mi Cuenta
                </Button>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Presupuestos Web <span className="text-primary">Profesionales</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Obtén una cotización detallada y personalizada para tu proyecto web. 
            Completa nuestro brief en minutos y recibe una propuesta profesional adaptada a tus necesidades.
          </p>

          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-3">
                  Comenzar Ahora
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                >
                  Comenzar Ahora
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/brief')}
            >
              Solicitar Presupuesto
            </Button>
          </SignedIn>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Zap className="w-8 h-8 text-primary" />,
              title: "Rápido y Eficiente",
              description: "Completa el brief en 5 minutos y recibe tu propuesta en 24-48 horas"
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: "Experiencia Profesional",
              description: "Más de 10 años desarrollando soluciones web para empresas"
            },
            {
              icon: <CheckCircle className="w-8 h-8 text-primary" />,
              title: "Propuesta Detallada",
              description: "Cotización completa con cronograma, funcionalidades y costos"
            },
            {
              icon: <Clock className="w-8 h-8 text-primary" />,
              title: "Sin Compromiso",
              description: "Recibe tu presupuesto sin costo y sin obligaciones"
            }
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
