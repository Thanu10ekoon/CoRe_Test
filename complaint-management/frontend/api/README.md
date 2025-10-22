# Vercel Serverless Proxy Functions

This folder contains Vercel serverless functions that proxy requests from the frontend (HTTPS) to the EC2 backend (HTTP).

## Why Proxy?

Browsers block mixed content: HTTPS frontend cannot call HTTP backend directly. These proxy functions solve this by:
- Frontend → Vercel Proxy (HTTPS)
- Vercel Proxy → EC2 Backend (HTTP)
- Backend → Vercel Proxy → Frontend

## Environment Variable

All functions read the backend URL from:
```javascript
const backendUrl = process.env.BACKEND_URL || 'http://16.171.69.23:5000/api';
```

**Set `BACKEND_URL` in:**
- Local: `.env.local` file
- Vercel: Dashboard → Environment Variables

## Function Structure

Each function:
1. Sets CORS headers (allows all origins)
2. Handles OPTIONS preflight requests
3. Extracts path parameters (e.g., complaintId from URL)
4. Constructs backend URL using `BACKEND_URL` env variable
5. Forwards request to EC2 backend
6. Returns response to frontend

## Files

- `login.js` - Login endpoint
- `complaints.js` - List/create complaints
- `complaints/[complaintId].js` - Get/update individual complaint
- `complaints/user/[userId].js` - User-specific complaints
- `statusupdates/[complaintId].js` - Status update history
- `uploads/[filename].js` - Serve photos

## Testing Locally

1. Install dependencies:
   ```bash
   npm install node-fetch@2.7.0 form-data@4.0.0
   ```

2. Create `.env.local`:
   ```
   BACKEND_URL=http://16.171.69.23:5000/api
   ```

3. Run dev server:
   ```bash
   npm start
   ```

4. Test endpoints:
   - `http://localhost:3000/api/login`
   - `http://localhost:3000/api/complaints`

## Deployment

When deploying to Vercel:
1. Push code to repository
2. Vercel auto-detects functions in `/api` folder
3. Set `BACKEND_URL` environment variable in Vercel dashboard
4. Deploy!

## Troubleshooting

**500 errors:**
- Check Vercel function logs
- Verify `BACKEND_URL` is set correctly
- Test backend directly: `http://16.171.69.23:5000/api/complaints`

**CORS errors:**
- Verify CORS headers in function code
- Check browser console for specific error

**404 errors:**
- Check `vercel.json` routing configuration
- Verify function file names match routes

---
All functions are stateless and scale automatically with Vercel.
