import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Send, Save, Building, Briefcase, DollarSign, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  // Información de la empresa
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  
  // Sobre el proyecto
  projectType: string;
  projectDescription: string;
  features: string[];
  timeline: string;
  
  // Presupuesto y objetivos
  budget: string;
  mainGoals: string;
  targetAudience: string;
  
  // Información técnica
  existingWebsite: string;
  competitorWebsites: string;
  designPreferences: string;
  additionalNotes: string;
}

const initialFormData: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  industry: '',
  projectType: '',
  projectDescription: '',
  features: [],
  timeline: '',
  budget: '',
  mainGoals: '',
  targetAudience: '',
  existingWebsite: '',
  competitorWebsites: '',
  designPreferences: '',
  additionalNotes: ''
};

const industryOptions = [
  'Tecnología',
  'Salud',
  'Educación',
  'Retail/E-commerce',
  'Servicios Financieros',
  'Inmobiliaria',
  'Turismo y Hospitalidad',
  'Alimentación y Bebidas',
  'Manufactura',
  'Consultoría',
  'Marketing y Publicidad',
  'Deportes y Fitness',
  'Arte y Entretenimiento',
  'Automotriz',
  'Construcción',
  'Legal',
  'Otros'
];

const featuresOptions = [
  'Formulario de contacto',
  'Chat en vivo',
  'Sistema de reservas',
  'Galería de imágenes',
  'Blog/Noticias',
  'Múltiples idiomas',
  'Newsletter',
  'Búsqueda avanzada',
  'Panel de administración',
  'Chatbot con IA'
];

const BriefForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('briefweb-form-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        toast({
          title: "Datos recuperados",
          description: "Se han cargado los datos guardados anteriormente.",
        });
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    }
  }, []);

  // Guardar datos en localStorage automáticamente cada vez que cambian
  useEffect(() => {
    localStorage.setItem('briefweb-form-data', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Los datos se guardan automáticamente por el useEffect de arriba
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    const currentFeatures = formData.features;
    const updatedFeatures = checked
      ? [...currentFeatures, feature]
      : currentFeatures.filter(f => f !== feature);
    updateFormData('features', updatedFeatures);
  };

  const saveProgress = () => {
    // Esta función ahora solo muestra un mensaje ya que el guardado es automático
    toast({
      title: "Datos guardados",
      description: "Tus datos se guardan automáticamente mientras completas el formulario.",
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('access_key', 'afffbf8d-e6b6-4f58-b6df-2615afc756f5');
      formDataToSend.append('subject', `Nuevo Brief de ${formData.companyName} - BriefWeb`);
      
      // Crear el mensaje formateado
      const message = `
BRIEF PARA SITIO WEB - ${formData.companyName}

=== INFORMACIÓN DE LA EMPRESA ===
Empresa: ${formData.companyName}
Contacto: ${formData.contactName}
Email: ${formData.email}
Teléfono: ${formData.phone}
Industria: ${formData.industry}

=== DETALLES DEL PROYECTO ===
Tipo de proyecto: ${formData.projectType}
Descripción: ${formData.projectDescription}
Funcionalidades requeridas: ${formData.features.join(', ')}
Timeline: ${formData.timeline}

=== PRESUPUESTO Y OBJETIVOS ===
Presupuesto disponible: ${formData.budget}
Objetivos principales: ${formData.mainGoals}
Público objetivo: ${formData.targetAudience}

=== INFORMACIÓN TÉCNICA ===
Sitio web actual: ${formData.existingWebsite || 'No tiene'}
Sitios de competencia: ${formData.competitorWebsites || 'No especificado'}
Preferencias de diseño: ${formData.designPreferences || 'No especificado'}
Notas adicionales: ${formData.additionalNotes || 'Ninguna'}
      `;

      formDataToSend.append('message', message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        toast({
          title: "¡Brief enviado exitosamente!",
          description: "Recibirás una respuesta en las próximas 24 horas.",
        });
        
        // Limpiar localStorage después del envío exitoso
        localStorage.removeItem('briefweb-form-data');
        setFormData(initialFormData);
        setCurrentStep(1);
      } else {
        throw new Error('Error en el envío');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nombre de la empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                placeholder="Ej: Mi Empresa S.A."
                required
              />
            </div>
            <div>
              <Label htmlFor="contactName">Nombre de contacto *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateFormData('contactName', e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="tu@empresa.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industria/Sector *</Label>
              <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu industria" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectType">Tipo de proyecto *</Label>
              <Select value={formData.projectType} onValueChange={(value) => updateFormData('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Sitio web nuevo</SelectItem>
                  <SelectItem value="rediseno">Rediseño de sitio existente</SelectItem>
                  <SelectItem value="ecommerce">Tienda online/E-commerce</SelectItem>
                  <SelectItem value="landing">Landing page</SelectItem>
                  <SelectItem value="blog">Blog/Portal de contenidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="projectDescription">Descripción del proyecto *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => updateFormData('projectDescription', e.target.value)}
                placeholder="Describe en detalle qué necesitas..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label>Funcionalidades requeridas</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {featuresOptions.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureToggle(feature, checked as boolean)}
                    />
                    <Label htmlFor={feature} className="text-sm cursor-pointer">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="timeline">Timeline esperado *</Label>
              <Select value={formData.timeline} onValueChange={(value) => updateFormData('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2-semanas">1-2 semanas</SelectItem>
                  <SelectItem value="1-mes">1 mes</SelectItem>
                  <SelectItem value="2-3-meses">2-3 meses</SelectItem>
                  <SelectItem value="3-6-meses">3-6 meses</SelectItem>
                  <SelectItem value="mas-6-meses">Más de 6 meses</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget">Presupuesto disponible *</Label>
              <Select value={formData.budget} onValueChange={(value) => updateFormData('budget', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menos-300000">Menos de $300.000 CLP</SelectItem>
                  <SelectItem value="300000-500000">Entre $300.000 - $500.000 CLP</SelectItem>
                  <SelectItem value="500000-800000">Entre $500.000 - $800.000 CLP</SelectItem>
                  <SelectItem value="800000-1000000">Entre $800.000 - $1.000.000 CLP</SelectItem>
                  <SelectItem value="mas-1000000">Más de $1.000.000 CLP</SelectItem>
                  <SelectItem value="por-definir">Por definir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mainGoals">Objetivos principales del sitio web *</Label>
              <Textarea
                id="mainGoals"
                value={formData.mainGoals}
                onChange={(e) => updateFormData('mainGoals', e.target.value)}
                placeholder="¿Qué esperas lograr con el sitio web? (generar leads, ventas, branding, etc.)"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="targetAudience">Público objetivo *</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Describe a tu audiencia ideal (edad, intereses, comportamiento, etc.)"
                rows={3}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="existingWebsite">Sitio web actual (si existe)</Label>
              <Input
                id="existingWebsite"
                type="url"
                value={formData.existingWebsite}
                onChange={(e) => updateFormData('existingWebsite', e.target.value)}
                placeholder="https://www.tusitio.com"
              />
            </div>
            <div>
              <Label htmlFor="competitorWebsites">Sitios web de referencia/competencia</Label>
              <Textarea
                id="competitorWebsites"
                value={formData.competitorWebsites}
                onChange={(e) => updateFormData('competitorWebsites', e.target.value)}
                placeholder="URLs de sitios que te gustan o son tu competencia"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="designPreferences">Preferencias de diseño</Label>
              <Textarea
                id="designPreferences"
                value={formData.designPreferences}
                onChange={(e) => updateFormData('designPreferences', e.target.value)}
                placeholder="Colores, estilo, elementos que te gustan o no..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="additionalNotes">Notas adicionales</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                placeholder="Cualquier información adicional relevante"
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Resumen de tu Brief</h3>
              <p className="text-muted-foreground mb-8">
                Revisa toda la información antes de enviar. Recibirás una respuesta en las próximas 24 horas.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Información de la empresa */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Building className="w-5 h-5 text-primary mr-2" />
                  <h4 className="text-lg font-semibold">Información de la empresa</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Empresa:</span>
                    <p className="text-sm mt-1">{formData.companyName || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Contacto:</span>
                    <p className="text-sm mt-1">{formData.contactName || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-sm mt-1">{formData.email || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Teléfono:</span>
                    <p className="text-sm mt-1">{formData.phone || 'No especificado'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">Industria:</span>
                    <p className="text-sm mt-1">{formData.industry || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Detalles del proyecto */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-5 h-5 text-primary mr-2" />
                  <h4 className="text-lg font-semibold">Detalles del proyecto</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Tipo de proyecto:</span>
                    <p className="text-sm mt-1">{formData.projectType || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                    <p className="text-sm mt-1">{formData.projectDescription || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Timeline:</span>
                    <p className="text-sm mt-1">{formData.timeline || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Funcionalidades requeridas:</span>
                    <div className="mt-1">
                      {formData.features.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Ninguna funcionalidad seleccionada</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Presupuesto y objetivos */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-5 h-5 text-primary mr-2" />
                  <h4 className="text-lg font-semibold">Presupuesto y objetivos</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Presupuesto disponible:</span>
                    <p className="text-sm mt-1">{formData.budget || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Objetivos principales:</span>
                    <p className="text-sm mt-1">{formData.mainGoals || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Público objetivo:</span>
                    <p className="text-sm mt-1">{formData.targetAudience || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Información técnica */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Settings className="w-5 h-5 text-primary mr-2" />
                  <h4 className="text-lg font-semibold">Información técnica</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Sitio web actual:</span>
                    <p className="text-sm mt-1">{formData.existingWebsite || 'No tiene sitio web actual'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Sitios de competencia/referencia:</span>
                    <p className="text-sm mt-1">{formData.competitorWebsites || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Preferencias de diseño:</span>
                    <p className="text-sm mt-1">{formData.designPreferences || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Notas adicionales:</span>
                    <p className="text-sm mt-1">{formData.additionalNotes || 'Ninguna nota adicional'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información de la empresa";
      case 2: return "Detalles del proyecto";
      case 3: return "Presupuesto y objetivos";
      case 4: return "Información técnica";
      case 5: return "Resumen y envío";
      default: return "";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
          <Button onClick={saveProgress} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Guardado automático
          </Button>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        <p className="text-sm text-muted-foreground">Paso {currentStep} de {totalSteps} • Guardado automático activado</p>
      </CardHeader>
      
      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              onClick={submitForm}
              disabled={isSubmitting}
              className="ml-auto"
              size="lg"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Brief
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BriefForm;
