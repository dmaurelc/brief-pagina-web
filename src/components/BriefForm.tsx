
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { briefFormSchema, type BriefFormData, validateStep, saveDraft, loadDraft, clearDraft } from '@/utils/formValidation';
import type { Database } from '@/integrations/supabase/types';
import CompanyInfoStep from '@/components/brief-form/CompanyInfoStep';
import ProjectInfoStep from '@/components/brief-form/ProjectInfoStep';
import BudgetAndGoalsStep from '@/components/brief-form/BudgetAndGoalsStep';
import TechInfoStep from '@/components/brief-form/TechInfoStep';
import SummaryStep from '@/components/brief-form/SummaryStep';

type BriefInsert = Database['public']['Tables']['briefs']['Insert'];

const BriefForm = () => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      industry: '',
      project_type: 'nuevo',
      project_description: '',
      pages: [],
      features: [],
      timeline: 'moderado',
      budget: 'medio',
      main_goals: '',
      target_audience: '',
      existing_website: '',
      competitor_websites: '',
      design_preferences: '',
      additional_notes: '',
    },
  });

  // Cargar borrador al montar el componente
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      Object.keys(draft).forEach((key) => {
        const value = draft[key as keyof BriefFormData];
        if (value !== undefined) {
          form.setValue(key as keyof BriefFormData, value);
        }
      });
      toast.success('Borrador cargado automáticamente');
    }
  }, [form]);

  // Guardado automático con debounce
  useEffect(() => {
    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        saveDraft(data);
      }, 1000); // Guardar después de 1 segundo de inactividad

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const submitBrief = useMutation({
    mutationFn: async (data: BriefFormData) => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const briefData: BriefInsert = {
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone || null,
        industry: data.industry,
        project_type: data.project_type,
        project_description: data.project_description,
        pages: data.pages || [],
        features: data.features || [],
        timeline: data.timeline,
        budget: data.budget,
        main_goals: data.main_goals,
        target_audience: data.target_audience,
        existing_website: data.existing_website || null,
        competitor_websites: data.competitor_websites || null,
        design_preferences: data.design_preferences || null,
        additional_notes: data.additional_notes || null,
        user_id: user.id,
        status: 'pending' as const,
      };

      const { error } = await supabase
        .from('briefs')
        .insert(briefData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('¡Brief enviado correctamente! Te contactaremos pronto.');
      clearDraft();
      form.reset();
      setCurrentStep(0);
    },
    onError: (error) => {
      console.error('Error al enviar brief:', error);
      toast.error('Error al enviar el brief. Por favor, inténtalo de nuevo.');
    },
  });

  const steps = [
    {
      title: 'Información de la empresa',
      content: <CompanyInfoStep form={form} />,
    },
    {
      title: 'Información del proyecto',
      content: <ProjectInfoStep form={form} />,
    },
    {
      title: 'Presupuesto y objetivos',
      content: <BudgetAndGoalsStep form={form} />,
    },
    {
      title: 'Información técnica',
      content: <TechInfoStep form={form} />,
    },
    {
      title: 'Resumen',
      content: <SummaryStep formData={form.getValues()} onEdit={setCurrentStep} />,
    },
  ];

  const nextStep = () => {
    const currentData = form.getValues();
    const validation = validateStep(currentStep + 1, currentData);
    
    if (!validation.success) {
      // Establecer errores en el formulario
      Object.keys(validation.errors).forEach((field) => {
        form.setError(field as keyof BriefFormData, {
          type: 'manual',
          message: validation.errors[field],
        });
      });
      
      toast.error('Por favor, completa todos los campos requeridos antes de continuar.');
      return;
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: BriefFormData) => {
    console.log('Enviando brief:', data);
    submitBrief.mutate(data);
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>
          {currentStep < steps.length - 1 
            ? 'Completa los campos para avanzar al siguiente paso.'
            : 'Revisa tu información y envía tu solicitud.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {steps[currentStep].content}

            <div className="flex justify-between">
              {currentStep > 0 && (
                <Button variant="secondary" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="submit" disabled={submitBrief.isPending}>
                  {submitBrief.isPending ? 'Enviando...' : 'Enviar Brief'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BriefForm;
