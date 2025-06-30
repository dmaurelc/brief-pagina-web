import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Shield,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  Send,
  MoreVertical,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import BriefEditModal from "@/components/BriefEditModal";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";

type Brief = Tables<"briefs">;

// Configuración de estados disponibles
const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: Clock },
  in_review: { label: "En Proceso", color: "bg-blue-500", icon: FileText },
  quote_sent: { label: "Propuesta Enviada", color: "bg-green-500", icon: Send },
  completed: { label: "Completado", color: "bg-purple-500", icon: CheckCircle },
} as const;

// Componente para columnas como zonas de drop
const DroppableColumn = ({
  id,
  title,
  icon,
  color,
  headerColor,
  count,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  headerColor: string;
  count: number;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <Card
      ref={setNodeRef}
      className={`${color} min-h-[600px] border-2 border-dashed transition-colors ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      <CardHeader className={`${headerColor} text-white rounded-t-lg`}>
        <CardTitle className="flex items-center gap-2 text-white">
          {icon}
          {title}
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30"
          >
            {count}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">{children}</CardContent>
    </Card>
  );
};

// Componente mejorado para tarjetas drag-and-drop con método alternativo
const DraggableBriefCard = ({
  brief,
  onEditBrief,
  onStatusChange,
}: {
  brief: Brief;
  onEditBrief: (brief: Brief) => void;
  onStatusChange: (briefId: string, newStatus: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: brief.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const currentStatus = brief.status || "pending";
  const availableStatuses = Object.entries(STATUS_CONFIG).filter(
    ([status]) => status !== currentStatus
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-accent-900 border-accent-700 hover:bg-accent-800 transition-all cursor-grab ${
        isDragging ? "opacity-50 rotate-1 shadow-lg" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm text-foreground flex-1">
              {brief.company_name}
            </h3>

            {/* Dropdown para cambio de estado - Método alternativo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-accent-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBrief(brief);
                  }}
                  className="cursor-pointer hover:bg-accent"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  Editar Presupuesto
                </DropdownMenuItem>
                {availableStatuses.map(([status, config]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(brief.id, status);
                    }}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <config.icon className="w-3 h-3 mr-2" />
                    Cambiar a {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground">{brief.contact_name}</p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {formatDate(brief.created_at)}
            </span>
            <div className="flex gap-1">
              {brief.proposal_id && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <Upload className="w-2 h-2 mr-1" />
                  Propuesta
                </Badge>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBrief(brief);
                }}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-accent-800 border-accent-600 hover:bg-accent-700"
              >
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Tipo:</span>{" "}
            {brief.project_type || "No especificado"}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Presupuesto:</span> {brief.budget}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragInProgress, setIsDragInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setIsAdmin(false);
        setAdminCheckLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("has_role_by_email", {
          _email: user.emailAddresses[0].emailAddress,
          _role: "admin",
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
      console.log("🔄 Fetching briefs from database...");
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching briefs:", error);
        throw error;
      }

      console.log("✅ Briefs fetched successfully:", data?.length, "briefs");
      console.log("📊 Brief statuses:", data?.map(b => ({ id: b.id.slice(0, 8), company: b.company_name, status: b.status })));
      return data;
    },
    enabled: isAdmin === true,
  });

  // Categorizar briefs por estado con useMemo para optimización
  const categorizedBriefs = useMemo(() => {
    if (!briefs) return null;

    const categorized = {
      pending: briefs.filter((b) => !b.status || b.status === "pending"),
      in_review: briefs.filter((b) => b.status === "in_review"),
      quote_sent: briefs.filter((b) => b.status === "quote_sent"),
      completed: briefs.filter((b) => b.status === "completed"),
    };

    console.log("🔄 BRIEFS RECATEGORIZADOS:");
    console.log("  - Pendientes:", categorized.pending.length);
    console.log("  - En proceso:", categorized.in_review.length);
    console.log("  - Propuestas enviadas:", categorized.quote_sent.length);
    console.log("  - Completados:", categorized.completed.length);

    return categorized;
  }, [briefs]);

  const updateBriefStatusMutation = useMutation({
    mutationFn: async ({
      briefId,
      newStatus,
    }: {
      briefId: string;
      newStatus: string;
    }) => {
      console.log("🚀 INICIANDO ACTUALIZACIÓN DE ESTADO:");
      console.log("  - Brief ID:", briefId.slice(0, 8));
      console.log("  - Nuevo estado:", newStatus);

      const currentBrief = briefs?.find((b) => b.id === briefId);
      if (!currentBrief) {
        throw new Error(`Brief no encontrado: ${briefId}`);
      }

      console.log("  - Brief actual:", currentBrief.company_name);
      console.log("  - Estado actual:", currentBrief.status);

      const validStatuses = ["pending", "in_review", "quote_sent", "completed"];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Estado inválido: ${newStatus}`);
      }

      console.log("🔄 Enviando actualización a Supabase...");
      const { error, data } = await supabase
        .from("briefs")
        .update({
          status: newStatus as any,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", briefId)
        .select();

      if (error) {
        console.error("❌ Error en Supabase:", error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log("✅ Actualización completada en BD:", data);
      console.log("📊 Datos actualizados:", data?.[0]);

      return { briefId, newStatus, company_name: currentBrief.company_name, updatedData: data?.[0] };
    },
    onError: (error) => {
      console.error("❌ ERROR EN MUTACIÓN:", error);
      setIsDragInProgress(false);

      toast({
        title: "❌ Error al actualizar estado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
    onSuccess: async (data) => {
      console.log("✅ MUTACIÓN EXITOSA:", data);
      console.log("🔄 Invalidando queries para forzar re-render...");

      // Invalidar y refetch para asegurar datos actualizados
      await queryClient.invalidateQueries({ queryKey: ["admin-briefs"] });
      await refetch();
      
      setIsDragInProgress(false);
      
      toast({
        title: "✅ Estado actualizado",
        description: `"${data.company_name}" cambió a "${
          STATUS_CONFIG[data.newStatus as keyof typeof STATUS_CONFIG]?.label
        }".`,
      });

      console.log("🎉 Proceso completado exitosamente");
      console.log("📋 Verificando estado actual después de la actualización...");
      
      // Verificar el estado después de la actualización
      setTimeout(async () => {
        const { data: verifyData } = await supabase
          .from("briefs")
          .select("id, company_name, status")
          .eq("id", data.briefId)
          .single();
        
        console.log("🔍 Verificación post-actualización:", verifyData);
      }, 1000);
    },
  });

  // Función para manejar cambio de estado por dropdown
  const handleStatusChange = (briefId: string, newStatus: string) => {
    console.log("🔄 CAMBIO POR DROPDOWN:", { briefId: briefId.slice(0, 8), newStatus });
    setIsDragInProgress(true);
    updateBriefStatusMutation.mutate({ briefId, newStatus });
  };

  const handleEditBrief = (brief: Brief) => {
    setEditingBrief(brief);
    setIsEditModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragInProgress(true);
    console.log("🎯 DRAG INICIADO:", event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log("🎯 DRAG TERMINADO:");
    console.log("  - Brief ID:", active.id);
    console.log("  - Columna destino:", over?.id);

    if (!over) {
      console.log("❌ No hay zona de drop válida");
      setActiveId(null);
      setIsDragInProgress(false);
      return;
    }

    const briefId = active.id as string;
    const newStatus = over.id as string;

    const currentBrief = briefs?.find((b) => b.id === briefId);
    if (!currentBrief) {
      console.error("❌ Brief no encontrado:", briefId);
      toast({
        title: "Error",
        description: "No se pudo encontrar el presupuesto seleccionado.",
        variant: "destructive",
      });
      setActiveId(null);
      setIsDragInProgress(false);
      return;
    }

    const currentStatus = currentBrief.status || "pending";
    
    console.log("📊 COMPARANDO ESTADOS:");
    console.log("  - Estado actual:", currentStatus);
    console.log("  - Estado nuevo:", newStatus);

    if (currentStatus !== newStatus) {
      console.log("🚀 EJECUTANDO MUTACIÓN POR DRAG-AND-DROP...");
      updateBriefStatusMutation.mutate({ briefId, newStatus });
    } else {
      console.log("ℹ️ El estado no ha cambiado, no se ejecuta mutación");
      setIsDragInProgress(false);
    }

    setActiveId(null);
  };

  // Configuración de las columnas del dashboard con nombres actualizados
  const columns = [
    {
      id: "pending",
      title: "Pendientes",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-accent-800 border-accent-700",
      headerColor: "bg-yellow-600",
      count: categorizedBriefs?.pending.length || 0,
    },
    {
      id: "in_review",
      title: "En Proceso",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-accent-800 border-accent-700",
      headerColor: "bg-blue-600",
      count: categorizedBriefs?.in_review.length || 0,
    },
    {
      id: "quote_sent",
      title: "Propuestas Enviadas",
      icon: <Send className="w-5 h-5" />,
      color: "bg-accent-800 border-accent-700",
      headerColor: "bg-green-600",
      count: categorizedBriefs?.quote_sent.length || 0,
    },
    {
      id: "completed",
      title: "Completados",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-accent-800 border-accent-700",
      headerColor: "bg-purple-600",
      count: categorizedBriefs?.completed.length || 0,
    },
  ];

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

  if (!user) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md bg-card border-border">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para acceder al panel de administración.
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

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-accent-700">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md bg-card border-border">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground mb-4">
                No tienes permisos de administrador para acceder a esta página.
              </p>
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
          <Card className="max-w-md bg-card border-border">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Error al cargar los presupuestos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeBrief = activeId ? briefs?.find((b) => b.id === activeId) : null;

  return (
    <div className="min-h-screen bg-accent-700">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de presupuestos y propuestas comerciales
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">
              Administrador: {user?.emailAddresses?.[0]?.emailAddress}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {columns.map((column) => (
            <Card key={column.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {column.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {column.count}
                    </p>
                  </div>
                  <div className={`p-2 rounded-md ${column.color}`}>
                    {column.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board con indicador de drag en progreso */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <SortableContext
                key={column.id}
                id={column.id}
                items={
                  categorizedBriefs?.[
                    column.id as keyof typeof categorizedBriefs
                  ]?.map((b) => b.id) || []
                }
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn
                  id={column.id}
                  title={column.title}
                  icon={column.icon}
                  color={column.color}
                  headerColor={column.headerColor}
                  count={column.count}
                >
                  {categorizedBriefs &&
                    categorizedBriefs[
                      column.id as keyof typeof categorizedBriefs
                    ].map((brief) => (
                      <DraggableBriefCard
                        key={brief.id}
                        brief={brief}
                        onEditBrief={handleEditBrief}
                        onStatusChange={handleStatusChange}
                      />
                    ))}

                  {categorizedBriefs &&
                    categorizedBriefs[
                      column.id as keyof typeof categorizedBriefs
                    ].length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Arrastra elementos aquí o usa el menú de opciones
                        </p>
                      </div>
                    )}
                </DroppableColumn>
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeBrief ? (
              <Card className="bg-accent-900 border-accent-700 shadow-2xl rotate-3 opacity-90">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      {activeBrief.company_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activeBrief.contact_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Indicador de operación en progreso */}
        {isDragInProgress && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              <span>Actualizando estado del presupuesto...</span>
            </div>
          </div>
        )}

        {/* Indicador de método activo */}
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>
              <strong>Métodos disponibles:</strong> Arrastra las tarjetas entre
              columnas, usa el menú de opciones (⋮) para cambiar estados o acciones, o haz clic en "Editar" para gestión completa.
            </span>
          </div>
        </div>

        {/* Modal de edición */}
        {editingBrief && (
          <BriefEditModal
            brief={editingBrief}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingBrief(null);
            }}
            onBriefUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-briefs"] });
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

export default AdminDashboard;
