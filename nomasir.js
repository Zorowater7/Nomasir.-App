// Vercel Serverless Function — proxy aman ke Anthropic API.
// API key disimpan di environment variable server (ANTHROPIC_API_KEY),
// tidak pernah dikirim ke browser, jadi aman dipakai di web publik.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY belum diset di environment variables Vercel' });
    return;
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!messages) {
    res.status(400).json({ error: 'messages wajib diisi' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 800,
        system,
        messages,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
