
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BriefForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    industry: '',
    project_type: '',
    budget: '',
    timeline: '',
    description: '',
    objectives: '',
    target_audience: '',
    competitors: '',
    pages: [] as string[],
    features: [] as string[],
    design_preferences: '',
    content_ready: '',
    hosting_domain: '',
    additional_comments: ''
  });

  // Page options, feature options, validation functions
  const pageOptions = [
    'Inicio/Home',
    'Sobre Nosotros/About',
    'Servicios/Services',
    'Productos/Products',
    'Blog',
    'Contacto/Contact',
    'Galería/Gallery',
    'Testimonios/Reviews',
    'FAQ',
    'Términos y Condiciones',
    'Política de Privacidad',
    'Tienda Online/E-commerce'
  ];

  const featureOptions = [
    'Formulario de contacto',
    'Chat en vivo',
    'Newsletter/Suscripción',
    'Integración redes sociales',
    'Blog/Sistema de contenidos',
    'Galería de imágenes',
    'Videos',
    'Testimonios de clientes',
    'Mapa de ubicación',
    'Calendario de eventos',
    'Sistema de reservas',
    'Carrito de compras',
    'Pasarela de pagos',
    'Área de usuarios/Login',
    'Buscador interno',
    'Múltiples idiomas',
    'Optimización SEO',
    'Analytics/Estadísticas'
  ];

  const industryOptions = [
    'Tecnología',
    'Salud',
    'Educación',
    'Finanzas',
    'Retail/Comercio',
    'Inmobiliario',
    'Turismo',
    'Restauración',
    'Consultoría',
    'Manufactura',
    'Servicios profesionales',
    'Arte y entretenimiento',
    'Otro'
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.company_name.trim() !== '' && 
               formData.contact_name.trim() !== '' && 
               formData.contact_email.trim() !== '' &&
               formData.industry !== '';
      case 2:
        return formData.project_type !== '' && 
               formData.budget !== '' && 
               formData.timeline !== '';
      case 3:
        return formData.description.trim() !== '' && 
               formData.objectives.trim() !== '' &&
               formData.target_audience.trim() !== '';
      case 4:
        return formData.pages.length > 0;
      case 5:
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'pages' | 'features', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitForm = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado para enviar el brief.",
        variant: "destructive"
      });
      return;
    }

    if (!validateStep(currentStep)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Iniciando envío del brief...');
      console.log('📝 Datos del formulario:', formData);
      console.log('👤 Usuario:', user.emailAddresses[0].emailAddress);

      // Mapear los datos del formulario a la estructura de la tabla briefs
      const briefData = {
        user_id: user.emailAddresses[0].emailAddress,
        company_name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim(),
        email: formData.contact_email.trim(), // Mapear contact_email a email
        phone: formData.contact_phone.trim() || null,
        industry: formData.industry, // Campo requerido
        project_type: formData.project_type,
        budget: formData.budget,
        timeline: formData.timeline,
        project_description: formData.description.trim(), // Mapear description a project_description
        main_goals: formData.objectives.trim(), // Mapear objectives a main_goals
        target_audience: formData.target_audience.trim(),
        competitor_websites: formData.competitors.trim() || null,
        pages: formData.pages.length > 0 ? formData.pages : null,
        features: formData.features.length > 0 ? formData.features : null,
        design_preferences: formData.design_preferences.trim() || null,
        additional_notes: formData.additional_comments.trim() || null,
        status: 'pending'
      };

      console.log('📊 Datos preparados para envío:', briefData);

      // Insertar en la base de datos
      const { data, error } = await supabase
        .from('briefs')
        .insert(briefData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log('✅ Brief guardado exitosamente:', data);

      // Intentar generar PDF (no crítico)
      try {
        console.log('📄 Intentando generar PDF...');
        const { error: pdfError } = await supabase.functions.invoke('generate-brief-pdf', {
          body: { briefId: data.id }
        });

        if (pdfError) {
          console.warn('⚠️ Error generando PDF (no crítico):', pdfError);
        } else {
          console.log('✅ PDF generado exitosamente');
        }
      } catch (pdfError) {
        console.warn('⚠️ Error generando PDF (no crítico):', pdfError);
      }

      // Éxito
      toast({
        title: "¡Brief enviado exitosamente!",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto con una propuesta personalizada.",
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/my-account');
      }, 2000);

    } catch (error) {
      console.error('❌ Error completo en submitForm:', error);
      
      let errorMessage = "Error desconocido al enviar el brief.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Error al enviar el brief",
        description: errorMessage + " Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step function
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="company_name">Nombre de la empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Tu empresa o negocio"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Nombre de contacto *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Email de contacto *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Teléfono (opcional)</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <Label>Industria o sector *</Label>
                <RadioGroup
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                  className="mt-2"
                >
                  {industryOptions.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <RadioGroupItem value={industry} id={industry} />
                      <Label htmlFor={industry}>{industry}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de proyecto *</Label>
              <RadioGroup
                value={formData.project_type}
                onValueChange={(value) => handleInputChange('project_type', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="website_corporativo" id="website_corporativo" />
                  <Label htmlFor="website_corporativo">Sitio web corporativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ecommerce" id="ecommerce" />
                  <Label htmlFor="ecommerce">Tienda online / E-commerce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landing_page" id="landing_page" />
                  <Label htmlFor="landing_page">Landing page</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blog" id="blog" />
                  <Label htmlFor="blog">Blog / Portal de contenidos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aplicacion_web" id="aplicacion_web" />
                  <Label htmlFor="aplicacion_web">Aplicación web</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="otro" id="otro" />
                  <Label htmlFor="otro">Otro</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Presupuesto aproximado *</Label>
              <RadioGroup
                value={formData.budget}
                onValueChange={(value) => handleInputChange('budget', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menos_500k" id="menos_500k" />
                  <Label htmlFor="menos_500k">Menos de $500.000 CLP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500k_1m" id="500k_1m" />
                  <Label htmlFor="500k_1m">$500.000 - $1.000.000 CLP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1m_2m" id="1m_2m" />
                  <Label htmlFor="1m_2m">$1.000.000 - $2.000.000 CLP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mas_2m" id="mas_2m" />
                  <Label htmlFor="mas_2m">Más de $2.000.000 CLP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a_consultar" id="a_consultar" />
                  <Label htmlFor="a_consultar">A consultar</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Tiempo estimado de entrega *</Label>
              <RadioGroup
                value={formData.timeline}
                onValueChange={(value) => handleInputChange('timeline', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1_2_semanas" id="1_2_semanas" />
                  <Label htmlFor="1_2_semanas">1-2 semanas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3_4_semanas" id="3_4_semanas" />
                  <Label htmlFor="3_4_semanas">3-4 semanas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1_2_meses" id="1_2_meses" />
                  <Label htmlFor="1_2_meses">1-2 meses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mas_2_meses" id="mas_2_meses" />
                  <Label htmlFor="mas_2_meses">Más de 2 meses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción del proyecto *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente lo que necesitas para tu proyecto web..."
                className="min-h-[120px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="objectives">Objetivos principales *</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                placeholder="¿Qué esperas lograr con este sitio web? ¿Cuáles son tus metas principales?"
                className="min-h-[100px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="target_audience">Público objetivo *</Label>
              <Textarea
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="Describe a quién está dirigido tu sitio web (edad, intereses, ubicación, etc.)"
                className="min-h-[80px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="competitors">Competencia o referencias</Label>
              <Textarea
                id="competitors"
                value={formData.competitors}
                onChange={(e) => handleInputChange('competitors', e.target.value)}
                placeholder="Menciona sitios web de la competencia o que te gusten como referencia"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Páginas que necesitas *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Selecciona todas las páginas que quieres incluir en tu sitio web
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pageOptions.map((page) => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={page}
                      checked={formData.pages.includes(page)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('pages', page, checked as boolean)
                      }
                    />
                    <Label htmlFor={page} className="text-sm">{page}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Funcionalidades especiales</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Selecciona las funcionalidades adicionales que necesitas
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featureOptions.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('features', feature, checked as boolean)
                      }
                    />
                    <Label htmlFor={feature} className="text-sm">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="design_preferences">Preferencias de diseño</Label>
              <Textarea
                id="design_preferences"
                value={formData.design_preferences}
                onChange={(e) => handleInputChange('design_preferences', e.target.value)}
                placeholder="Describe el estilo que te gusta (moderno, clásico, minimalista, etc.), colores preferidos, tipografías..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>¿Tienes el contenido listo?</Label>
              <RadioGroup
                value={formData.content_ready}
                onValueChange={(value) => handleInputChange('content_ready', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="todo_listo" id="todo_listo" />
                  <Label htmlFor="todo_listo">Sí, tengo todo el contenido listo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parcialmente" id="parcialmente" />
                  <Label htmlFor="parcialmente">Tengo parte del contenido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="necesito_ayuda" id="necesito_ayuda" />
                  <Label htmlFor="necesito_ayuda">Necesito ayuda con el contenido</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="hosting_domain">Hosting y dominio</Label>
              <Input
                id="hosting_domain"
                value={formData.hosting_domain}
                onChange={(e) => handleInputChange('hosting_domain', e.target.value)}
                placeholder="¿Tienes dominio? ¿Dónde quieres alojar el sitio?"
              />
            </div>

            <div>
              <Label htmlFor="additional_comments">Comentarios adicionales</Label>
              <Textarea
                id="additional_comments"
                value={formData.additional_comments}
                onChange={(e) => handleInputChange('additional_comments', e.target.value)}
                placeholder="Cualquier información adicional que consideres importante..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Brief para Proyecto Web
          </h1>
          <p className="text-gray-600">
            Cuéntanos sobre tu proyecto para crear una propuesta personalizada
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de 5
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 5) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Información de contacto"}
              {currentStep === 2 && "Detalles del proyecto"}
              {currentStep === 3 && "Descripción y objetivos"}
              {currentStep === 4 && "Estructura y funcionalidades"}
              {currentStep === 5 && "Detalles finales"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Comencemos con tus datos de contacto"}
              {currentStep === 2 && "Cuéntanos qué tipo de proyecto necesitas"}
              {currentStep === 3 && "Describe tu proyecto en detalle"}
              {currentStep === 4 && "Define la estructura de tu sitio web"}
              {currentStep === 5 && "Últimos detalles para completar tu brief"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitForm}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Brief
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BriefForm;
