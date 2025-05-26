// /src/pages/api/send-suggestion.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let suggestion: string | undefined;

  try {
    if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      suggestion = parsed.suggestion;
    } else {
      suggestion = req.body.suggestion;
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON' });
  }

  if (!suggestion || typeof suggestion !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid suggestion format' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUGGESTION_TO_EMAIL;

  if (!resendKey || !toEmail) {
    return res.status(500).json({ success: false, error: 'Missing environment variables' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WALLPEYPERS <onboarding@resend.dev>',
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