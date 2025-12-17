# Vercel Deployment Guide

This guide will help you deploy your File Uploader application to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - [Sign up here](https://vercel.com/signup)
2. **Vercel CLI** (optional but recommended) - Install with:
   ```bash
   npm install -g vercel
   ```
3. **MongoDB Atlas Database** - [Get started here](https://www.mongodb.com/cloud/atlas/register)
4. **AWS S3 Bucket** - Must be already configured
5. **GitHub/GitLab/Bitbucket** (optional) - For continuous deployment

## Step 1: Prepare Your Environment Variables

You'll need to configure these environment variables in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/fileuploader` |
| `AWS_REGION` | AWS S3 region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Your AWS secret key |
| `AWS_BUCKET_NAME` | S3 bucket name | `my-file-uploader-bucket` |
| `DEFAULT_PASSWORD` | Default 4-digit PIN | `1234` |

## Step 2: Deploy via Vercel Dashboard (Easy Method)

### A. Using Git Integration (Recommended)

1. **Push Your Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/file-uploader.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**:
   - In the import screen, scroll to "Environment Variables"
   - Add all variables from the table above
   - Click "Deploy"

### B. Using Vercel CLI (Alternative Method)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   cd "/home/saad/Documents/coding/file uploader"
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first deployment)
   - What's your project's name? `file-uploader`
   - In which directory is your code? `./`
   - Want to override settings? `N` (vercel.json will be used)

4. **Add Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add AWS_REGION
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   vercel env add AWS_BUCKET_NAME
   vercel env add DEFAULT_PASSWORD
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: MongoDB Atlas Setup (If Not Done)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a database user with username and password
3. Network Access: 
   - Click "Network Access"
   - Add IP Address
   - Choose "Allow Access from Anywhere" (`0.0.0.0/0`)
   - This is necessary because Vercel uses dynamic IPs
4. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `fileuploader` or your preferred name

## Step 4: AWS S3 CORS Configuration

Ensure your S3 bucket has CORS configured for Vercel:

1. Go to your S3 bucket in AWS Console
2. Navigate to "Permissions" → "CORS"
3. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "https://your-vercel-app.vercel.app",
            "https://*.vercel.app",
            "*"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

**Note**: Replace `your-vercel-app` with your actual Vercel app name, or use `*` for development.

## Step 5: Verify Deployment

1. **Check Build Logs**:
   - Go to your Vercel dashboard
   - Click on your deployment
   - Check the "Build Logs" tab for any errors

2. **Test Your Application**:
   - Visit your Vercel URL (e.g., `https://file-uploader.vercel.app`)
   - Try logging in with your default password
   - Upload a test file
   - Download the file
   - Preview the file

3. **Check Function Logs**:
   - In Vercel dashboard, go to "Functions" tab
   - Monitor for any errors during file operations

## Step 6: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to update DNS records

## Troubleshooting

### Build Fails

**Error**: `Module not found` or `Cannot find package`
- **Solution**: Ensure all dependencies are in `package.json` and `client/package.json`
- Clear cache and redeploy: `vercel --force`

### Database Connection Error

**Error**: `MongoError: Authentication failed`
- **Solution**: 
  - Verify `MONGODB_URI` is correct
  - Check database user credentials
  - Ensure IP `0.0.0.0/0` is whitelisted in MongoDB Atlas

### S3 Upload Fails

**Error**: `Access Denied` or `CORS error`
- **Solution**:
  - Verify AWS credentials in environment variables
  - Check S3 bucket CORS configuration
  - Ensure IAM user has `AmazonS3FullAccess` or appropriate permissions

### Function Timeout

**Error**: `Function exceeded maximum duration`
- **Solution**: Already configured in `vercel.json` with 30-second timeout and 1024MB memory
- For larger files, consider increasing limits (Hobby plan: max 10s, Pro plan: max 60s)

### File Upload Not Working

**Error**: Files not uploading or showing as undefined
- **Solution**:
  - Check browser console for errors
  - Verify `bodyParser: false` in upload function config
  - Check Content-Type header in upload request

## Environment Variables Reference

After deployment, you can manage environment variables:

```bash
# List all environment variables
vercel env ls

# Add a new variable
vercel env add VARIABLE_NAME

# Remove a variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local .env file
vercel env pull
```

## Continuous Deployment

Once connected to Git:

- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments
- You can configure this in Vercel dashboard → Settings → Git

## Performance Tips

1. **Enable Caching**: Already configured in `vercel.json`
2. **Use Environment-Specific Settings**: 
   - Production environment variables are separate from development
3. **Monitor Function Usage**:
   - Check Vercel dashboard for function invocations
   - Stay within free tier limits or upgrade as needed

## Vercel Limits (Free Tier)

- **Bandwidth**: 100 GB/month
- **Function Invocations**: 100 GB-Hrs
- **Function Duration**: 10 seconds max (Hobby), 60s (Pro)
- **Build Minutes**: 6,000 minutes/month
- **Deployments**: Unlimited

> **Note**: For production use with large files, consider upgrading to Vercel Pro.

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Vercel Secrets** for sensitive data:
   ```bash
   vercel secrets add mongodb-uri "your-connection-string"
   ```
3. **Rotate AWS credentials** periodically
4. **Use HTTPS only** - Automatically enabled on Vercel
5. **Set up monitoring** - Use Vercel Analytics

## Rollback a Deployment

If something goes wrong:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Find a previous working deployment
4. Click "⋯" → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Local Testing Before Deployment

Test your serverless functions locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run Vercel dev server
vercel dev
```

This runs your `/api` functions locally with hot reload.

## Production URL

After deployment, your app will be available at:
- **Vercel URL**: `https://file-uploader-[random].vercel.app`
- **Custom Domain** (if configured): `https://yourdomain.com`

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas database created and configured
- [ ] AWS S3 bucket created with CORS configured
- [ ] Environment variables prepared
- [ ] Code pushed to Git (if using Git integration)
- [ ] Vercel CLI installed (if using CLI method)
- [ ] Deployed to Vercel
- [ ] Environment variables added in Vercel
- [ ] Tested file upload/download
- [ ] Verified authentication works
- [ ] Custom domain configured (optional)

---

Need help? Check [Vercel Documentation](https://vercel.com/docs) or [Vercel Support](https://vercel.com/support).
