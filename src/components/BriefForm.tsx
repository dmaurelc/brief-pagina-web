
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserSync } from '@/hooks/useUserSync';
import { useBriefData } from '@/hooks/useBriefData';
import BriefFormSteps from './BriefFormSteps';

const BriefForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { isUserSynced, syncStatus } = useUserSync();
  const { getInitialFormData, saveBrief, hasExistingBrief, loading: briefLoading } = useBriefData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const formInitialized = useRef(false);

  // Actualizar formData solo una vez cuando se cargan los datos del brief
  useEffect(() => {
    if (!briefLoading && !formInitialized.current) {
      console.log('Inicializando formulario con datos:', hasExistingBrief ? 'brief existente' : 'formulario vacío');
      setFormData(getInitialFormData());
      formInitialized.current = true;
    }
  }, [briefLoading]);

  const handleSubmit = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado para enviar un brief",
        variant: "destructive",
      });
      return;
    }

    if (!isUserSynced) {
      toast({
        title: "Sincronización pendiente",
        description: "Esperando sincronización del usuario. Intenta nuevamente en unos segundos.",
        variant: "destructive",
      });
      return;
    }

    if (syncStatus === 'error') {
      toast({
        title: "Error de sincronización",
        description: "Hubo un problema sincronizando tu usuario. Recarga la página e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Guardando brief con datos:', formData);

      const data = await saveBrief(formData);
      console.log('Brief guardado exitosamente:', data);
      
      toast({
        title: hasExistingBrief ? "Brief actualizado exitosamente" : "Brief enviado exitosamente",
        description: hasExistingBrief 
          ? "Tus cambios han sido guardados correctamente."
          : "Hemos recibido tu solicitud de presupuesto. Te contactaremos pronto.",
      });

    } catch (error) {
      console.error('Error guardando brief:', error);
      toast({
        title: "Error al guardar",
        description: `Hubo un problema al guardar tu brief: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (briefLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos del formulario...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-center text-foreground">
          {hasExistingBrief ? 'Actualizar Solicitud de Presupuesto Web' : 'Solicitud de Presupuesto Web'}
        </CardTitle>
        {hasExistingBrief && (
          <p className="text-center text-muted-foreground">
            Se han cargado los datos de tu solicitud anterior. Puedes modificar cualquier campo y guardar los cambios.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {syncStatus === 'error' && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              Hubo un problema sincronizando tu usuario. Recarga la página e intenta nuevamente.
            </p>
          </div>
        )}
        
        <BriefFormSteps 
          formData={formData} 
          setFormData={setFormData} 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting || !isUserSynced}
        />
      </CardContent>
    </Card>
  );
};

export default BriefForm;
