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

serve(async (req) => {
  try {
    // Get the booking data from the request
    const booking: BookingData = await req.json();

    if (!booking.email || !RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing email or Resend API key" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: booking.email,
        subject: "Bekräftelse på din bokning - Granupphämtning i Trollhättan",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

