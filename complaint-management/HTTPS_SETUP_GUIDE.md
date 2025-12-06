# Quick HTTPS Setup for EC2 Backend

## Problem
Frontend on Vercel (HTTPS) cannot call EC2 backend (HTTP) due to browser mixed content policy.

## Solution: Cloudflare Tunnel (5 minutes)

### Step 1: On EC2, install cloudflared

```bash
# SSH into EC2
ssh ubuntu@16.171.69.23

# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### Step 2: Start the tunnel

```bash
# This creates a temporary HTTPS tunnel to your backend
cloudflared tunnel --url http://localhost:5000
```

You'll see output like:
```
Your quick tunnel is ready: https://random-words-1234.trycloudflare.com
```

**Copy that HTTPS URL!**

### Step 3: Update frontend environment

Update `frontend/.env.production`:
```properties
REACT_APP_API_BASE_URL=https://random-words-1234.trycloudflare.com/api
```

### Step 4: Update mobile app

Update `mobile/lib/services/api_service.dart`:
```dart
static const String baseUrl = 'https://random-words-1234.trycloudflare.com/api';
```

### Step 5: Commit and deploy

```bash
cd frontend
git add .env.production
git commit -m "Update to HTTPS backend URL"
git push origin main
```

Vercel will auto-deploy and now it will work! ✅

---

## Making it Permanent

The cloudflare tunnel URL changes when you restart. To make it permanent:

### Option A: Run tunnel as a service

```bash
# Keep tunnel running with PM2
pm2 start cloudflared --name "tunnel" -- tunnel --url http://localhost:5000
pm2 save
```

### Option B: Get a domain and use Caddy (best for production)

1. Get a free domain from Freenom or buy one
2. Point domain to EC2 IP: `16.171.69.23`
3. Install Caddy (see main deployment guide)
4. Caddy auto-generates SSL certificate

---

## Notes

- Cloudflare tunnel is free and unlimited
- URL changes on restart (use PM2 to keep it running)
- For production, use a proper domain + Caddy or Nginx with Let's Encrypt

