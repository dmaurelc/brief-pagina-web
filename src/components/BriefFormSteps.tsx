
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Briefcase, DollarSign, Settings } from 'lucide-react';

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  projectType: string;
  projectDescription: string;
  pages: string[];
  features: string[];
  timeline: string;
  budget: string;
  mainGoals: string;
  targetAudience: string;
  existingWebsite: string;
  competitorWebsites: string;
  designPreferences: string;
  additionalNotes: string;
}

interface BriefFormStepsProps {
  currentStep: number;
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | string[]) => void;
  handlePageToggle: (page: string, checked: boolean) => void;
  handleFeatureToggle: (feature: string, checked: boolean) => void;
  getInputClassName: (fieldName: keyof FormData) => string;
  getLabelClassName: (fieldName: keyof FormData) => string;
  getBudgetLabel: (budgetValue: string) => string;
}

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

const pagesOptions = [
  'Inicio',
  'Nosotros',
  'Servicios',
  'Productos',
  'Soluciones',
  'Portafolio',
  'Blog',
  'Noticias',
  'Contacto',
  'Términos y Condiciones',
  'Política de Privacidad'
];

const featuresOptions = [
  'Galería de imágenes',
  'Múlti lenguaje',
  'Integración con Newsletter',
  'Preguntas Frecuentes',
  'Testimonios de Clientes',
  'Clientes o Partners',
  'Chat en vivo',
  'Chatbot con IA'
];

export const BriefFormSteps: React.FC<BriefFormStepsProps> = ({
  currentStep,
  formData,
  updateFormData,
  handlePageToggle,
  handleFeatureToggle,
  getInputClassName,
  getLabelClassName,
  getBudgetLabel
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName" className={getLabelClassName('companyName')}>
                Nombre de la empresa *
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                placeholder="Ej: Mi Empresa S.A."
                className={getInputClassName('companyName')}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactName" className={getLabelClassName('contactName')}>
                Nombre de contacto *
              </Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateFormData('contactName', e.target.value)}
                placeholder="Tu nombre completo"
                className={getInputClassName('contactName')}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className={getLabelClassName('email')}>
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="tu@empresa.com"
                className={getInputClassName('email')}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className={getLabelClassName('phone')}>
                Teléfono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                className={getInputClassName('phone')}
                required
              />
            </div>
            <div>
              <Label htmlFor="industry" className={getLabelClassName('industry')}>
                Industria/Sector *
              </Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => updateFormData('industry', value)}
              >
                <SelectTrigger className={getInputClassName('industry')}>
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
          <div className="space-y-6">
            <div>
              <Label htmlFor="projectType" className={getLabelClassName('projectType')}>
                Tipo de proyecto *
              </Label>
              <Select 
                value={formData.projectType} 
                onValueChange={(value) => updateFormData('projectType', value)}
              >
                <SelectTrigger className={getInputClassName('projectType')}>
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
              <Label htmlFor="projectDescription" className={getLabelClassName('projectDescription')}>
                Descripción del proyecto *
              </Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => updateFormData('projectDescription', e.target.value)}
                placeholder="Describe en detalle qué necesitas..."
                rows={4}
                className={getInputClassName('projectDescription')}
                required
              />
            </div>

            <div>
              <Label className={getLabelClassName('pages')}>
                Páginas requeridas * (mínimo 4)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {pagesOptions.map((page) => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={page}
                      checked={(formData.pages || []).includes(page)}
                      onCheckedChange={(checked) => handlePageToggle(page, checked as boolean)}
                    />
                    <Label htmlFor={page} className="text-sm cursor-pointer">
                      {page}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>
                Funcionalidades (opcional)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {featuresOptions.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={(formData.features || []).includes(feature)}
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
              <Label htmlFor="timeline" className={getLabelClassName('timeline')}>
                Timeline esperado *
              </Label>
              <Select 
                value={formData.timeline} 
                onValueChange={(value) => updateFormData('timeline', value)}
              >
                <SelectTrigger className={getInputClassName('timeline')}>
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
              <Label htmlFor="budget" className={getLabelClassName('budget')}>
                Presupuesto disponible *
              </Label>
              <Select 
                value={formData.budget} 
                onValueChange={(value) => updateFormData('budget', value)}
              >
                <SelectTrigger className={getInputClassName('budget')}>
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
              <Label htmlFor="mainGoals" className={getLabelClassName('mainGoals')}>
                Objetivos principales del sitio web *
              </Label>
              <Textarea
                id="mainGoals"
                value={formData.mainGoals}
                onChange={(e) => updateFormData('mainGoals', e.target.value)}
                placeholder="¿Qué esperas lograr con el sitio web? (generar leads, ventas, branding, etc.)"
                rows={3}
                className={getInputClassName('mainGoals')}
                required
              />
            </div>
            <div>
              <Label htmlFor="targetAudience" className={getLabelClassName('targetAudience')}>
                Público objetivo *
              </Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Describe a tu audiencia ideal (edad, intereses, comportamiento, etc.)"
                rows={3}
                className={getInputClassName('targetAudience')}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="existingWebsite" className={getLabelClassName('existingWebsite')}>
                Sitio web actual *
              </Label>
              <Input
                id="existingWebsite"
                type="url"
                value={formData.existingWebsite}
                onChange={(e) => updateFormData('existingWebsite', e.target.value)}
                placeholder="https://www.tusitio.com (o escribe 'No tengo' si no tienes)"
                className={getInputClassName('existingWebsite')}
                required
              />
            </div>
            <div>
              <Label htmlFor="competitorWebsites" className={getLabelClassName('competitorWebsites')}>
                Sitios web de competencia *
              </Label>
              <Textarea
                id="competitorWebsites"
                value={formData.competitorWebsites}
                onChange={(e) => updateFormData('competitorWebsites', e.target.value)}
                placeholder="URLs de sitios que te gustan o son tu competencia"
                rows={3}
                className={getInputClassName('competitorWebsites')}
                required
              />
            </div>
            <div>
              <Label htmlFor="designPreferences" className={getLabelClassName('designPreferences')}>
                Preferencias de diseño *
              </Label>
              <Textarea
                id="designPreferences"
                value={formData.designPreferences}
                onChange={(e) => updateFormData('designPreferences', e.target.value)}
                placeholder="Colores, estilo, elementos que te gustan o no..."
                rows={3}
                className={getInputClassName('designPreferences')}
                required
              />
            </div>
            <div>
              <Label htmlFor="additionalNotes" className={getLabelClassName('additionalNotes')}>
                Notas adicionales *
              </Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                placeholder="Cualquier información adicional relevante"
                rows={3}
                className={getInputClassName('additionalNotes')}
                required
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-2">Resumen de tu Brief</h3>
              <p className="text-muted-foreground mb-8">
                Revisa toda la información antes de enviar. Recibirás una respuesta en las próximas 24 horas.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Información de la empresa */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Building className="w-5 h-5 text-primary mr-2" />
                  <h4 className="text-lg font-medium">Información de la empresa</h4>
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
                  <h4 className="text-lg font-medium">Detalles del proyecto</h4>
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
                    <span className="text-sm font-medium text-muted-foreground">Páginas requeridas:</span>
                    <div className="mt-1">
                      {(formData.pages || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(formData.pages || []).map((page, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {page}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Ninguna página seleccionada</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Funcionalidades requeridas:</span>
                    <div className="mt-1">
                      {(formData.features || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(formData.features || []).map((feature, index) => (
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
                  <h4 className="text-lg font-medium">Presupuesto y objetivos</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Presupuesto disponible:</span>
                    <p className="text-sm mt-1">{getBudgetLabel(formData.budget) || 'No especificado'}</p>
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
                  <h4 className="text-lg font-medium">Información técnica</h4>
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

  return renderStep();
};

export default BriefFormSteps;
