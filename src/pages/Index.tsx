
import BriefForm from '@/components/BriefForm';
import { Globe } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                  src="https://www.dmaurel.cl/wp-content/uploads/2024/10/logo-dmaurel-dark.svg" 
                  alt="DMaurel Logo" 
                  className="w-24 h-auto"
                />
              <h1 className="text-2xl font-bold text-foreground">Brief Página Web</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Formulario para generar presupuesto
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Solicitud de presupuesto web
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Completa este formulario para conocer tus requerimientos y poder generar una propuesta a medida. Tus datos se guardan automáticamente para que puedas continuar en cualquier momento.
          </p>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <BriefForm />
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Análisis Personalizado</h3>
            <p className="text-muted-foreground">
              Tu información será analizada para generar un presupuesto específico para tu proyecto
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Progreso Guardado</h3>
            <p className="text-muted-foreground">
              Tus datos se guardan automáticamente, continúa cuando quieras
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Respuesta Rápida</h3>
            <p className="text-muted-foreground">
              Generaré tu presupuesto personalizado en menos de 24 horas
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Brief Página Web - Generador de presupuestos web personalizados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
