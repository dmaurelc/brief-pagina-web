
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { fieldLabels, type BriefFormData } from '@/utils/formValidation';

interface SummaryStepProps {
  formData: BriefFormData;
  onEdit: (step: number) => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ formData, onEdit }) => {
  const formatValue = (key: keyof BriefFormData, value: any) => {
    if (!value) return 'No especificado';
    
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Ninguno seleccionado';
    }
    
    if (key === 'project_type') {
      const types = {
        'nuevo': 'Sitio web nuevo',
        'rediseño': 'Rediseño de sitio web existente',
        'e-commerce': 'Tienda online (E-commerce)',
        'landing-page': 'Landing Page',
        'otro': 'Otro'
      };
      return types[value as keyof typeof types] || value;
    }
    
    if (key === 'timeline') {
      const timelines = {
        'urgente': 'Urgente (1-2 semanas)',
        'moderado': 'Moderado (2-4 semanas)',
        'flexible': 'Flexible (1-2 meses)',
        'sin-prisa': 'Sin prisa (+2 meses)'
      };
      return timelines[value as keyof typeof timelines] || value;
    }
    
    if (key === 'budget') {
      const budgets = {
        'bajo': 'Bajo (menos de $500 USD)',
        'medio': 'Medio ($500 - $2000 USD)',
        'alto': 'Alto ($2000 - $5000 USD)',
        'muy-alto': 'Muy alto (más de $5000 USD)'
      };
      return budgets[value as keyof typeof budgets] || value;
    }
    
    return value;
  };

  const sections = [
    {
      title: 'Información de la empresa',
      step: 1,
      fields: ['company_name', 'contact_name', 'email', 'phone', 'industry'] as (keyof BriefFormData)[]
    },
    {
      title: 'Información del proyecto',
      step: 2,
      fields: ['project_type', 'project_description', 'pages', 'features', 'timeline'] as (keyof BriefFormData)[]
    },
    {
      title: 'Presupuesto y objetivos',
      step: 3,
      fields: ['budget', 'main_goals', 'target_audience'] as (keyof BriefFormData)[]
    },
    {
      title: 'Información técnica',
      step: 4,
      fields: ['existing_website', 'competitor_websites', 'design_preferences', 'additional_notes'] as (keyof BriefFormData)[]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Resumen de tu solicitud</h3>
        <p className="text-muted-foreground">Revisa la información antes de enviar</p>
      </div>
      
      {sections.map((section) => (
        <Card key={section.step}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{section.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(section.step - 1)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.fields.map((field) => {
              const value = formData[field];
              if (!value || (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              
              return (
                <div key={field} className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {fieldLabels[field]}
                  </span>
                  <div className="text-sm">
                    {Array.isArray(value) && value.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                          <Badge key={index} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span>{formatValue(field, value)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryStep;
