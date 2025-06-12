import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  company_name: z.string().min(2, {
    message: "El nombre de la empresa debe tener al menos 2 caracteres.",
  }),
  contact_name: z.string().min(2, {
    message: "El nombre del contacto debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  phone: z.string().optional(),
  industry: z.string().min(2, {
    message: "Por favor, especifica la industria.",
  }),
  project_type: z.string().min(2, {
    message: "Por favor, especifica el tipo de proyecto.",
  }),
  project_description: z.string().min(10, {
    message: "La descripción del proyecto debe tener al menos 10 caracteres.",
  }),
  features: z.array(z.string()).optional(),
  pages: z.array(z.string()).optional(),
  timeline: z.string().min(2, {
    message: "Por favor, especifica el timeline.",
  }),
  budget: z.string().min(2, {
    message: "Por favor, especifica el presupuesto.",
  }),
  main_goals: z.string().min(10, {
    message: "Por favor, especifica los objetivos principales.",
  }),
  target_audience: z.string().min(10, {
    message: "Por favor, especifica la audiencia objetivo.",
  }),
  existing_website: z.string().optional(),
  competitor_websites: z.string().optional(),
  design_preferences: z.string().optional(),
  additional_notes: z.string().optional(),
});

interface BriefFormValues extends z.infer<typeof formSchema> {}

const BriefForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<BriefFormValues>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    project_type: "",
    project_description: "",
    features: [],
    pages: [],
    timeline: "",
    budget: "",
    main_goals: "",
    target_audience: "",
    existing_website: "",
    competitor_websites: "",
    design_preferences: "",
    additional_notes: ""
  });

  const form = useForm<BriefFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      industry: "",
      project_type: "",
      project_description: "",
      features: [],
      pages: [],
      timeline: "",
      budget: "",
      main_goals: "",
      target_audience: "",
      existing_website: "",
      competitor_websites: "",
      design_preferences: "",
      additional_notes: "",
    },
  });

  // Helper function to get budget label
  const getBudgetLabel = (budgetValue: string) => {
    const budgetOptions = [
      { value: "menos-300000", label: "Menos de $300.000 CLP" },
      { value: "300000-500000", label: "Entre $300.000 - $500.000 CLP" },
      { value: "500000-800000", label: "Entre $500.000 - $800.000 CLP" },
      { value: "800000-1200000", label: "Entre $800.000 - $1.200.000 CLP" },
      { value: "1200000-2000000", label: "Entre $1.200.000 - $2.000.000 CLP" },
      { value: "mas-2000000", label: "Más de $2.000.000 CLP" },
      { value: "consultar", label: "Prefiero consultar" }
    ];
    
    const option = budgetOptions.find(opt => opt.value === budgetValue);
    return option ? option.label : budgetValue;
  };

  const requiredPages = [
    "Home",
    "Servicios",
    "Nosotros",
    "Contacto",
    "Blog",
    "Tienda",
    "Preguntas Frecuentes",
    "Términos y Condiciones",
    "Política de Privacidad",
  ];

  const requiredFeatures = [
    "Carrito de Compras",
    "Pasarela de Pago",
    "Blog",
    "Formulario de Contacto",
    "Galería de Imágenes",
    "Integración con Redes Sociales",
    "Chat en Vivo",
    "Suscripción a Newsletter",
    "Sistema de Reservas",
    "Multi-idioma",
  ];

  const onSubmit = (values: BriefFormValues) => {
    setFormData(values);
    setCurrentStep(5);
  };

  const handleNextStep = (data: BriefFormValues) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmitForm = async () => {
    try {
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Información de Contacto
              </h2>
              <p className="text-muted-foreground">
                Ingresa tus datos para que podamos contactarte
              </p>
            </div>
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="DMaurel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                    <Input placeholder="johndoe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+56912345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <div></div>
              <Button onClick={() => handleNextStep(form.getValues())}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Información del Proyecto
              </h2>
              <p className="text-muted-foreground">
                Cuéntanos sobre tu proyecto
              </p>
            </div>
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industria</FormLabel>
                  <FormControl>
                    <Input placeholder="Tecnología" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="E-commerce" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Proyecto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu proyecto en detalle"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
              <Button onClick={() => handleNextStep(form.getValues())}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Páginas y Funcionalidades
              </h2>
              <p className="text-muted-foreground">
                Selecciona las páginas y funcionalidades que necesitas
              </p>
            </div>
            <FormField
              control={form.control}
              name="pages"
              render={() => (
                <FormItem>
                  <FormLabel>Páginas Requeridas</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {requiredPages.map((page) => (
                      <FormField
                        key={page}
                        control={form.control}
                        name="pages"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={page}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(page)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), page])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== page
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {page}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <FormLabel>Funcionalidades</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {requiredFeatures.map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), feature])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== feature
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {feature}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
              <Button onClick={() => handleNextStep(form.getValues())}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Información Adicional
              </h2>
              <p className="text-muted-foreground">
                Cuéntanos más sobre tu proyecto
              </p>
            </div>
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un timeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-2 semanas">1-2 semanas</SelectItem>
                      <SelectItem value="2-4 semanas">2-4 semanas</SelectItem>
                      <SelectItem value="1-2 meses">1-2 meses</SelectItem>
                      <SelectItem value="2-3 meses">2-3 meses</SelectItem>
                      <SelectItem value="3-6 meses">3-6 meses</SelectItem>
                      <SelectItem value="más de 6 meses">más de 6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presupuesto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un presupuesto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="menos-300000">Menos de $300.000 CLP</SelectItem>
                      <SelectItem value="300000-500000">Entre $300.000 - $500.000 CLP</SelectItem>
                      <SelectItem value="500000-800000">Entre $500.000 - $800.000 CLP</SelectItem>
                      <SelectItem value="800000-1200000">Entre $800.000 - $1.200.000 CLP</SelectItem>
                      <SelectItem value="1200000-2000000">Entre $1.200.000 - $2.000.000 CLP</SelectItem>
                      <SelectItem value="mas-2000000">Más de $2.000.000 CLP</SelectItem>
                      <SelectItem value="consultar">Prefiero consultar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="main_goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos Principales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Cuáles son los objetivos principales de tu proyecto?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audiencia Objetivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿A quién está dirigido tu proyecto?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="existing_website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Web Actual (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL del sitio web actual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competitor_websites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitios de Referencia (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL de sitios web de la competencia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="design_preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferencias de Diseño (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Tienes alguna preferencia de diseño?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Hay algo más que debamos saber?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
              <Button onClick={() => handleNextStep(form.getValues())}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Resumen del Brief</h2>
              <p className="text-muted-foreground">Revisa la información antes de enviar</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Información de Contacto</h3>
                  <p><span className="font-medium">Empresa:</span> {formData.company_name}</p>
                  <p><span className="font-medium">Contacto:</span> {formData.contact_name}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  {formData.phone && <p><span className="font-medium">Teléfono:</span> {formData.phone}</p>}
                </div>
                
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Proyecto</h3>
                  <p><span className="font-medium">Industria:</span> {formData.industry}</p>
                  <p><span className="font-medium">Tipo:</span> {formData.project_type}</p>
                  <p><span className="font-medium">Timeline:</span> {formData.timeline}</p>
                  <p><span className="font-medium">Presupuesto:</span> {getBudgetLabel(formData.budget)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-accent-foreground mb-2">Descripción del Proyecto</h3>
                <p className="text-sm">{formData.project_description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-accent-foreground mb-2">Objetivos Principales</h3>
                <p className="text-sm">{formData.main_goals}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-accent-foreground mb-2">Audiencia Objetivo</h3>
                <p className="text-sm">{formData.target_audience}</p>
              </div>
              
              {(formData.pages || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Páginas Requeridas</h3>
                  <div className="flex flex-wrap gap-2">
                    {(formData.pages || []).map((page) => (
                      <span key={page} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {page}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(formData.features || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Funcionalidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {(formData.features || []).map((feature) => (
                      <span key={feature} className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.existing_website && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Sitio Web Actual</h3>
                  <p className="text-sm">{formData.existing_website}</p>
                </div>
              )}
              
              {formData.competitor_websites && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Sitios de Referencia</h3>
                  <p className="text-sm">{formData.competitor_websites}</p>
                </div>
              )}
              
              {formData.design_preferences && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Preferencias de Diseño</h3>
                  <p className="text-sm">{formData.design_preferences}</p>
                </div>
              )}
              
              {formData.additional_notes && (
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Notas Adicionales</h3>
                  <p className="text-sm">{formData.additional_notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
              <Button onClick={handleSubmitForm}>
                Enviar
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-card p-8 rounded-lg border">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Brief Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Gracias por completar el brief. Te contactaremos pronto con una propuesta personalizada.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  company_name: "",
                  contact_name: "",
                  email: "",
                  phone: "",
                  industry: "",
                  project_type: "",
                  project_description: "",
                  features: [],
                  pages: [],
                  timeline: "",
                  budget: "",
                  main_goals: "",
                  target_audience: "",
                  existing_website: "",
                  competitor_websites: "",
                  design_preferences: "",
                  additional_notes: ""
                });
              }}
              className="w-full"
            >
              Enviar Otro Brief
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-lg mx-auto"
      >
        {renderStep()}
      </form>
    </Form>
  );
};

export default BriefForm;
