import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useBriefData } from "@/hooks/useBriefData";
import { useAutoSave } from "@/hooks/useAutoSave";
import { validateAllRequiredFields } from "@/utils/formValidation";
import BriefFormSteps from "./BriefFormSteps";
import AutoSaveIndicator from "./AutoSaveIndicator";

const BriefForm = () => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const {
    getInitialFormData,
    saveBrief,
    hasExistingBrief,
    loading: briefLoading,
  } = useBriefData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const formInitialized = useRef(false);

  // Hook de autoguardado
  const { getLocalData, isLocalDataNewer, clearAutoSave, lastSaved } =
    useAutoSave(formData, user?.emailAddresses?.[0]?.emailAddress);

  // Inicializar formulario con datos existentes o locales
  useEffect(() => {
    if (
      !briefLoading &&
      !formInitialized.current &&
      user?.emailAddresses?.[0]?.emailAddress
    ) {
      // Primero intentar recuperar datos locales
      const localData = getLocalData();

      // Priorizar datos locales si existen y son más recientes
      if (localData && (!hasExistingBrief || isLocalDataNewer())) {
        setFormData(localData);

        // Mostrar toast de recuperación
        toast({
          title: "Datos recuperados",
          description:
            "Se han recuperado los datos que estabas editando anteriormente.",
          duration: 4000,
        });
      } else {
        const initialData = getInitialFormData();
        setFormData(initialData);
      }

      formInitialized.current = true;
    }
  }, [
    briefLoading,
    hasExistingBrief,
    getLocalData,
    isLocalDataNewer,
    getInitialFormData,
    user?.emailAddresses,
    toast,
  ]);

  const handleSubmit = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress || !isLoaded) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado para enviar un brief",
        variant: "destructive",
      });
      return;
    }

    // Validar formulario antes de enviar
    const validation = validateAllRequiredFields(formData);

    if (!validation.isValid) {
      return; // El toast ya se muestra en la función de validación
    }

    setIsSubmitting(true);

    try {
      await saveBrief(formData);

      // Limpiar autoguardado una vez enviado exitosamente
      clearAutoSave();

      toast({
        title: "Brief enviado exitosamente",
        description:
          "Hemos recibido tu solicitud de presupuesto. Te contactaremos pronto.",
      });
    } catch (error) {
      console.error("Error completo al enviar brief:", error);
      toast({
        title: "Error al enviar",
        description: `Hubo un problema al enviar tu brief: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (briefLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Cargando datos del formulario...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-medium text-center text-foreground">
              {hasExistingBrief
                ? "Continuar Solicitud de Presupuesto Web"
                : "Solicitud de Presupuesto Web"}
            </CardTitle>
            {hasExistingBrief && (
              <p className="text-center text-muted-foreground mt-2">
                Se han cargado los datos de tu solicitud anterior. Puedes
                modificar cualquier campo y enviar.
              </p>
            )}
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} />
        </div>
      </CardHeader>
      <CardContent>
        <BriefFormSteps
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting || !isLoaded}
        />
      </CardContent>
    </Card>
  );
};

export default BriefForm;
