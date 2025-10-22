// Proxy for serving uploaded photos
// Handles: GET /uploads/:filename
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
    const backendBase = backendUrl.replace('/api', ''); // Remove /api to get base URL
    
    // Extract filename from the URL path
    const pathParts = req.url.split('/').filter(p => p);
    const filename = pathParts[0];

    const url = `${backendBase}/uploads/${filename}`;

    const response = await fetch(url);
    
    // Forward the image with proper content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const buffer = await response.buffer();
    res.status(response.status).send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to load image', details: error.message });
  }
};
