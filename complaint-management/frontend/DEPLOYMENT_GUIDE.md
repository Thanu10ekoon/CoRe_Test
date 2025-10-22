# ✅ Frontend Proxy Setup Complete

## Summary of Changes

All proxy functions now use **environment variable** instead of hardcoded backend URL!

### Files Created/Modified:

1. **`.env.local`** - Backend URL for serverless functions
   ```
   BACKEND_URL=http://16.171.69.23:5000/api
   ```

2. **`.env`** - Frontend uses proxy
   ```
   REACT_APP_API_BASE_URL=/api
   ```

3. **`/api/*.js`** - 6 proxy functions (all use `process.env.BACKEND_URL`)
   - `login.js`
   - `complaints.js`
   - `complaints/[complaintId].js`
   - `complaints/user/[userId].js`
   - `statusupdates/[complaintId].js`
   - `uploads/[filename].js`

4. **`vercel.json`** - Routing configuration

5. **`package.json`** - Added dependencies:
   - `node-fetch@2.7.0`
   - `form-data@4.0.0`

### How It Works:

```
Frontend (React)
  ↓ calls /api/login
Vercel Proxy (login.js)
  ↓ reads process.env.BACKEND_URL
  ↓ forwards to http://16.171.69.23:5000/api/login
EC2 Backend
  ↓ responds
Frontend receives response
```

## Local Development

### Option 1: Vercel Dev (Recommended - Tests serverless functions)
```bash
cd frontend
npm install -g vercel    # Install Vercel CLI if needed
vercel dev              # Runs on http://localhost:3000
```

### Option 2: React Dev Server (Frontend only, won't call backend)
```bash
cd frontend
npm start               # Runs on http://localhost:3000
```

**Note:** With `npm start`, API calls will fail because React dev server doesn't run serverless functions. Use `vercel dev` to test the full proxy setup.

## Production Deployment

### Deploy to Vercel:

1. **Set environment variable in Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Select project → Settings → Environment Variables
   - Add: `BACKEND_URL` = `http://16.171.69.23:5000/api`
   - Apply to: Production, Preview, Development

2. **Deploy:**
   ```bash
   vercel --prod
   ```
   Or push to GitHub (auto-deploy)

3. **Test:**
   - Open: `https://your-app.vercel.app`
   - Login should work via HTTPS proxy
   - No mixed content errors! ✅

## Changing Backend URL

### Local Development:
Edit `.env.local`:
```
BACKEND_URL=http://new-backend:5000/api
```

### Production:
Update Vercel environment variable in dashboard, then redeploy.

**No code changes needed!** 🎉

## Mobile App

**Mobile app is NOT affected!** It continues to call EC2 backend directly:
```dart
static const String baseUrl = 'http://16.171.69.23:5000/api';
```

Mobile apps can use HTTP without browser security restrictions.

## Troubleshooting

### "Cannot GET /api/login" error locally:
- You're using `npm start` instead of `vercel dev`
- Solution: Run `vercel dev` to test serverless functions

### API calls fail on Vercel:
- Check if `BACKEND_URL` environment variable is set
- Verify backend is accessible: `curl http://16.171.69.23:5000/api/complaints`
- Check Vercel function logs

### Photo upload not working:
- Check `complaints.js` handles multipart/form-data
- Verify backend accepts photos at `/api/complaints`

---

**Configuration:** Environment-based (no hardcoded URLs!)  
**Status:** Ready for deployment ✅  
**Date:** October 22, 2025
