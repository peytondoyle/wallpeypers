import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { suggestion } = JSON.parse(req.body);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fnUrl = `${supabaseUrl}/functions/v1/send-suggestion-email`;

  const response = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ suggestion }),
  });

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    const error = await response.text();
    res.status(500).json({ success: false, error });
  }
}