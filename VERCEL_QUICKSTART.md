# Vercel Deployment Quick Reference

## 🚀 Quick Deploy Commands

### Pre-Deployment Check
```bash
./vercel-check.sh
```

### Deploy via Vercel CLI

**Install Vercel CLI (first time only)**:
```bash
npm install -g vercel
```

**Login**:
```bash
vercel login
```

**Deploy to Preview**:
```bash
npm run vercel:deploy
# or
vercel
```

**Deploy to Production**:
```bash
npm run vercel:prod
# or
vercel --prod
```

**Test Serverless Functions Locally**:
```bash
npm run vercel:dev
# or
vercel dev
```

---

## 📋 Environment Variables Checklist

Set these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `AWS_REGION` - AWS S3 region (e.g., `us-east-1`)
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_BUCKET_NAME` - S3 bucket name
- [ ] `DEFAULT_PASSWORD` - 4-digit PIN (e.g., `1234`)

---

## 🔄 Deployment Methods

### Method 1: GitHub → Vercel (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add environment variables
6. Click "Deploy"

**Benefits**: Automatic deployments on every push, preview deployments for PRs

### Method 2: Vercel CLI

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### Method 3: Vercel Dashboard (Manual Upload)

1. Build your project locally: `npm run build:client`
2. Go to Vercel Dashboard → Add New → Project
3. Drag and drop your project folder
4. Configure and deploy

---

## 🛠️ Common Commands

### Manage Environment Variables
```bash
# List variables
vercel env ls

# Add variable
vercel env add VARIABLE_NAME

# Remove variable
vercel env rm VARIABLE_NAME

# Pull variables to .env
vercel env pull
```

### Manage Deployments
```bash
# List deployments
vercel ls

# View deployment info
vercel inspect [deployment-url]

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel remove [deployment-url]
```

### Logs and Debugging
```bash
# View deployment logs
vercel logs [deployment-url]

# View realtime logs
vercel logs --follow
```

---

## ⚡ Vercel.json Overview

Your `vercel.json` is configured with:

- **Build**: Automatic frontend build from `client/` directory
- **Functions**: 1024MB memory, 30s timeout
- **Rewrites**: SPA routing support
- **Headers**: CORS enabled for API routes
- **Environment**: Template for required variables

---

## 🔍 Troubleshooting

### Build Failed
```bash
# Clear cache and force redeploy
vercel --force
```

### Function Errors
- Check logs: Vercel Dashboard → Functions tab
- Test locally: `vercel dev`
- Verify environment variables are set

### Database Connection Failed
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify `MONGODB_URI` format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### CORS Errors
- Check S3 bucket CORS configuration
- Verify allowed origins include your Vercel URL

---

## 📊 Deployment Status

After deployment:

- **Preview URL**: `https://file-uploader-[hash]-[username].vercel.app`
- **Production URL**: `https://file-uploader-[username].vercel.app`
- **Custom Domain**: Configure in Vercel Dashboard

---

## 🎯 Pre-Deployment Checklist

Run `./vercel-check.sh` to verify:

- [x] `vercel.json` exists
- [x] `/api` directory with serverless functions
- [x] `/client` directory with frontend
- [x] `package.json` files configured
- [x] `.env` is in `.gitignore`
- [x] Environment variables documented
- [ ] MongoDB Atlas database created
- [ ] AWS S3 bucket CORS configured
- [ ] Code committed to Git (if using Git deployment)

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [AWS Console](https://console.aws.amazon.com/)

---

## 📖 Full Documentation

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete step-by-step guide.
