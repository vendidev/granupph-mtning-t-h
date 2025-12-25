import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@example.com";

interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pickup_date: string;
  time_preference: string;
  additional_info?: string;
}

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  try {
    // Log request method and headers for debugging
    console.log("Request method:", req.method);
    console.log("Content-Type:", req.headers.get("content-type"));
    console.log("URL:", req.url);
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only handle POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Get the booking data from the request
    let booking: BookingData;
    try {
      // Try to get body as text first
      const bodyText = await req.text();
      console.log("Body text length:", bodyText?.length || 0);
      console.log("Body text preview:", bodyText?.substring(0, 200));
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return new Response(
          JSON.stringify({ error: "Request body is empty" }),
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders,
            } 
          }
        );
      }
      
      booking = JSON.parse(bodyText);
      console.log("Parsed booking data:", { 
        email: booking.email, 
        name: booking.name,
        pickup_date: booking.pickup_date 
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", details: parseError.message }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    if (!booking.email) {
      console.error("Missing email in booking data");
      return new Response(
        JSON.stringify({ error: "Missing email in booking data" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Resend API key is not configured" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Format the pickup date
    const pickupDate = new Date(booking.pickup_date).toLocaleDateString("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tack för din bokning!</h1>
            </div>
            <div class="content">
              <p>Hej ${booking.name},</p>
              
              <h2 style="color: #2d5016; margin-top: 20px; margin-bottom: 15px;">Tack för din bokning!</h2>
              
              <p>Vi ser framemot att hämta din gran!</p>
              
              <p style="margin-top: 20px; margin-bottom: 10px;"><strong>För att underlätta vid upphämtningen går det bra att betala nu till Alexander Foxér Eriksson</strong></p>
              
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Betala med Swish:</strong></p>
                <p style="margin: 5px 0; font-size: 18px;"><strong>073-852 30 62</strong></p>
                <p style="margin: 5px 0;">Swish-nummer: <strong>@swish-alex</strong></p>
              </div>
              
              <p style="margin-top: 20px;"><strong>Din bokning:</strong></p>
              <div class="info-row">
                <span class="label">Datum:</span> ${pickupDate}
              </div>
              <div class="info-row">
                <span class="label">Tid:</span> ${booking.time_preference}
              </div>
              <div class="info-row">
                <span class="label">Adress:</span> ${booking.address}
              </div>
              ${booking.additional_info ? `
              <div class="info-row">
                <span class="label">Övrig information:</span> ${booking.additional_info}
              </div>
              ` : ''}
              
              <p style="margin-top: 30px;">Med vänliga hälsningar,<br><strong>Granupphämtning i Trollhättan</strong></p>
            </div>
            <div class="footer">
              <p>Detta är ett automatiskt meddelande. Vänligen svara inte på detta e-post.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
    const emailPayload = {
      from: FROM_EMAIL,
      to: [booking.email], // Resend API requires 'to' to be an array
      subject: "Bekräftelse på din bokning - Granupphämtning i Trollhättan",
      html: emailHtml,
    };

    console.log("Sending email to:", booking.email);
    console.log("From email:", FROM_EMAIL);
    console.log("Resend API key present:", !!RESEND_API_KEY);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    console.log("Resend response status:", resendResponse.status);
    console.log("Resend response ok:", resendResponse.ok);

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      console.error("Response status:", resendResponse.status);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await resendResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders,
        } 
      }
    );
  } catch (error) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders,
        } 
      }
    );
  }
});

