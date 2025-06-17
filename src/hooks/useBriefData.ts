
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

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

  const getInitialFormData = (): BriefFormData => {
    const baseData = {
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
    };

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
  };

  useEffect(() => {
    const loadExistingBrief = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando brief existente para:', user.emailAddresses[0].emailAddress);
        
        // Buscar el brief más reciente del usuario
        const { data: briefs, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('email', user.emailAddresses[0].emailAddress)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error cargando brief existente:', error);
        } else if (briefs && briefs.length > 0) {
          console.log('Brief existente encontrado:', briefs[0]);
          setExistingBrief(briefs[0]);
        } else {
          console.log('No se encontró brief existente');
        }
      } catch (error) {
        console.error('Error inesperado cargando brief:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingBrief();
  }, [user]);

  const saveBrief = async (formData: BriefFormData) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      throw new Error('Usuario no autenticado');
    }

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
      additional_notes: formData.additionalNotes || null
    };

    if (existingBrief) {
      // Actualizar brief existente
      console.log('Actualizando brief existente:', existingBrief.id);
      const { data, error } = await supabase
        .from('briefs')
        .update(briefData)
        .eq('id', existingBrief.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      // Crear nuevo brief
      console.log('Creando nuevo brief');
      const { data, error } = await supabase
        .from('briefs')
        .insert(briefData)
        .select();

      if (error) throw error;
      setExistingBrief(data[0]); // Guardar el brief recién creado
      return data;
    }
  };

  return {
    existingBrief,
    loading,
    getInitialFormData,
    saveBrief,
    hasExistingBrief: !!existingBrief
  };
};
