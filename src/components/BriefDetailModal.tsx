import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";

type Brief = Tables<"briefs">;

interface BriefDetailModalProps {
  brief: Brief;
  isOpen: boolean;
  onClose: () => void;
}

const BriefDetailModal = ({
  brief,
  isOpen,
  onClose,
}: BriefDetailModalProps) => {
  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "quote_sent":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{brief.company_name}</DialogTitle>
            <Badge className={getStatusBadgeColor(brief.status)}>
              {brief.status || "pending"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Información de la Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-muted-foreground">
                  Empresa:
                </span>
                <p>{brief.company_name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Contacto:
                </span>
                <p>{brief.contact_name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Email:
                </span>
                <p>{brief.email}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Teléfono:
                </span>
                <p>{brief.phone || "No proporcionado"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Industria:
                </span>
                <p>{brief.industry}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del proyecto */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Información del Proyecto
            </h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-muted-foreground">
                  Tipo de proyecto:
                </span>
                <p>{brief.project_type}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Descripción:
                </span>
                <p className="whitespace-pre-wrap">
                  {brief.project_description}
                </p>
              </div>
              {brief.pages && brief.pages.length > 0 && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Páginas requeridas:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {brief.pages.map((page, index) => (
                      <Badge key={index} variant="secondary">
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {brief.features && brief.features.length > 0 && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Funcionalidades:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {brief.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Timeline:
                  </span>
                  <p>{brief.timeline}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Presupuesto:
                  </span>
                  <p>{brief.budget}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Objetivos y audiencia */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Objetivos y Audiencia
            </h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-muted-foreground">
                  Objetivos principales:
                </span>
                <p className="whitespace-pre-wrap">{brief.main_goals}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Público objetivo:
                </span>
                <p className="whitespace-pre-wrap">{brief.target_audience}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información adicional */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Información Adicional
            </h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-muted-foreground">
                  Sitio web actual:
                </span>
                <p>{brief.existing_website || "No proporcionado"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Sitios de competencia:
                </span>
                <p className="whitespace-pre-wrap">
                  {brief.competitor_websites || "No proporcionado"}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Preferencias de diseño:
                </span>
                <p className="whitespace-pre-wrap">
                  {brief.design_preferences || "No proporcionado"}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Notas adicionales:
                </span>
                <p className="whitespace-pre-wrap">
                  {brief.additional_notes || "No proporcionado"}
                </p>
              </div>
              {brief.admin_notes && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Notas del administrador:
                  </span>
                  <p className="whitespace-pre-wrap">{brief.admin_notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de fechas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Información de Seguimiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-muted-foreground">
                  Fecha de envío:
                </span>
                <p>{formatDate(brief.created_at)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Última actualización:
                </span>
                <p>{formatDate(brief.updated_at)}</p>
              </div>
              {brief.status_updated_at && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Estado actualizado:
                  </span>
                  <p>{formatDate(brief.status_updated_at)}</p>
                </div>
              )}
              {brief.user_id && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    ID de usuario:
                  </span>
                  <p>{brief.user_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BriefDetailModal;
