import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import ProposalDownloadButton from "@/components/ProposalDownloadButton";
import { getBudgetLabel, getTimelineLabel, getProjectTypeLabel, getIndustryLabel } from "@/utils/labelMappers";

type Brief = Tables<"briefs">;
type Proposal = Tables<"proposals">;

// Actualizamos la interfaz para manejar correctamente los tipos de Supabase
interface BriefWithProposals extends Brief {
  proposals: Proposal[];
}

const MyAccount = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  // Fetch user's briefs with proposals
  const { data: userBriefs, isLoading } = useQuery({
    queryKey: ["user-briefs-with-proposals", user?.emailAddresses?.[0]?.emailAddress],
    queryFn: async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.log('❌ No hay email de usuario disponible');
        return [];
      }

      console.log('🔍 Buscando briefs para email:', user.emailAddresses[0].emailAddress);

      const { data, error } = await supabase
        .from("briefs")
        .select(`
          *,
          proposals!proposals_brief_id_fkey (*)
        `)
        .eq("email", user.emailAddresses[0].emailAddress)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('❌ Error fetching briefs:', error);
        throw error;
      }
      
      console.log('📊 Briefs obtenidos desde Supabase:', data);
      console.log('📊 Número de briefs encontrados:', data?.length || 0);
      
      // Log cada brief individualmente para debug
      data?.forEach((brief, index) => {
        console.log(`📝 Brief ${index + 1}:`, {
          id: brief.id,
          company_name: brief.company_name,
          email: brief.email,
          status: brief.status,
          proposals: brief.proposals
        });
      });
      
      // Transformamos los datos para asegurar que proposals siempre sea un array
      const transformedData = data?.map(brief => ({
        ...brief,
        proposals: Array.isArray(brief.proposals) ? brief.proposals : []
      })) || [];
      
      return transformedData as BriefWithProposals[];
    },  
    enabled: !!user?.emailAddresses?.[0]?.emailAddress && isLoaded,
  });

  // Fetch all briefs for admin overview
  const { data: allBriefs } = useQuery({
    queryKey: ["admin-briefs-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "in_review":
        return "bg-blue-500 text-white";
      case "quote_sent":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-purple-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_review":
        return "En Proceso";
      case "quote_sent":
        return "Propuesta Enviada";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendiente";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_review":
        return <AlertCircle className="w-4 h-4" />;
      case "quote_sent":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isLoaded || adminLoading) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para acceder a tu cuenta.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Ir al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Log para debug - mostrar el estado actual
  console.log('🎯 Estado actual MyAccount:', {
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    isLoading,
    userBriefsCount: userBriefs?.length || 0,
    userBriefs: userBriefs
  });

  return (
    <div className="min-h-screen bg-accent-700">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mi Cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu perfil y revisa tus presupuestos
          </p>
          <div className="flex items-center gap-2 mt-2">
            {isAdmin ? (
              <>
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Administrador</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Usuario</span>
              </>
            )}
            <span className="text-sm text-muted-foreground">
              {user.emailAddresses?.[0]?.emailAddress}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {user.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de cuenta
                  </p>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <>
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          Administrador
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-600">
                          Usuario
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Briefs Section */}
          <div className="lg:col-span-8">
            {isAdmin ? (
              /* Admin View */
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Resumen de Administrador
                    </CardTitle>
                    <CardDescription>
                      Últimos presupuestos recibidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allBriefs && allBriefs.length > 0 ? (
                      <div className="space-y-4">
                        {allBriefs.map((brief) => (
                          <div key={brief.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">
                                {brief.company_name}
                              </h3>
                              <Badge
                                className={getStatusBadgeColor(brief.status)}
                              >
                                {getStatusLabel(brief.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {brief.contact_name} • {brief.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(brief.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No hay presupuestos recientes
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* User View */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Mis Presupuestos y Propuestas
                  </CardTitle>
                  <CardDescription>
                    Revisa el estado de tus solicitudes y accede a las propuestas enviadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Cargando presupuestos...
                      </p>
                    </div>
                  ) : userBriefs && userBriefs.length > 0 ? (
                    <div className="space-y-4">
                      {userBriefs.map((brief) => {
                        // Get the first proposal for this brief (if any)
                        const proposal = brief.proposals && brief.proposals.length > 0 
                          ? brief.proposals[0] 
                          : null;
                          
                        console.log(`💼 Procesando brief ${brief.company_name}:`, {
                          briefId: brief.id,
                          proposalsArray: brief.proposals,
                          hasProposal: !!proposal,
                          proposalData: proposal
                        });

                        return (
                          <div key={brief.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {brief.company_name}
                                </h3>
                                <p className="text-muted-foreground">
                                  {getProjectTypeLabel(brief.project_type)}
                                </p>
                              </div>
                              <Badge
                                className={getStatusBadgeColor(brief.status)}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(brief.status)}
                                  {getStatusLabel(brief.status)}
                                </div>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium">Presupuesto:</span>{" "}
                                {getBudgetLabel(brief.budget)}
                              </div>
                              <div>
                                <span className="font-medium">Timeline:</span>{" "}
                                {getTimelineLabel(brief.timeline)}
                              </div>
                              <div>
                                <span className="font-medium">Industria:</span>{" "}
                                {getIndustryLabel(brief.industry)}
                              </div>
                              <div>
                                <span className="font-medium">Enviado:</span>{" "}
                                {formatDate(brief.created_at)}
                              </div>
                            </div>

                            {/* Propuesta disponible */}
                            {proposal && (
                              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                      <Download className="w-4 h-4" />
                                      Propuesta Lista
                                    </h4>
                                    <p className="text-sm text-green-700 mt-1">
                                      Enviada el {formatDate(proposal.email_sent_at || proposal.uploaded_at)}
                                    </p>
                                    {proposal.client_message && (
                                      <p className="text-sm text-green-700 mt-2 font-medium">
                                        "{proposal.client_message}"
                                      </p>
                                    )}
                                  </div>
                                  <ProposalDownloadButton
                                    proposalId={proposal.id}
                                    fileName={proposal.file_name}
                                    filePath={proposal.file_path}
                                    companyName={brief.company_name}
                                  />
                                </div>
                              </div>
                            )}

                            {brief.status === "quote_sent" && !proposal && (
                              <Alert className="mt-3">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                  ¡Tu propuesta está lista! La propuesta debería estar disponible pronto para descarga.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No tienes presupuestos aún
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        ¡Solicita tu primer presupuesto para comenzar!
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Email actual: {user.emailAddresses?.[0]?.emailAddress}
                      </p>
                      <Button onClick={() => navigate("/brief")}>
                        Solicitar Presupuesto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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

export default MyAccount;
