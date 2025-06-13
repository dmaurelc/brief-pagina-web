
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
  const lineHeight = 6;
  const sectionSpacing = 12;
  const leftMargin = 20;
  const rightMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - leftMargin - rightMargin;
  
  // Color scheme
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#64748b'; // Gray
  const accentColor = '#f8fafc'; // Light gray for backgrounds

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper function to add wrapped text with better formatting
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10, fontWeight = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontWeight);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Header with professional design
  const addHeader = () => {
    // Header background
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("BRIEF PARA DESARROLLO WEB", leftMargin, 22);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Solicitud de presupuesto web personalizado", leftMargin, 30);
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    yPosition = 50;
  };

  // Section header function
  const addSectionHeader = (title: string, icon?: string) => {
    checkPageBreak(20);
    
    // Section background
    doc.setFillColor(248, 250, 252); // Light gray
    doc.rect(leftMargin - 5, yPosition - 8, maxWidth + 10, 18, 'F');
    
    // Section border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(leftMargin - 5, yPosition - 8, leftMargin + maxWidth + 5, yPosition - 8);
    
    // Section title
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, leftMargin, yPosition);
    
    yPosition += 20;
    doc.setTextColor(0, 0, 0);
  };

  // Add data row with label and value
  const addDataRow = (label: string, value: string, isHighlight = false) => {
    checkPageBreak(15);
    
    if (isHighlight) {
      doc.setFillColor(254, 249, 195); // Light yellow background
      doc.rect(leftMargin - 5, yPosition - 5, maxWidth + 10, 12, 'F');
    }
    
    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // Gray color
    doc.text(label + ":", leftMargin, yPosition);
    
    // Value
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    yPosition = addWrappedText(value || 'No especificado', leftMargin, yPosition + 8, maxWidth, 9);
    yPosition += 8;
  };

  // Add list items with bullets
  const addListItems = (items: string[], title: string) => {
    if (items && items.length > 0) {
      checkPageBreak(20 + items.length * 8);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(title + ":", leftMargin, yPosition);
      yPosition += 10;
      
      // Create a bordered area for the list
      const listHeight = items.length * 8 + 10;
      doc.setFillColor(249, 250, 251);
      doc.rect(leftMargin + 10, yPosition - 5, maxWidth - 20, listHeight, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(leftMargin + 10, yPosition - 5, maxWidth - 20, listHeight);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      items.forEach((item, index) => {
        // Bullet point
        doc.setFontSize(8);
        doc.text("•", leftMargin + 15, yPosition);
        
        // Item text
        doc.setFontSize(9);
        yPosition = addWrappedText(item, leftMargin + 20, yPosition, maxWidth - 30, 9);
        yPosition += 2;
      });
      
      yPosition += 10;
    }
  };

  // Start generating the PDF
  addHeader();

  // Date and ID section
  const fecha = new Date(briefData.created_at).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de generación: ${fecha}`, leftMargin, yPosition);
  yPosition += 15;

  // INFORMACIÓN DE LA EMPRESA
  addSectionHeader("INFORMACIÓN DE LA EMPRESA");
  
  // Create a table-like structure for company info
  doc.setFillColor(255, 255, 255);
  doc.rect(leftMargin, yPosition - 5, maxWidth, 60, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(leftMargin, yPosition - 5, maxWidth, 60);
  
  addDataRow("Empresa", briefData.company_name, true);
  addDataRow("Persona de contacto", briefData.contact_name);
  addDataRow("Email de contacto", briefData.email);
  addDataRow("Teléfono", briefData.phone || 'No proporcionado');
  addDataRow("Industria/Sector", briefData.industry);
  
  yPosition += 10;

  // DETALLES DEL PROYECTO
  addSectionHeader("DETALLES DEL PROYECTO");
  
  addDataRow("Tipo de proyecto", briefData.project_type, true);
  addDataRow("Descripción detallada", briefData.project_description);
  addDataRow("Timeline esperado", briefData.timeline);
  
  // Pages and features as formatted lists
  addListItems(briefData.pages || [], "Páginas requeridas");
  addListItems(briefData.features || [], "Funcionalidades requeridas");

  // PRESUPUESTO Y OBJETIVOS
  addSectionHeader("PRESUPUESTO Y OBJETIVOS");
  
  addDataRow("Presupuesto disponible", getBudgetLabel(briefData.budget), true);
  addDataRow("Objetivos principales", briefData.main_goals);
  addDataRow("Público objetivo", briefData.target_audience);

  // INFORMACIÓN TÉCNICA Y ADICIONAL
  addSectionHeader("INFORMACIÓN TÉCNICA Y ADICIONAL");
  
  addDataRow("Sitio web actual", briefData.existing_website || 'No tiene sitio web actual');
  addDataRow("Sitios de referencia/competencia", briefData.competitor_websites || 'No especificado');
  addDataRow("Preferencias de diseño", briefData.design_preferences || 'No especificado');
  addDataRow("Notas adicionales", briefData.additional_notes || 'Ninguna nota adicional');

  // Footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    
    // Footer line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, footerY - 10, leftMargin + maxWidth, footerY - 10);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("DMaurel - Desarrollo Web Profesional", leftMargin, footerY - 5);
    doc.text("www.dmaurel.cl | contacto@dmaurel.cl", leftMargin, footerY);
    
    // Page number
    const pageCount = doc.internal.getNumberOfPages();
    const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
    doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - rightMargin - 30, footerY);
  };

  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter();
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

    console.log('Generando PDF mejorado para brief:', briefId);

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

    console.log('PDF mejorado generado y subido exitosamente:', urlData.publicUrl);

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
