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
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  try {
    // Log request method and headers for debugging
    console.log("=== NEW REQUEST ===");
    console.log("Request method:", req.method);
    console.log("Content-Type:", req.headers.get("content-type"));
    console.log("URL:", req.url);
    console.log("All headers:", Object.fromEntries(req.headers.entries()));
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS preflight");
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only handle POST requests
    if (req.method !== "POST") {
      console.log("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({ error: "Method not allowed", received: req.method }),
        { 
          status: 405, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    console.log("Processing POST request");

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              background-color: #f5f5f5;
              padding: 20px;
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #2d5016 0%, #3d6b1f 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              font-size: 28px;
              font-weight: 600;
              margin: 0;
              letter-spacing: 0.5px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 18px;
              color: #2d5016;
              margin-bottom: 20px;
              font-weight: 500;
            }
            .thank-you-section {
              background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
              padding: 25px;
              border-radius: 10px;
              margin: 25px 0;
              text-align: center;
              border-left: 4px solid #2d5016;
            }
            .thank-you-section h2 {
              color: #2d5016;
              font-size: 24px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .thank-you-section p {
              color: #1b5e20;
              font-size: 16px;
              margin: 0;
            }
            .payment-section {
              background-color: #fff9e6;
              border: 2px solid #ffd54f;
              padding: 25px;
              border-radius: 10px;
              margin: 30px 0;
            }
            .payment-section h3 {
              color: #2d5016;
              font-size: 18px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .swish-box {
              background-color: #ffffff;
              border: 2px solid #2d5016;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin-top: 15px;
            }
            .swish-label {
              color: #666;
              font-size: 14px;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .swish-number {
              color: #2d5016;
              font-size: 32px;
              font-weight: 700;
              margin: 10px 0;
              letter-spacing: 2px;
            }
            .booking-details {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 25px;
              margin: 30px 0;
            }
            .booking-details h3 {
              color: #2d5016;
              font-size: 18px;
              margin-bottom: 20px;
              font-weight: 600;
              border-bottom: 2px solid #2d5016;
              padding-bottom: 10px;
            }
            .info-row { 
              margin: 15px 0; 
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label { 
              font-weight: 600; 
              color: #2d5016;
              display: inline-block;
              min-width: 120px;
            }
            .value {
              color: #333;
            }
            .signature {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 2px solid #e0e0e0;
            }
            .signature p {
              color: #2d5016;
              font-size: 16px;
              margin: 5px 0;
            }
            .footer { 
              background-color: #f5f5f5;
              text-align: center; 
              color: #666; 
              font-size: 12px; 
              padding: 20px 30px;
              border-top: 1px solid #e0e0e0;
            }
            @media only screen and (max-width: 600px) {
              body { padding: 10px; }
              .content { padding: 25px 20px; }
              .header { padding: 30px 20px; }
              .swish-number { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🌲 Tack för din bokning!</h1>
            </div>
            <div class="content">
              <p class="greeting">Hej ${booking.name}!</p>
              
              <div class="thank-you-section">
                <h2>Tack för din bokning!</h2>
                <p>Vi ser fram emot att hämta din gran!</p>
              </div>
              
              <div class="payment-section">
                <h3>💳 Betalning</h3>
                <p style="color: #333; margin-bottom: 15px;">För att underlätta vid upphämtningen går det bra att betala nu till Alexander Foxér Eriksson</p>
                <div class="swish-box">
                  <div class="swish-label">Betala med Swish</div>
                  <div class="swish-number">073-852 30 62</div>
                </div>
              </div>
              
              <div class="booking-details">
                <h3>📅 Din bokning</h3>
                <div class="info-row">
                  <span class="label">Datum:</span>
                  <span class="value">${pickupDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tid:</span>
                  <span class="value">${booking.time_preference}</span>
                </div>
                <div class="info-row">
                  <span class="label">Adress:</span>
                  <span class="value">${booking.address}</span>
                </div>
                ${booking.additional_info ? `
                <div class="info-row">
                  <span class="label">Övrig info:</span>
                  <span class="value">${booking.additional_info}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="signature">
                <p><strong>Med vänliga hälsningar,</strong></p>
                <p style="color: #2d5016; font-weight: 600;">Granupphämtning i Trollhättan</p>
              </div>
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

