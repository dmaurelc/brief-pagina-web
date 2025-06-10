
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, Save } from 'lucide-react';
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

  // Guardar datos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('briefweb-form-data', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formData.features;
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    updateFormData('features', updatedFeatures);
  };

  const saveProgress = () => {
    localStorage.setItem('briefweb-form-data', JSON.stringify(formData));
    toast({
      title: "Progreso guardado",
      description: "Tus datos han sido guardados localmente.",
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
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industria/Sector</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                placeholder="Ej: Tecnología, Salud, Educación"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectType">Tipo de proyecto *</Label>
              <select
                id="projectType"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.projectType}
                onChange={(e) => updateFormData('projectType', e.target.value)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="nuevo">Sitio web nuevo</option>
                <option value="rediseno">Rediseño de sitio existente</option>
                <option value="ecommerce">Tienda online/E-commerce</option>
                <option value="landing">Landing page</option>
                <option value="blog">Blog/Portal de contenidos</option>
                <option value="app">Aplicación web</option>
              </select>
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
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'Formulario de contacto',
                  'Chat en vivo',
                  'Sistema de reservas',
                  'Galería de imágenes',
                  'Blog/Noticias',
                  'Múltiples idiomas',
                  'Integración redes sociales',
                  'Newsletter',
                  'Búsqueda avanzada',
                  'Panel de administración'
                ].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="timeline">Timeline esperado *</Label>
              <select
                id="timeline"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.timeline}
                onChange={(e) => updateFormData('timeline', e.target.value)}
                required
              >
                <option value="">Selecciona un plazo</option>
                <option value="1-2-semanas">1-2 semanas</option>
                <option value="1-mes">1 mes</option>
                <option value="2-3-meses">2-3 meses</option>
                <option value="3-6-meses">3-6 meses</option>
                <option value="mas-6-meses">Más de 6 meses</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget">Presupuesto disponible *</Label>
              <select
                id="budget"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.budget}
                onChange={(e) => updateFormData('budget', e.target.value)}
                required
              >
                <option value="">Selecciona un rango</option>
                <option value="menos-1000">Menos de $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-25000">$10,000 - $25,000</option>
                <option value="mas-25000">Más de $25,000</option>
                <option value="por-definir">Por definir</option>
              </select>
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
              <h3 className="text-xl font-semibold mb-4">Resumen de tu Brief</h3>
              <p className="text-muted-foreground mb-6">
                Revisa la información antes de enviar. Recibirás una respuesta en las próximas 24 horas.
              </p>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Información de la empresa</h4>
                <p><strong>Empresa:</strong> {formData.companyName}</p>
                <p><strong>Contacto:</strong> {formData.contactName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Teléfono:</strong> {formData.phone || 'No especificado'}</p>
                <p><strong>Industria:</strong> {formData.industry || 'No especificado'}</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Detalles del proyecto</h4>
                <p><strong>Tipo:</strong> {formData.projectType}</p>
                <p><strong>Timeline:</strong> {formData.timeline}</p>
                <p><strong>Presupuesto:</strong> {formData.budget}</p>
                <p><strong>Funcionalidades:</strong> {formData.features.join(', ') || 'Ninguna seleccionada'}</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Objetivos y audiencia</h4>
                <p><strong>Objetivos:</strong> {formData.mainGoals}</p>
                <p><strong>Público objetivo:</strong> {formData.targetAudience}</p>
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getStepTitle()}</CardTitle>
          <Button onClick={saveProgress} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        <p className="text-sm text-muted-foreground">Paso {currentStep} de {totalSteps}</p>
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
