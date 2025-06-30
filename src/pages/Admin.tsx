import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import BriefEditModal from "@/components/BriefEditModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import {
  getBudgetLabel,
  getTimelineLabel,
  getProjectTypeLabel,
  getIndustryLabel,
  getStatusLabel
} from "@/utils/labelMappers";

type Brief = Tables<"briefs">;

const Admin = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setIsAdmin(false);
        setAdminCheckLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("check_admin_role_safe", {
          _email: user.emailAddresses[0].emailAddress,
        });

        if (error) {
          console.error("Error verificando rol de admin:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error("Error verificando rol de admin:", error);
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    if (isLoaded && user) {
      checkAdminRole();
    } else if (isLoaded && !user) {
      setIsAdmin(false);
      setAdminCheckLoading(false);
    }
  }, [user, isLoaded]);

  // Fetch all briefs
  const {
    data: briefs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-briefs"],
    queryFn: async () => {
      console.log("Fetching briefs...");
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching briefs:", error);
        throw error;
      }

      console.log("Briefs fetched:", data?.length);
      return data;
    },
    enabled: isAdmin === true, // Solo ejecutar si el usuario es admin
  });

  const handleEditBrief = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsEditModalOpen(true);
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "in_review":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "quote_sent":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mostrar loading mientras se verifica autenticación y roles
  if (!isLoaded || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para acceder al panel de administración.
              </p>
              <Button
                onClick={() => navigate("/auth/sign-in")}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar error si no es administrador
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground mb-4">
                No tienes permisos de administrador para acceder a esta página.
              </p>
              <div className="text-sm text-muted-foreground mb-4">
                Usuario: {user.emailAddresses?.[0]?.emailAddress}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando presupuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Error al cargar los presupuestos
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-700">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los presupuestos enviados
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              Administrador: {user.emailAddresses?.[0]?.emailAddress}
            </span>
          </div>
        </div>

        {briefs && briefs.length > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se encontraron {briefs.length} presupuesto(s) en la base de datos.
              La integración Clerk + Supabase está funcionando correctamente.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Presupuestos Recibidos</CardTitle>
            <CardDescription>
              Total de presupuestos: {briefs?.length || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {briefs && briefs.length > 0 ? (
                briefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {brief.company_name}
                          </h3>
                          <Badge 
                            variant="outline"
                            className={getStatusBadgeColor(brief.status)}
                          >
                            {getStatusLabel(brief.status || "pending")}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Contacto:</span>{" "}
                            {brief.contact_name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {brief.email}
                          </div>
                          <div>
                            <span className="font-medium">Industria:</span>{" "}
                            {getIndustryLabel(brief.industry)}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span>{" "}
                            {getProjectTypeLabel(brief.project_type)}
                          </div>
                          <div>
                            <span className="font-medium">Presupuesto:</span>{" "}
                            {getBudgetLabel(brief.budget)}
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span>{" "}
                            {getTimelineLabel(brief.timeline)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Enviado:</span>{" "}
                          {formatDate(brief.created_at)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEditBrief(brief)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay presupuestos enviados aún.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedBrief && (
          <BriefEditModal
            brief={selectedBrief}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBrief(null);
            }}
            onBriefUpdated={() => {
              refetch();
            }}
          />
        )}
      </div>

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

export default Admin;
