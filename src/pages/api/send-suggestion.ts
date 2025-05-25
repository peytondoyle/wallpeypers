// /src/pages/api/send-suggestion-email.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { suggestion } = req.body;
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUGGESTION_TO_EMAIL || 'you@example.com';

  if (!resendKey || !toEmail) {
    console.error('Missing RESEND_API_KEY or SUGGESTION_TO_EMAIL in environment');
    return res.status(500).json({ success: false, error: 'Missing keys' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WALLPEYPERS <hello@wallpeypers.com>',
        to: toEmail,
        subject: '🖼️ New Wallpaper Suggestion',
        html: `<p>${suggestion}</p>`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, error });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}