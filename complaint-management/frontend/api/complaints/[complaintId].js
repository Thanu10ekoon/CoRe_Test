// Proxy for individual complaint details and status updates
// Handles: GET /api/complaints/:id and PUT /api/complaints/:id/status
const fetch = require('node-fetch');

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
    
    // Extract the path after /api/complaints/
    // URL format: /api/complaints/[complaintId] or /api/complaints/[complaintId]/status
    const pathParts = req.url.split('/').filter(p => p);
    const complaintId = pathParts[0];
    const isStatus = pathParts.length > 1 && pathParts[1] === 'status';

    let url = `${backendUrl}/complaints/${complaintId}`;
    if (isStatus) {
      url += '/status';
    }

    const options = {
      method: req.method,
      headers: {},
    };

    if (req.method === 'PUT' || req.method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
};
