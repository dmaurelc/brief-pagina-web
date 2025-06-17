
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useAutoSave } from './useAutoSave';
import type { Database } from '@/integrations/supabase/types';

type BriefStatus = Database['public']['Enums']['brief_status'];

interface BriefFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  projectType: string;
  projectDescription: string;
  features: string[];
  budget: string;
  timeline: string;
  pages: string[];
  targetAudience: string;
  mainGoals: string;
  existingWebsite: string;
  competitorWebsites: string;
  designPreferences: string;
  additionalNotes: string;
}

export const useBriefData = () => {
  const { user } = useUser();
  const [existingBrief, setExistingBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialFormData, setInitialFormData] = useState<BriefFormData | null>(null);

  const getBaseFormData = useCallback((): BriefFormData => ({
    companyName: '',
    contactName: '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    industry: '',
    projectType: '',
    projectDescription: '',
    features: [],
    budget: '',
    timeline: '',
    pages: [],
    targetAudience: '',
    mainGoals: '',
    existingWebsite: '',
    competitorWebsites: '',
    designPreferences: '',
    additionalNotes: ''
  }), [user?.emailAddresses]);

  const getInitialFormData = useCallback((): BriefFormData => {
    if (initialFormData) {
      return initialFormData;
    }

    const baseData = getBaseFormData();

    // Si hay un brief existente, precargar los datos
    if (existingBrief) {
      return {
        companyName: existingBrief.company_name || '',
        contactName: existingBrief.contact_name || '',
        email: existingBrief.email || baseData.email,
        phone: existingBrief.phone || '',
        industry: existingBrief.industry || '',
        projectType: existingBrief.project_type || '',
        projectDescription: existingBrief.project_description || '',
        features: existingBrief.features || [],
        budget: existingBrief.budget || '',
        timeline: existingBrief.timeline || '',
        pages: existingBrief.pages || [],
        targetAudience: existingBrief.target_audience || '',
        mainGoals: existingBrief.main_goals || '',
        existingWebsite: existingBrief.existing_website || '',
        competitorWebsites: existingBrief.competitor_websites || '',
        designPreferences: existingBrief.design_preferences || '',
        additionalNotes: existingBrief.additional_notes || ''
      };
    }

    return baseData;
  }, [existingBrief, initialFormData, getBaseFormData]);

  useEffect(() => {
    const loadExistingBrief = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando brief existente para:', user.emailAddresses[0].emailAddress);
        
        // Buscar briefs no enviados (incompletos) primero - usando estados válidos excepto 'completed'
        const { data: incompleteBriefs, error: incompleteError } = await supabase
          .from('briefs')
          .select('*')
          .eq('email', user.emailAddresses[0].emailAddress)
          .not('status', 'eq', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (incompleteError) {
          console.error('Error buscando briefs incompletos:', incompleteError);
        } else if (incompleteBriefs && incompleteBriefs.length > 0) {
          console.log('Brief incompleto encontrado:', incompleteBriefs[0]);
          setExistingBrief(incompleteBriefs[0]);
          setLoading(false);
          return;
        }

        // Si no hay briefs incompletos, comenzar desde cero
        console.log('No se encontraron briefs incompletos, empezando formulario nuevo');
        setExistingBrief(null);
      } catch (error) {
        console.error('Error inesperado cargando brief:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingBrief();
  }, [user]);

  const saveBrief = useCallback(async (formData: BriefFormData) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const briefData = {
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: user.emailAddresses[0].emailAddress,
        phone: formData.phone || null,
        industry: formData.industry,
        project_type: formData.projectType,
        project_description: formData.projectDescription,
        features: formData.features,
        budget: formData.budget,
        timeline: formData.timeline,
        pages: formData.pages,
        target_audience: formData.targetAudience,
        main_goals: formData.mainGoals,
        existing_website: formData.existingWebsite || null,
        competitor_websites: formData.competitorWebsites || null,
        design_preferences: formData.designPreferences || null,
        additional_notes: formData.additionalNotes || null,
        status: 'completed' as BriefStatus
      };

      console.log('Guardando brief con datos:', briefData);

      if (existingBrief) {
        // Actualizar brief existente
        console.log('Actualizando brief existente:', existingBrief.id);
        const { data, error } = await supabase
          .from('briefs')
          .update(briefData)
          .eq('id', existingBrief.id)
          .select();

        if (error) {
          console.error('Error actualizando brief:', error);
          throw new Error(`Error actualizando brief: ${error.message}`);
        }
        
        console.log('Brief actualizado exitosamente:', data);
        return data;
      } else {
        // Crear nuevo brief
        console.log('Creando nuevo brief');
        const { data, error } = await supabase
          .from('briefs')
          .insert(briefData)
          .select();

        if (error) {
          console.error('Error creando brief:', error);
          throw new Error(`Error creando brief: ${error.message}`);
        }
        
        console.log('Brief creado exitosamente:', data);
        setExistingBrief(data[0]); // Guardar el brief recién creado
        return data;
      }
    } catch (error) {
      console.error('Error en saveBrief:', error);
      throw error;
    }
  }, [user, existingBrief]);

  // Función para combinar datos locales con datos de la base de datos
  const initializeFormWithLocalData = useCallback((localData: BriefFormData) => {
    console.log('Inicializando formulario con datos locales:', localData);
    setInitialFormData(localData);
  }, []);

  return {
    existingBrief,
    loading,
    getInitialFormData,
    saveBrief,
    hasExistingBrief: !!existingBrief,
    initializeFormWithLocalData
  };
};
