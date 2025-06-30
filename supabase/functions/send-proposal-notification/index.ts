
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProposalNotificationRequest {
  clientEmail: string;
  companyName: string;
  adminNotes?: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📧 Iniciando función send-proposal-notification');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, companyName, adminNotes, fileName }: ProposalNotificationRequest = await req.json();
    
    console.log('📨 Enviando notificación a:', clientEmail);
    console.log('🏢 Empresa:', companyName);
    console.log('📎 Archivo:', fileName);

    // Verificar que tenemos la API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY no encontrada');
      throw new Error('RESEND_API_KEY no configurada');
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">¡Tu Propuesta Está Lista!</h1>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; font-size: 20px;">Hola ${companyName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Nos complace informarte que hemos preparado una propuesta personalizada para tu proyecto web.
            </p>
          </div>

          ${adminNotes ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">Mensaje especial:</h3>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 0;">
                ${adminNotes}
              </p>
            </div>
          ` : ''}

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📎 Propuesta Adjunta</h3>
            <p style="color: #1e40af; font-size: 16px; margin-bottom: 10px;">
              <strong>Archivo:</strong> ${fileName}
            </p>
            <p style="color: #1e40af; font-size: 16px; margin-bottom: 0;">
              Puedes acceder a tu propuesta directamente desde tu panel de usuario en nuestra plataforma.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://brief-pagina-web.lovable.app'}/my-account" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Ver Mi Propuesta
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Si tienes alguna pregunta sobre la propuesta, no dudes en contactarnos respondiendo a este email.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              <strong>Diego Maurel</strong><br>
              Desarrollador Web Full Stack<br>
              <a href="https://dmaurel.cl" style="color: #2563eb;">dmaurel.cl</a>
            </p>
          </div>
        </div>
      </div>
    `;

    console.log('📤 Enviando email via Resend con dominio dmaurel.cl...');

    const emailResponse = await resend.emails.send({
      from: "Diego Maurel <noreply@dmaurel.cl>",
      to: [clientEmail],
      subject: `¡Tu propuesta para ${companyName} está lista! 🎉`,
      html: emailHtml,
    });

    console.log('📧 Respuesta de Resend:', emailResponse);

    if (emailResponse.error) {
      console.error('❌ Error en Resend:', emailResponse.error);
      throw new Error(`Error de Resend: ${emailResponse.error.message}`);
    }

    console.log('✅ Email enviado exitosamente desde dmaurel.cl');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email enviado correctamente desde dmaurel.cl',
        emailId: emailResponse.data?.id,
        recipient: clientEmail,
        company: companyName
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('💥 Error en send-proposal-notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Error procesando notificación',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
