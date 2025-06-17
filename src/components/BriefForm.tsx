import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserSync } from '@/hooks/useUserSync';
import { useBriefData } from '@/hooks/useBriefData';
import { useAutoSave } from '@/hooks/useAutoSave';
import { validateAllRequiredFields } from '@/utils/formValidation';
import BriefFormSteps from './BriefFormSteps';
import AutoSaveIndicator from './AutoSaveIndicator';

const BriefForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { isUserSynced, syncStatus } = useUserSync();
  const { 
    getInitialFormData, 
    saveBrief, 
    hasExistingBrief, 
    loading: briefLoading,
    initializeFormWithLocalData 
  } = useBriefData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);
  const formInitialized = useRef(false);

  // Hook de autoguardado
  const { 
    hasLocalData, 
    getLocalData, 
    isLocalDataNewer, 
    clearAutoSave, 
    lastSaved 
  } = useAutoSave(formData, user?.emailAddresses?.[0]?.emailAddress);

  // Inicializar formulario con datos existentes o locales
  useEffect(() => {
    if (!briefLoading && !formInitialized.current && user?.emailAddresses?.[0]?.emailAddress) {
      console.log('📊 Inicializando formulario...');
      
      // Primero intentar recuperar datos locales
      const localData = getLocalData();
      
      // Priorizar datos locales si existen y son más recientes
      if (localData && (!hasExistingBrief || isLocalDataNewer())) {
        console.log('🔄 Recuperando datos del autoguardado local');
        setFormData(localData);
        setShowRecoveryMessage(true);
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => setShowRecoveryMessage(false), 5000);
      } else {
        console.log('📝 Inicializando con datos del servidor o formulario vacío');
        const initialData = getInitialFormData();
        setFormData(initialData);
      }
      
      formInitialized.current = true;
      console.log('✅ Formulario inicializado');
    }
  }, [briefLoading, hasExistingBrief, getLocalData, isLocalDataNewer, getInitialFormData, user?.emailAddresses, hasLocalData]);

  const handleSubmit = async () => {
    console.log('🚀 Iniciando envío del brief');

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado para enviar un brief",
        variant: "destructive",
      });
      return;
    }

    if (!isUserSynced) {
      console.log('⚠️ Usuario no sincronizado, estado:', syncStatus);
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

    // Validar formulario antes de enviar
    const validation = validateAllRequiredFields(formData);
    
    if (!validation.isValid) {
      console.log('❌ Validación fallida');
      return; // El toast ya se muestra en la función de validación
    }

    console.log('✅ Formulario válido - Enviando...');
    setIsSubmitting(true);

    try {
      const data = await saveBrief(formData);
      console.log('🎉 Brief enviado exitosamente');
      
      // Limpiar autoguardado una vez enviado exitosamente
      clearAutoSave();
      
      toast({
        title: "Brief enviado exitosamente",
        description: "Hemos recibido tu solicitud de presupuesto. Te contactaremos pronto.",
      });

    } catch (error) {
      console.error('💥 Error en envío:', error);
      
      toast({
        title: "Error al enviar",
        description: `Hubo un problema al enviar tu brief: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log del estado del botón para debugging
  console.log('🔘 Estado del botón:', {
    isSubmitting,
    isUserSynced,
    syncStatus,
    buttonDisabled: isSubmitting || !isUserSynced
  });

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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-medium text-center text-foreground">
              {hasExistingBrief ? 'Continuar Solicitud de Presupuesto Web' : 'Solicitud de Presupuesto Web'}
            </CardTitle>
            {hasExistingBrief && (
              <p className="text-center text-muted-foreground mt-2">
                Se han cargado los datos de tu solicitud anterior. Puedes modificar cualquier campo y enviar.
              </p>
            )}
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} />
        </div>
        
        {showRecoveryMessage && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              ✨ Se han recuperado los datos que estabas editando anteriormente.
            </p>
          </div>
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
