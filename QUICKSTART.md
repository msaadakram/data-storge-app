# Quick Start Guide - Running Locally

This is the fastest way to get your file uploader running on your local PC.

## Step 1: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your details:
   - Add your MongoDB connection string
   - Add your AWS S3 credentials
   - Set your default password (4 digits)

## Step 2: Install Dependencies

Run this single command to install all dependencies (backend + frontend):

```bash
npm run setup
```

## Step 3: Run the Application

### Linux/Mac Users:

Simply run the startup script:
```bash
./start.sh
```

### Windows Users:

Double-click `start.bat` or run in command prompt:
```cmd
start.bat
```

### Manual Method (All Platforms):

**Open Two Terminals:**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

## Step 4: Access the Application

Open your browser and go to:
- **Frontend Development**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Default Login

- Password: `1234` (or whatever you set in `.env`)

---

## Need Help?

- **Can't connect to MongoDB?** - Check your `MONGODB_URI` in `.env`
- **AWS S3 errors?** - Verify your AWS credentials and bucket name
- **Port already in use?** - Change `PORT` in `.env` to 3001 or another port

For more detailed information, see [README.md](README.md)

---

## Alternative: Production Mode

If you want to run everything from a single server (like in production):

1. Build the frontend:
   ```bash
   npm run build:client
   ```

2. Deploy locally:
   ```bash
   npm run deploy:local
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Access at http://localhost:3000

---

That's it! 🎉 Your file uploader is now running locally.
