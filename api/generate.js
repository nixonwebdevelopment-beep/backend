export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: 'You are a web developer. When given a prompt, return ONLY raw HTML code for a complete beautiful website. No markdown, no explanation, no code blocks. Just pure HTML.'
          },
          {
            role: 'user',
            content: `Create a complete, beautiful, single-file HTML website for: "${prompt}". Requirements: everything in one HTML file with inline CSS and JS, visually stunning with animations, professional modern design, multiple sections with relevant content, mobile responsive. Return ONLY raw HTML, nothing else. Make sure it looks unique, and dont use generic gray and white color scheme. Give it a cool font if possible`
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'No response from Groq', raw: data });
    }
    
    res.status(200).json({ html: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: 'Generation failed' });
  }
}
