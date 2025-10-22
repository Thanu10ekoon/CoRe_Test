// Proxy for complaints endpoints (GET all, POST new complaint with photo)
const fetch = require('node-fetch');
const FormData = require('form-data');
const { Readable } = require('stream');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://16.171.69.23:5000/api';
    const { admin_id } = req.query;
    let url = `${backendUrl}/complaints`;
    
    if (admin_id) {
      url += `?admin_id=${admin_id}`;
    }

    if (req.method === 'GET') {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (req.method === 'POST') {
      // Handle multipart form data for photo upload
      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Forward the raw request body as-is for multipart data
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': req.headers['content-type'],
          },
          body: req.body,
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        // Regular JSON request
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
      }
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
};
