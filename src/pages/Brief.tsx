import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BriefForm from "@/components/BriefForm";

const Brief = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !user) {
      navigate("/");
    }
  }, [user, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-accent-700">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-foreground mb-4">
            Solicitud de presupuesto web
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Completa este formulario para conocer tus requerimientos y poder
            generar una propuesta a medida. Tus datos se guardan automáticamente
            para que puedas continuar en cualquier momento.
          </p>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <BriefForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>
              &copy; 2025 Brief Página Web - Generador de presupuestos web
              personalizados por DMaurel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Brief;
