
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { briefFormSchema, type BriefFormData } from '@/utils/formValidation';

interface StepProps {
  form: any;
}

const CompanyInfoStep: React.FC<StepProps> = ({ form }) => (
  <div className="grid gap-4">
    <FormField
      control={form.control}
      name="company_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de la empresa</FormLabel>
          <FormControl>
            <Input placeholder="DMaurel" {...field} />
          </FormControl>
          <FormDescription>
            ¿Cuál es el nombre de tu empresa?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="contact_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de contacto</FormLabel>
          <FormControl>
            <Input placeholder="Daniel Maurel" {...field} />
          </FormControl>
          <FormDescription>
            ¿A quién debemos contactar?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="hola@dmaurel.com" {...field} />
          </FormControl>
          <FormDescription>
            ¿Cuál es tu dirección de correo electrónico?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="+54 9 11 1234-5678" {...field} />
          </FormControl>
          <FormDescription>
            ¿Cuál es tu número de teléfono?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="industry"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Industria</FormLabel>
          <FormControl>
            <Input placeholder="Tecnología" {...field} />
          </FormControl>
          <FormDescription>
            ¿A qué industria pertenece tu empresa?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const ProjectInfoStep: React.FC<StepProps> = ({ form }) => (
  <div className="grid gap-4">
    <FormField
      control={form.control}
      name="project_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de proyecto</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuevo">Sitio web nuevo</SelectItem>
                <SelectItem value="rediseño">Rediseño de sitio web existente</SelectItem>
                <SelectItem value="e-commerce">Tienda online (E-commerce)</SelectItem>
                <SelectItem value="landing-page">Landing Page</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            ¿Qué tipo de proyecto necesitas?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="project_description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descripción del proyecto</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Necesitamos un sitio web para..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Describe brevemente tu proyecto.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="features"
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1.5">
          <FormLabel>Funcionalidades deseadas</FormLabel>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value?.includes("blog")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...field.value || [], "blog"])
                  } else {
                    field.onChange(field.value?.filter((value) => value !== "blog"))
                  }
                }}
              />
              <label
                htmlFor="blog"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Blog
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value?.includes("galeria")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...field.value || [], "galeria"])
                  } else {
                    field.onChange(field.value?.filter((value) => value !== "galeria"))
                  }
                }}
              />
              <label
                htmlFor="galeria"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Galería de imágenes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value?.includes("tienda")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...field.value || [], "tienda"])
                  } else {
                    field.onChange(field.value?.filter((value) => value !== "tienda"))
                  }
                }}
              />
              <label
                htmlFor="tienda"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tienda online
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value?.includes("reservas")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...field.value || [], "reservas"])
                  } else {
                    field.onChange(field.value?.filter((value) => value !== "reservas"))
                  }
                }}
              />
              <label
                htmlFor="reservas"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sistema de reservas
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value?.includes("login")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...field.value || [], "login"])
                  } else {
                    field.onChange(field.value?.filter((value) => value !== "login"))
                  }
                }}
              />
              <label
                htmlFor="login"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Login de usuarios
              </label>
            </div>
          </div>
          <FormDescription>
            ¿Qué funcionalidades deseas incluir en tu sitio web?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="timeline"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Plazos</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgente">Urgente (1-2 semanas)</SelectItem>
                <SelectItem value="moderado">Moderado (2-4 semanas)</SelectItem>
                <SelectItem value="flexible">Flexible (1-2 meses)</SelectItem>
                <SelectItem value="sin-prisa">Sin prisa (+2 meses)</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            ¿Cuándo te gustaría tener el proyecto terminado?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const BudgetAndGoalsStep: React.FC<StepProps> = ({ form }) => (
  <div className="grid gap-4">
    <FormField
      control={form.control}
      name="budget"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Presupuesto estimado</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un presupuesto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bajo">Bajo (menos de $500 USD)</SelectItem>
                <SelectItem value="medio">Medio ($500 - $2000 USD)</SelectItem>
                <SelectItem value="alto">Alto ($2000 - $5000 USD)</SelectItem>
                <SelectItem value="muy-alto">Muy alto (más de $5000 USD)</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            ¿Cuál es tu presupuesto estimado para este proyecto?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="main_goals"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Objetivos principales</FormLabel>
          <FormControl>
            <Textarea
              placeholder="El objetivo principal es..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            ¿Cuáles son los objetivos principales de este proyecto?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="target_audience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Público objetivo</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Nuestro público objetivo es..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            ¿A quién está dirigido este proyecto?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const TechInfoStep: React.FC<StepProps> = ({ form }) => (
  <div className="grid gap-4">
    <FormField
      control={form.control}
      name="existing_website"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sitio web existente (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="https://www.ejemplo.com" {...field} />
          </FormControl>
          <FormDescription>
            ¿Tienes un sitio web existente?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="competitor_websites"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sitios web de la competencia (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="https://www.competidor1.com, https://www.competidor2.com" {...field} />
          </FormControl>
          <FormDescription>
            ¿Cuáles son los sitios web de tu competencia?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="design_preferences"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferencias de diseño (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Nos gustaría un diseño..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            ¿Tienes alguna preferencia de diseño?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="additional_notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notas adicionales (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Alguna otra cosa que debamos saber..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            ¿Alguna otra cosa que debamos saber?
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

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

  const submitBrief = useMutation({
    mutationFn: async (data: BriefFormData) => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const briefData = {
        ...data,
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
  ];

  const nextStep = () => {
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
          Completa los campos para avanzar al siguiente paso.
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
                  Enviar Brief
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
