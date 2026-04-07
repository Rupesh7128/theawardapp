import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  const vercelToken = process.env.VERCEL_API_TOKEN;

  if (!projectId || !vercelToken) {
    return res.status(500).json({ error: 'Vercel API credentials not configured' });
  }

  try {
    // Call Vercel API to add the domain to the project
    // This dynamically provisions the SSL certificate and sets up the routing
    let url = `https://api.vercel.com/v10/projects/${projectId}/domains`;
    if (teamId) {
      url += `?teamId=${teamId}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Ignore "Domain already in use" errors if it's already added to this project
      if (data.error?.code === 'domain_already_in_use') {
        return res.status(200).json({ success: true, message: 'Domain already configured.' });
      }
      return res.status(response.status).json({ error: data.error?.message || 'Failed to add domain' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Vercel API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
