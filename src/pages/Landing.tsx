
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
                  <Button 
                    onClick={() => navigate('/auth/sign-up')} 
                    size="sm"
                  >
                    Registrarse
                  </Button>
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
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => navigate('/auth/sign-up')}
              >
                Crear Cuenta
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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

        {/* Process */}
        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Completa el Brief",
                description: "Cuéntanos sobre tu proyecto, objetivos y requerimientos específicos"
              },
              {
                step: "2",
                title: "Análisis Profesional",
                description: "Analizamos tu solicitud y preparamos una propuesta personalizada"
              },
              {
                step: "3",
                title: "Recibe tu Propuesta",
                description: "Te enviamos una cotización detallada con cronograma y presupuesto"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para comenzar tu proyecto web?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Miles de empresas ya han confiado en nosotros para sus proyectos digitales
          </p>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-3">
                Solicitar Presupuesto Gratis
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/brief')}
            >
              Solicitar Presupuesto Gratis
            </Button>
          </SignedIn>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Brief Página Web - Generador de presupuestos web personalizados por DMaurel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
