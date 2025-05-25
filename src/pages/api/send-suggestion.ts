// /src/pages/api/send-suggestion-email.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { suggestion } = req.body;
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUGGESTION_TO_EMAIL;

  if (!resendKey || !toEmail) {
    return res.status(500).json({ success: false, error: 'Missing keys' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
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
    return res.status(500).json({ success: false, error });
  }

  return res.status(200).json({ success: true });
}