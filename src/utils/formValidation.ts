
import { toast } from '@/hooks/use-toast';

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

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
}

// Define required fields for each step
export const getRequiredFieldsByStep = (step: number): (keyof FormData)[] => {
  switch (step) {
    case 1:
      return ['companyName', 'contactName', 'email', 'industry'];
    case 2:
      return ['projectType', 'projectDescription', 'timeline'];
    case 3:
      return ['budget', 'mainGoals', 'targetAudience'];
    case 4:
      return []; // All fields are optional in step 4
    case 5:
      return []; // Step 5 is just review
    default:
      return [];
  }
};

// Field labels for user-friendly error messages
export const fieldLabels: Record<keyof FormData, string> = {
  companyName: 'Nombre de la empresa',
  contactName: 'Nombre de contacto',
  email: 'Email',
  phone: 'Teléfono',
  industry: 'Industria/Sector',
  projectType: 'Tipo de proyecto',
  projectDescription: 'Descripción del proyecto',
  pages: 'Páginas requeridas',
  features: 'Funcionalidades requeridas',
  timeline: 'Timeline esperado',
  budget: 'Presupuesto disponible',
  mainGoals: 'Objetivos principales',
  targetAudience: 'Público objetivo',
  existingWebsite: 'Sitio web actual',
  competitorWebsites: 'Sitios web de competencia',
  designPreferences: 'Preferencias de diseño',
  additionalNotes: 'Notas adicionales'
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate current step
export const validateCurrentStep = (formData: FormData, currentStep: number): ValidationResult => {
  const requiredFields = getRequiredFieldsByStep(currentStep);
  const missingFields: string[] = [];

  // Check for empty required fields
  requiredFields.forEach(field => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(fieldLabels[field]);
    }
  });

  // Special validation for email format (only if email is filled)
  if (currentStep === 1 && formData.email && !isValidEmail(formData.email)) {
    return {
      isValid: false,
      missingFields: [],
      errorMessage: 'Por favor, ingresa una dirección de email válida.'
    };
  }

  if (missingFields.length > 0) {
    const errorMessage = `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`;
    
    toast({
      title: "Campos requeridos",
      description: errorMessage,
      variant: "destructive"
    });

    return {
      isValid: false,
      missingFields,
      errorMessage
    };
  }

  return {
    isValid: true,
    missingFields: []
  };
};

// Validate all required fields before submission
export const validateAllRequiredFields = (formData: FormData): ValidationResult => {
  const allRequiredFields: (keyof FormData)[] = [
    ...getRequiredFieldsByStep(1),
    ...getRequiredFieldsByStep(2),
    ...getRequiredFieldsByStep(3)
  ];

  const missingFields: string[] = [];

  allRequiredFields.forEach(field => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(fieldLabels[field]);
    }
  });

  // Email format validation
  if (formData.email && !isValidEmail(formData.email)) {
    return {
      isValid: false,
      missingFields: [],
      errorMessage: 'Por favor, ingresa una dirección de email válida.'
    };
  }

  if (missingFields.length > 0) {
    const errorMessage = `Para enviar el brief, debes completar todos los campos obligatorios: ${missingFields.join(', ')}`;
    
    toast({
      title: "Brief incompleto",
      description: errorMessage,
      variant: "destructive"
    });

    return {
      isValid: false,
      missingFields,
      errorMessage
    };
  }

  return {
    isValid: true,
    missingFields: []
  };
};

// Get the first step with missing required fields
export const getFirstIncompleteStep = (formData: FormData): number => {
  for (let step = 1; step <= 3; step++) {
    const validation = validateCurrentStep(formData, step);
    if (!validation.isValid) {
      return step;
    }
  }
  return 1; // Default to first step if all are complete
};

// Check if a specific field has an error
export const hasFieldError = (formData: FormData, fieldName: keyof FormData, currentStep: number): boolean => {
  const requiredFields = getRequiredFieldsByStep(currentStep);
  if (!requiredFields.includes(fieldName)) {
    return false;
  }

  const value = formData[fieldName];
  return !value || (typeof value === 'string' && value.trim() === '');
};
