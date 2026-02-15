# GitHub-Based Deployment Guide

## Overview
This guide covers automatic deployment to Oracle Cloud Infrastructure using GitHub Actions. Every push to the `main` branch will automatically deploy to your OCI instance.

## Prerequisites
- GitHub account with repository access
- OCI instance running (140.245.253.253)
- SSH access to OCI instance
- Git installed on OCI instance

## Step 1: Prepare OCI Instance for Git Deployment

### 1.1 SSH into OCI Instance
```bash
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253
```

### 1.2 Install Git (if not already installed)
```bash
sudo apt update
sudo apt install git -y
```

### 1.3 Set up project directory with Git
```bash
# Go to home directory
cd ~

# If complaint-management doesn't exist, clone it
# Replace YOUR_GITHUB_USERNAME with your actual username
git clone https://github.com/YOUR_GITHUB_USERNAME/CoRe_Test.git
cd CoRe_Test/complaint-management

# If it already exists, initialize git
cd ~/CoRe_Test
git init
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/CoRe_Test.git
git fetch
git checkout main
```

### 1.4 Configure Git to allow pull without conflicts
```bash
cd ~/CoRe_Test
git config pull.rebase false
```

### 1.5 Ensure backend .env file is protected
```bash
cd ~/CoRe_Test/complaint-management/backend

# If .env doesn't exist, create it
nano .env
```

Add this content:
```env
PORT=5000
DB_HOST=140.245.253.253
DB_USER=corems_user
DB_PASSWORD=CoReMSPass@2026
DB_NAME=corems_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Add `.env` to `.gitignore` to prevent committing sensitive data:
```bash
cd ~/CoRe_Test/complaint-management/backend
echo ".env" >> .gitignore
```

## Step 2: Set Up GitHub Repository

### 2.1 Create GitHub Repository
1. Go to https://github.com/new
2. Name it `CoRe_Test` (or your preferred name)
3. Set to Private (recommended for production)
4. Don't initialize with README (we already have one)

### 2.2 Push your code to GitHub
```bash
# On your local Windows machine
cd "d:\Coding\Web Dev\CoRe_Test\CoRe_Test"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with GitHub Actions deployment"

# Add remote (replace YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/CoRe_Test.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 3: Configure GitHub Secrets

### 3.1 Navigate to Repository Settings
1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

### 3.2 Add Required Secrets

#### Secret 1: OCI_SSH_KEY
- Name: `OCI_SSH_KEY`
- Value: Content of your SSH private key
```bash
# On Windows, copy the content of your key file
type ssh-key-2025-12-05.key
```
- Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)
- Paste into the secret value field

#### Secret 2: OCI_HOST
- Name: `OCI_HOST`
- Value: `140.245.253.253`

## Step 4: Verify GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy.yml`. It will:
1. Trigger on every push to `main` branch
2. SSH into your OCI instance
3. Pull latest code from GitHub
4. Install dependencies
5. Restart backend with PM2
6. Build frontend
7. Deploy to Nginx

## Step 5: Test Deployment

### 5.1 Make a test change
```bash
# On your local machine
cd "d:\Coding\Web Dev\CoRe_Test\CoRe_Test"

# Make a small change (e.g., edit README.md)
echo "Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test GitHub Actions deployment"
git push origin main
```

### 5.2 Monitor deployment
1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your commit with a workflow run
4. Click on it to see real-time logs
5. Green checkmark = successful deployment

### 5.3 Verify on OCI
```bash
# SSH into OCI
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253

# Check backend status
pm2 status
pm2 logs corems-backend --lines 20

# Check if code is updated
cd ~/CoRe_Test
git log -1
```

## Step 6: Ongoing Deployment Workflow

### Daily Development Workflow
```bash
# 1. Make changes locally
# 2. Test locally
npm start  # in backend directory
npm start  # in frontend directory

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub (triggers automatic deployment)
git push origin main

# 5. Wait 1-2 minutes for deployment to complete
# 6. Check GitHub Actions for status
# 7. Verify changes at http://140.245.253.253
```

## Troubleshooting

### Issue: Workflow fails with "Permission denied (publickey)"
**Solution:** Verify OCI_SSH_KEY secret is correctly set:
1. The key must be the **private key** (not .pub file)
2. Include full key content with header/footer
3. No extra spaces or line breaks

### Issue: "git pull" fails with merge conflicts
**Solution:** SSH into OCI and reset repository:
```bash
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253
cd ~/CoRe_Test
git reset --hard HEAD
git pull origin main
```

### Issue: PM2 restart fails
**Solution:** Check PM2 logs:
```bash
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253
pm2 logs corems-backend --lines 50
```

### Issue: Frontend not updating
**Solution:** Manually rebuild and restart Nginx:
```bash
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253
cd ~/CoRe_Test/complaint-management/frontend
npm run build
sudo rm -rf /var/www/complaint-management/*
sudo cp -r build/* /var/www/complaint-management/
sudo systemctl reload nginx
```

### Issue: Database connection errors after deployment
**Solution:** Verify .env file exists and has correct credentials:
```bash
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253
cat ~/CoRe_Test/complaint-management/backend/.env
```

## Security Best Practices

### 1. Protect Sensitive Files
Ensure these files are in `.gitignore`:
- `.env`
- `ssh-key-*.key`
- `node_modules/`
- `build/`

### 2. Use Environment-Specific Configurations
- Keep production credentials on OCI only
- Never commit .env to GitHub
- Use GitHub Secrets for sensitive deployment data

### 3. Restrict GitHub Repository Access
- Set repository to Private
- Only give access to trusted collaborators
- Use branch protection rules for main branch

## Manual Rollback Procedure

If a deployment breaks the application:
```bash
# SSH into OCI
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253

# Roll back to previous commit
cd ~/CoRe_Test
git log -5  # Find the commit hash you want to rollback to
git reset --hard COMMIT_HASH
cd complaint-management/backend
pm2 restart corems-backend
cd ../frontend
npm run build
sudo rm -rf /var/www/complaint-management/*
sudo cp -r build/* /var/www/complaint-management/
sudo systemctl reload nginx
```

## Monitoring Deployment

### View GitHub Actions Logs
- Go to repository > Actions tab
- Click on the latest workflow run
- Expand each step to see detailed logs

### View Application Logs on OCI
```bash
# Backend logs
pm2 logs corems-backend --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Advanced: Deploy Specific Branch

To deploy a branch other than main:
1. Edit `.github/workflows/deploy.yml`
2. Change `branches: [main]` to `branches: [your-branch-name]`
3. Commit and push

Or manually trigger deployment:
1. Go to GitHub repository > Actions
2. Click "Deploy to Oracle Cloud" workflow
3. Click "Run workflow" button
4. Select branch
5. Click green "Run workflow" button

## Summary

✅ **Automatic Deployment:** Push to GitHub → Auto-deploy to OCI  
✅ **No SCP needed:** Uses git pull on OCI instance  
✅ **Real-time monitoring:** View deployment logs in GitHub Actions  
✅ **Rollback support:** Easy rollback to previous commits  
✅ **Secure:** SSH keys stored as GitHub Secrets  

Your deployment is now fully automated! 🚀
