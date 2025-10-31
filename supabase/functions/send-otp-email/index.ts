// Supabase Edge Function for sending OTP emails via Resend
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

Deno.serve(async (req) => {
  try {
    const { to, token, subject } = await req.json();
    
    // HTML email template with PIN code
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #339c5e; margin-bottom: 10px;">AMP Calibration Login</h2>
        <p>Enter this PIN code to log in to your account:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 36px; letter-spacing: 12px; margin: 0; color: #339c5e; font-weight: bold;">${token}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 5 minutes.</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `;

    const emailSubject = subject || 'Your AMP Calibration Login Code';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AMP Calibration <noreply@ampcalibration.com>', // Update with your domain
        to,
        subject: emailSubject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

