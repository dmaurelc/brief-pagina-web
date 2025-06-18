import { useEffect, useState } from "react";
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
    enabled: isAdmin === true,
  });

  const updateBriefStatusMutation = useMutation({
    mutationFn: async ({
      briefId,
      newStatus,
    }: {
      briefId: string;
      newStatus: string;
    }) => {
      console.log("🚀 Iniciando actualización de estado:", {
        briefId,
        newStatus,
      });

      const currentBrief = briefs?.find((b) => b.id === briefId);
      if (!currentBrief) {
        throw new Error(`Brief no encontrado: ${briefId}`);
      }

      const validStatuses = ["pending", "in_review", "quote_sent", "completed"];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Estado inválido: ${newStatus}`);
      }

      console.log("📝 Actualizando brief:", currentBrief.company_name);

      const { error, count } = await supabase
        .from("briefs")
        .update({
          status: newStatus as any,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", briefId);

      if (error) {
        console.error("❌ Error en Supabase:", error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log("✅ Actualización completada, registros afectados:", count);

      return { briefId, newStatus, company_name: currentBrief.company_name };
    },
    onMutate: async ({ briefId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-briefs"] });
      const previousBriefs = queryClient.getQueryData(["admin-briefs"]);

      queryClient.setQueryData(["admin-briefs"], (old: Brief[] | undefined) => {
        if (!old) return old;
        return old.map((brief) =>
          brief.id === briefId
            ? {
                ...brief,
                status: newStatus as any,
                status_updated_at: new Date().toISOString(),
              }
            : brief
        );
      });

      return { previousBriefs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBriefs) {
        queryClient.setQueryData(["admin-briefs"], context.previousBriefs);
      }

      console.error("❌ Error en mutación:", error);

      toast({
        title: "❌ Error al actualizar estado",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log("✅ Mutación exitosa:", data);

      queryClient.invalidateQueries({ queryKey: ["admin-briefs"] });

      toast({
        title: "✅ Estado actualizado",
        description: `"${data.company_name}" cambió a "${
          STATUS_CONFIG[data.newStatus as keyof typeof STATUS_CONFIG]?.label
        }".`,
      });
    },
  });

  // Función para manejar cambio de estado por dropdown
  const handleStatusChange = (briefId: string, newStatus: string) => {
    console.log("🔄 Cambio de estado por dropdown:", { briefId, newStatus });
    updateBriefStatusMutation.mutate({ briefId, newStatus });
  };

  const handleEditBrief = (brief: Brief) => {
    setEditingBrief(brief);
    setIsEditModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log("🎯 Drag iniciado para brief:", event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🎯 Drag terminado:", {
      briefId: active.id,
      targetColumn: over?.id,
      hasValidTarget: !!over,
    });

    if (!over) {
      console.log("❌ No hay zona de drop válida");
      setActiveId(null);
      return;
    }

    const briefId = active.id as string;
    const newStatus = over.id as string;

    const currentBrief = briefs?.find((b) => b.id === briefId);
    if (!currentBrief) {
      console.error("❌ Brief no encontrado en handleDragEnd:", briefId);

      toast({
        title: "Error",
        description: "No se pudo encontrar el presupuesto seleccionado.",
        variant: "destructive",
      });

      setActiveId(null);
      return;
    }

    const currentStatus = currentBrief.status || "pending";

    if (currentStatus !== newStatus) {
      console.log("🚀 Ejecutando mutación por drag-and-drop...");
      updateBriefStatusMutation.mutate({ briefId, newStatus });
    } else {
      console.log("ℹ️ El estado no ha cambiado");
    }

    setActiveId(null);
  };

  // Categorizar briefs por estado
  const categorizedBriefs = briefs
    ? {
        pending: briefs.filter((b) => !b.status || b.status === "pending"),
        in_review: briefs.filter((b) => b.status === "in_review"),
        quote_sent: briefs.filter((b) => b.status === "quote_sent"),
        completed: briefs.filter((b) => b.status === "completed"),
      }
    : null;

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

        {/* Kanban Board con ambos métodos: Drag and Drop + Dropdown */}
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
