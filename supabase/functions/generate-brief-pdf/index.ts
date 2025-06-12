
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry: string;
  project_type: string;
  project_description: string;
  pages: string[];
  features: string[];
  timeline: string;
  budget: string;
  main_goals: string;
  target_audience: string;
  existing_website?: string;
  competitor_websites?: string;
  design_preferences?: string;
  additional_notes?: string;
  created_at: string;
}

const getBudgetLabel = (budgetValue: string) => {
  const budgetLabels: { [key: string]: string } = {
    'menos-300000': 'Menos de $300.000 CLP',
    '300000-500000': 'Entre $300.000 - $500.000 CLP',
    '500000-800000': 'Entre $500.000 - $800.000 CLP',
    '800000-1000000': 'Entre $800.000 - $1.000.000 CLP',
    'mas-1000000': 'Más de $1.000.000 CLP',
    'por-definir': 'Por definir'
  };
  return budgetLabels[budgetValue] || budgetValue;
};

const generatePDF = (briefData: BriefData): Uint8Array => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const sectionSpacing = 15;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - 40;

  // Función helper para añadir texto con wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Título principal
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BRIEF PARA DESARROLLO WEB", leftMargin, yPosition);
  yPosition += sectionSpacing;

  // Fecha
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const fecha = new Date(briefData.created_at).toLocaleDateString('es-CL');
  doc.text(`Fecha: ${fecha}`, leftMargin, yPosition);
  yPosition += sectionSpacing;

  // INFORMACIÓN DE LA EMPRESA
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DE LA EMPRESA", leftMargin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  yPosition = addWrappedText(`Empresa: ${briefData.company_name}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Contacto: ${briefData.contact_name}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Email: ${briefData.email}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Teléfono: ${briefData.phone || 'No especificado'}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Industria: ${briefData.industry}`, leftMargin, yPosition, maxWidth);
  yPosition += sectionSpacing;

  // DETALLES DEL PROYECTO
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL PROYECTO", leftMargin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  yPosition = addWrappedText(`Tipo de proyecto: ${briefData.project_type}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Descripción: ${briefData.project_description}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Timeline: ${briefData.timeline}`, leftMargin, yPosition, maxWidth);
  
  if (briefData.pages && briefData.pages.length > 0) {
    yPosition = addWrappedText(`Páginas requeridas: ${briefData.pages.join(', ')}`, leftMargin, yPosition, maxWidth);
  }
  
  if (briefData.features && briefData.features.length > 0) {
    yPosition = addWrappedText(`Funcionalidades: ${briefData.features.join(', ')}`, leftMargin, yPosition, maxWidth);
  }
  yPosition += sectionSpacing;

  // Verificar si necesitamos una nueva página
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // PRESUPUESTO Y OBJETIVOS
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PRESUPUESTO Y OBJETIVOS", leftMargin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  yPosition = addWrappedText(`Presupuesto: ${getBudgetLabel(briefData.budget)}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Objetivos principales: ${briefData.main_goals}`, leftMargin, yPosition, maxWidth);
  yPosition = addWrappedText(`Público objetivo: ${briefData.target_audience}`, leftMargin, yPosition, maxWidth);
  yPosition += sectionSpacing;

  // INFORMACIÓN TÉCNICA
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN TÉCNICA", leftMargin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  yPosition = addWrappedText(`Sitio web actual: ${briefData.existing_website || 'No tiene sitio web actual'}`, leftMargin, yPosition, maxWidth);
  
  if (briefData.competitor_websites) {
    yPosition = addWrappedText(`Sitios de referencia: ${briefData.competitor_websites}`, leftMargin, yPosition, maxWidth);
  }
  
  if (briefData.design_preferences) {
    yPosition = addWrappedText(`Preferencias de diseño: ${briefData.design_preferences}`, leftMargin, yPosition, maxWidth);
  }
  
  if (briefData.additional_notes) {
    yPosition = addWrappedText(`Notas adicionales: ${briefData.additional_notes}`, leftMargin, yPosition, maxWidth);
  }

  return doc.output('arraybuffer') as Uint8Array;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { briefId } = await req.json();
    
    if (!briefId) {
      throw new Error('Brief ID is required');
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener los datos del brief
    const { data: briefData, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single();

    if (error) {
      console.error('Error obteniendo brief:', error);
      throw new Error('Error al obtener los datos del brief');
    }

    console.log('Generando PDF para brief:', briefId);

    // Generar el PDF
    const pdfBuffer = generatePDF(briefData);

    // Subir el PDF a Supabase Storage
    const fileName = `brief-${briefData.company_name.replace(/[^a-zA-Z0-9]/g, '-')}-${briefId}.pdf`;
    const filePath = `briefs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brief-pdfs')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error subiendo PDF:', uploadError);
      throw new Error('Error al subir el PDF');
    }

    // Obtener la URL pública del PDF
    const { data: urlData } = supabase.storage
      .from('brief-pdfs')
      .getPublicUrl(filePath);

    console.log('PDF generado y subido exitosamente:', urlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl: urlData.publicUrl,
        fileName: fileName
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error en generate-brief-pdf:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
