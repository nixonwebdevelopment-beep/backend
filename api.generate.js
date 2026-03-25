export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Create a complete, beautiful, single-file HTML website for: "${prompt}". Requirements: everything in one HTML file with inline CSS and JS, visually stunning with animations, professional modern design, multiple sections, mobile responsive. Return ONLY raw HTML, no markdown, no explanation.`
        }]
      })
    });

    const data = await response.json();
    res.status(200).json({ html: data.content[0].text });

  } catch (err) {
    res.status(500).json({ error: 'Generation failed' });
  }
}
