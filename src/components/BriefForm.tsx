import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserSync } from '@/hooks/useUserSync';
import BriefFormSteps from './BriefFormSteps';

const BriefForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { isUserSynced, syncStatus } = useUserSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    industry: '',
    projectType: '',
    projectDescription: '',
    features: [] as string[],
    budget: '',
    timeline: '',
    pages: [] as string[],
    targetAudience: '',
    mainGoals: '',
    existingWebsite: '',
    competitorWebsites: '',
    designPreferences: '',
    additionalNotes: ''
  });

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
      const briefData = {
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: user.emailAddresses[0].emailAddress,
        phone: formData.phone || null,
        industry: formData.industry,
        project_type: formData.projectType,
        project_description: formData.projectDescription,
        features: formData.features,
        budget: formData.budget,
        timeline: formData.timeline,
        pages: formData.pages,
        target_audience: formData.targetAudience,
        main_goals: formData.mainGoals,
        existing_website: formData.existingWebsite || null,
        competitor_websites: formData.competitorWebsites || null,
        design_preferences: formData.designPreferences || null,
        additional_notes: formData.additionalNotes || null
      };

      console.log('Enviando brief con datos:', briefData);

      const { data, error } = await supabase
        .from('briefs')
        .insert(briefData)
        .select();

      if (error) {
        console.error('Error guardando brief:', error);
        toast({
          title: "Error al enviar",
          description: `Hubo un problema al guardar tu brief: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Brief guardado exitosamente:', data);
      
      toast({
        title: "Brief enviado exitosamente",
        description: "Hemos recibido tu solicitud de presupuesto. Te contactaremos pronto.",
      });

      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: user.emailAddresses[0].emailAddress,
        phone: '',
        industry: '',
        projectType: '',
        projectDescription: '',
        features: [],
        budget: '',
        timeline: '',
        pages: [],
        targetAudience: '',
        mainGoals: '',
        existingWebsite: '',
        competitorWebsites: '',
        designPreferences: '',
        additionalNotes: ''
      });

    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-center text-foreground">
          Solicitud de Presupuesto Web
        </CardTitle>
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
