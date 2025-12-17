# File Uploader - Local Development Setup

A password-protected file upload/download application with AWS S3 storage, MongoDB database, and React frontend.

## Prerequisites

Before running this application locally, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Local MongoDB installation - [Download here](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas account (cloud) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **AWS S3 Account** - [Sign up here](https://aws.amazon.com/s3/)

## Environment Setup

### 1. Create `.env` File

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/file-uploader
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/file-uploader

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_BUCKET_NAME=your-bucket-name

# Default Password (4 digits)
DEFAULT_PASSWORD=1234

# Server Port (optional)
PORT=3000
```

### 2. AWS S3 Setup

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to S3 service
3. Create a new bucket (remember the bucket name)
4. Set bucket permissions (make sure CORS is configured):
   - Go to Permissions → CORS configuration
   - Add the following CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

5. Create IAM user with S3 access:
   - Go to IAM → Users → Add user
   - Enable programmatic access
   - Attach policy: `AmazonS3FullAccess`
   - Save the Access Key ID and Secret Access Key

### 3. MongoDB Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Linux/Mac
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```
3. Use connection string: `mongodb://localhost:27017/file-uploader`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for all IPs during development)
4. Get your connection string and update `.env`

## Installation

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

**Terminal 1 - Backend Server:**
```bash
npm run server
```
The backend will run on `http://localhost:3000`

**Terminal 2 - Frontend Development Server:**
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

Open your browser and navigate to: **http://localhost:5173**

### Option 2: Run Production Build

First, build the frontend:
```bash
cd client
npm run build
cd ..
```

Then copy the built files to the server's public directory:
```bash
# Linux/Mac
mkdir -p public
cp -r client/dist/* public/

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path public
Copy-Item -Path client\dist\* -Destination public\ -Recurse -Force
```

Finally, start the server:
```bash
npm start
```

Open your browser and navigate to: **http://localhost:3000**

## Default Credentials

- **Password**: `1234` (or whatever you set in `DEFAULT_PASSWORD` in `.env`)

You can change the password from within the application after logging in.

## Features

- 🔐 Password-protected access (4-digit PIN)
- 📤 File upload to AWS S3
- 📥 Secure file download
- 👁️ File preview (images, PDFs, videos)
- ✏️ Rename files
- 🗑️ Delete files
- 📊 File size display
- 🕒 Upload timestamp tracking

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas, verify IP whitelist and credentials

### AWS S3 Upload Error
- Verify AWS credentials in `.env`
- Check S3 bucket name is correct
- Ensure IAM user has S3 permissions
- Verify CORS configuration on S3 bucket

### Port Already in Use
- Change the `PORT` in `.env` to a different port (e.g., 3001)
- Or kill the process using the port:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Frontend Not Connecting to Backend
- Make sure backend is running on port 3000
- Check `vite.config.js` proxy configuration
- Verify no CORS errors in browser console

## Project Structure

```
file-uploader/
├── api/                    # Vercel serverless functions (not used locally)
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js     # Vite configuration
├── models/                # MongoDB models
│   ├── File.js
│   └── Password.js
├── public/                # Built frontend files (production)
├── .env                   # Environment variables
├── package.json           # Backend dependencies
├── server.js              # Express server
└── vercel.json            # Vercel deployment config (for cloud deployment)
```

## Scripts Reference

### Backend (root directory)
- `npm start` - Start production server
- `npm run server` - Start development server
- `npm run dev` - Start development server

### Frontend (client directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- The application uses **AWS S3** for file storage, not local storage
- All file uploads are stored in your S3 bucket
- File metadata is stored in MongoDB
- The default password can be changed through the UI after login
- For production deployment to Vercel, use the existing `vercel.json` configuration
