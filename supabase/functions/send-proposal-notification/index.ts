
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  clientEmail: string;
  companyName: string;
  adminNotes?: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, companyName, adminNotes, fileName }: NotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "DMaurel <noreply@dmaurel.com>",
      to: [clientEmail],
      subject: `Propuesta comercial lista para ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Tu propuesta está lista</h1>
            <p style="color: #666; font-size: 16px;">¡Hemos preparado una propuesta personalizada para ${companyName}!</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Detalles de tu propuesta</h2>
            <p style="margin-bottom: 10px;"><strong>Empresa:</strong> ${companyName}</p>
            <p style="margin-bottom: 10px;"><strong>Archivo:</strong> ${fileName}</p>
            ${adminNotes ? `<p style="margin-bottom: 10px;"><strong>Nota del equipo:</strong></p><p style="color: #666; font-style: italic;">${adminNotes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 20px;">
              Hemos adjuntado tu propuesta comercial personalizada. Por favor revísala y no dudes en contactarnos si tienes alguna pregunta.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 14px;">
              DMaurel - Desarrollo Web Profesional<br>
              <a href="mailto:contacto@dmaurel.com" style="color: #666;">contacto@dmaurel.com</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-proposal-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
