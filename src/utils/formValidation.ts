
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

// Zod schema para validación del formulario
export const briefFormSchema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es requerido'),
  contact_name: z.string().min(1, 'El nombre de contacto es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  industry: z.string().min(1, 'La industria es requerida'),
  project_type: z.string().min(1, 'El tipo de proyecto es requerido'),
  project_description: z.string().min(1, 'La descripción del proyecto es requerida'),
  pages: z.array(z.string()).min(1, 'Debes seleccionar al menos una página'),
  features: z.array(z.string()).default([]),
  timeline: z.string().min(1, 'El timeline es requerido'),
  budget: z.string().min(1, 'El presupuesto es requerido'),
  main_goals: z.string().min(1, 'Los objetivos principales son requeridos'),
  target_audience: z.string().min(1, 'El público objetivo es requerido'),
  existing_website: z.string().optional(),
  competitor_websites: z.string().optional(),
  design_preferences: z.string().optional(),
  additional_notes: z.string().optional(),
});

// Tipo derivado del schema
export type BriefFormData = z.infer<typeof briefFormSchema>;

// Schemas para validación por paso
export const step1Schema = briefFormSchema.pick({
  company_name: true,
  contact_name: true,
  email: true,
  phone: true,
  industry: true,
});

export const step2Schema = briefFormSchema.pick({
  project_type: true,
  project_description: true,
  pages: true,
  features: true,
  timeline: true,
});

export const step3Schema = briefFormSchema.pick({
  budget: true,
  main_goals: true,
  target_audience: true,
});

export const step4Schema = briefFormSchema.pick({
  existing_website: true,
  competitor_websites: true,
  design_preferences: true,
  additional_notes: true,
});

// Función para validar un paso específico
export const validateStep = (step: number, data: BriefFormData) => {
  try {
    switch (step) {
      case 1:
        step1Schema.parse(data);
        return { success: true, errors: {} };
      case 2:
        step2Schema.parse(data);
        return { success: true, errors: {} };
      case 3:
        step3Schema.parse(data);
        return { success: true, errors: {} };
      case 4:
        step4Schema.parse(data);
        return { success: true, errors: {} };
      default:
        return { success: true, errors: {} };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: {} };
  }
};

// Funciones de guardado automático
const STORAGE_KEY = 'brief_form_draft';

export const saveDraft = (data: Partial<BriefFormData>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando borrador:', error);
  }
};

export const loadDraft = (): Partial<BriefFormData> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error cargando borrador:', error);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error eliminando borrador:', error);
  }
};

// Field labels para mostrar en el resumen
export const fieldLabels: Record<keyof BriefFormData, string> = {
  company_name: 'Nombre de la empresa',
  contact_name: 'Nombre de contacto',
  email: 'Email',
  phone: 'Teléfono',
  industry: 'Industria/Sector',
  project_type: 'Tipo de proyecto',
  project_description: 'Descripción del proyecto',
  pages: 'Páginas requeridas',
  features: 'Funcionalidades deseadas',
  timeline: 'Timeline esperado',
  budget: 'Presupuesto estimado',
  main_goals: 'Objetivos principales',
  target_audience: 'Público objetivo',
  existing_website: 'Sitio web existente',
  competitor_websites: 'Sitios web de competencia',
  design_preferences: 'Preferencias de diseño',
  additional_notes: 'Notas adicionales'
};
