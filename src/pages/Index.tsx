
import Header from '@/components/Header';
import BriefForm from '@/components/BriefForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-accent-700">
      <Header />

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

        {/* Form */}
        <div className="flex justify-center">
          <BriefForm />
        </div>
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
