# Frontend HTTPS Proxy Setup

## Problem Solved
The frontend is deployed on Vercel (HTTPS), but the backend is on EC2 (HTTP). Browsers block mixed content (HTTPS page calling HTTP API), causing the error:
```
was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://...'
```

## Solution: Vercel Serverless Proxy
Instead of calling the EC2 backend directly, the frontend now calls Vercel serverless functions that proxy requests to the EC2 backend.

### Flow:
```
Frontend (HTTPS) → Vercel Proxy (HTTPS) → EC2 Backend (HTTP) → Response
```

## Environment Variables Configuration

### Frontend (.env)
```properties
# Frontend calls Vercel proxy functions at /api/*
REACT_APP_API_BASE_URL=/api

# Chatbot API
REACT_APP_API_BOT_URL=http://localhost:5001/api
```

### Serverless Functions (.env.local)
```properties
# Backend URL that proxy functions use
BACKEND_URL=http://16.171.69.23:5000/api
```

### Vercel Dashboard Setup
For production deployment, add environment variable in Vercel:
1. Go to Project Settings → Environment Variables
2. Add: 
   - **Name:** `BACKEND_URL`
   - **Value:** `http://16.171.69.23:5000/api`
   - **Environment:** Production, Preview, Development

## Proxy Endpoints Created

All proxy functions are in `/api` folder:

1. **`/api/login.js`** - Proxy for login
   - Forwards to: `${BACKEND_URL}/login`

2. **`/api/complaints.js`** - Proxy for GET all complaints, POST new complaint
   - Forwards to: `${BACKEND_URL}/complaints`

3. **`/api/complaints/[complaintId].js`** - Proxy for GET/PUT individual complaint and status
   - Forwards to: `${BACKEND_URL}/complaints/{id}` or `${BACKEND_URL}/complaints/{id}/status`

4. **`/api/complaints/user/[userId].js`** - Proxy for user-specific complaints
   - Forwards to: `${BACKEND_URL}/complaints/user/{id}`

5. **`/api/statusupdates/[complaintId].js`** - Proxy for status updates
   - Forwards to: `${BACKEND_URL}/statusupdates/{id}`

6. **`/api/uploads/[filename].js`** - Proxy for serving photos
   - Forwards to: `{BACKEND_BASE}/uploads/{filename}`

All functions read `BACKEND_URL` from `process.env.BACKEND_URL` with fallback to `http://16.171.69.23:5000/api`.

## Configuration Changes

### 1. Environment Variables (.env)
Changed from:
```
REACT_APP_API_BASE_URL=http://16.171.69.23:5000/api
```

To:
```
REACT_APP_API_BASE_URL=/api
```

This makes the frontend use relative URLs, which route to the Vercel proxy.

**No hardcoded URLs!** The backend URL is configured via `BACKEND_URL` environment variable.

### 2. Photo URLs (ComplaintDetails.js)
Changed to use proxy:
```javascript
src={`/api${complaint.photo_url}`}
```

Photos now load through `/api/uploads/[filename]` proxy.

### 3. Dependencies (package.json)
Added:
- `node-fetch@2.7.0` - For making HTTP requests from serverless functions
- `form-data@4.0.0` - For handling multipart form data

### 4. Vercel Configuration (vercel.json)
Routes all `/api/*` requests to the appropriate serverless function.

## Deployment

### Install Dependencies
```bash
cd frontend
npm install
```

### Local Development
```bash
npm start
```
The app runs on `http://localhost:3000` and will use `/api` which calls the proxy functions.

**Important:** Create `.env.local` file with:
```
BACKEND_URL=http://16.171.69.23:5000/api
```

### Deploy to Vercel
```bash
vercel --prod
```

**CRITICAL:** Set environment variable in Vercel dashboard:
- Variable: `BACKEND_URL`
- Value: `http://16.171.69.23:5000/api`

Or push to GitHub and let Vercel auto-deploy (don't forget to set env var!).

## Backend Configuration

**No changes needed to the EC2 backend!** It continues to run on HTTP at `http://16.171.69.23:5000`.

The proxy functions in the frontend handle all communication with the backend.

## How Proxy Works

Example: Login Request

1. **Frontend calls:** `POST /api/login` (relative URL)
2. **Vercel routes to:** `/api/login.js` serverless function
3. **Function reads:** `process.env.BACKEND_URL` → `http://16.171.69.23:5000/api`
4. **Function proxies to:** `http://16.171.69.23:5000/api/login`
5. **Backend responds:** Returns user data
6. **Function forwards response:** Back to frontend

All requests appear as HTTPS to the browser! ✅

## Changing Backend URL

To change the backend URL, update:

1. **For local development:** Edit `.env.local`
   ```
   BACKEND_URL=http://your-new-backend:5000/api
   ```

2. **For Vercel deployment:** Update environment variable in Vercel dashboard
   - Go to: Project Settings → Environment Variables
   - Edit `BACKEND_URL` value
   - Redeploy the application

No code changes needed! 🎉

## Security Notes

- CORS headers are set in all proxy functions
- EC2 backend still uses HTTP (not recommended for production)
- For production, consider:
  - Adding HTTPS to EC2 backend with Let's Encrypt
  - Using AWS ALB with SSL certificate
  - Or keep using proxy (works fine but adds latency)

## Troubleshooting

### If API calls fail:
1. Check Vercel function logs in Vercel dashboard
2. Verify EC2 backend is running: `http://16.171.69.23:5000/api/complaints`
3. Check Network tab in browser DevTools
4. Look for CORS errors in console

### Common Issues:
- **404 on /api endpoints**: Vercel.json routing may need adjustment
- **500 errors**: Check Vercel function logs for backend connection issues
- **CORS errors**: Verify CORS headers in proxy functions

---
**Created:** October 22, 2025
**Mobile App:** Not affected - continues to call EC2 backend directly via HTTP
