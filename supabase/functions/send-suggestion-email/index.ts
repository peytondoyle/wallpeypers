// supabase/functions/send-suggestion-email/index.ts
import { serve } from "serve";

serve(async (req: Request): Promise<Response> => {
  const { suggestion } = await req.json();

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const toEmail = Deno.env.get('SUGGESTION_TO_EMAIL') || 'you@example.com';

  if (!resendKey) {
    return new Response('Missing RESEND_API_KEY', { status: 500 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WALLPEYPERS <hello@wallpeypers.com>', // Change to a verified sender if needed
      to: toEmail,
      subject: '🧠 New Wallpaper Suggestion',
      html: `<p>${suggestion}</p>`,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    return new Response(`Email failed: ${error}`, { status: 500 });
  }

  return new Response('Email sent!', { status: 200 });
});