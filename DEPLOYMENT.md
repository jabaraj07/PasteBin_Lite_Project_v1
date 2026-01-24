# Deployment Guide: Frontend (Vercel) + Backend (Render)

This guide will walk you through deploying your PasteBin-Lite application with the frontend on Vercel and backend on Render.

## Prerequisites

1. **GitHub Account** - Both platforms integrate with GitHub
2. **MongoDB Atlas Account** - For your database (free tier available)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Render Account** - Sign up at [render.com](https://render.com)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user (remember username and password)
4. Whitelist IP addresses:
   - For Render: Add `0.0.0.0/0` (allows all IPs) or Render's specific IPs
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

### Step 2: Push Backend to GitHub

1. Make sure your backend code is in a GitHub repository
2. If not already, initialize git and push:
   ```bash
   cd Back-End
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 3: Deploy to Render

1. **Login to Render**
   - Go to [render.com](https://render.com) and sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure Service**
   - **Name**: `pastebin-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `Back-End` (if your repo has both frontend and backend)

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   - `MONGODB_URI`: Your MongoDB Atlas connection string (Required)
   - `NODE_ENV`: `production` (Required - sets the Node.js environment to production)
   - `PORT`: Render will automatically set this (usually 10000) - Optional to override
   - `TEST_MODE`: `1` (Optional - for testing purposes by project reviewers. When set, allows time manipulation via `x-test-now-ms` header for testing scenarios.)

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your Backend URL**
   - Once deployed, you'll see a URL like: `https://pastebin-backend.onrender.com`
   - **Copy this URL** - you'll need it for the frontend deployment

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

The frontend is already configured to use environment variables. You'll set the backend URL in Vercel.

### Step 2: Push Frontend to GitHub

If your frontend is in a separate repository or folder:

```bash
cd Front-End/pastebin
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

Or if using a monorepo, make sure the frontend code is committed.

### Step 3: Deploy to Vercel

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository containing your frontend

3. **Configure Project**
   - **Framework Preset**: Vercel should auto-detect "Create React App"
   - **Root Directory**: `Front-End/pastebin` (if using monorepo)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   - `REACT_APP_BACKEND_URL`: Your Render backend URL (e.g., `https://pastebin-backend.onrender.com`)
     - **Important**: Do NOT include trailing slash

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-3 minutes)

6. **Get Your Frontend URL**
   - Once deployed, you'll get a URL like: `https://pastebin-lite.vercel.app`

---

## Part 3: Update CORS Configuration (Optional but Recommended)

For better security, update your backend CORS to allow only your Vercel frontend URL:

1. **Update Back-End/src/script.js**:
   ```javascript
   import cors from 'cors';
   
   const corsOptions = {
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

2. **Add Environment Variable in Render**:
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://pastebin-lite.vercel.app`)

3. **Redeploy** the backend on Render

---

## Part 4: Testing Your Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend Health**: Visit `https://your-backend-url.onrender.com/api/healthz`
3. **Test Full Flow**: Create a paste from the frontend and verify it works

---

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: 
  - Verify `MONGODB_URI` is correct in Render environment variables
  - Check MongoDB Atlas IP whitelist includes Render's IPs (or `0.0.0.0/0`)

- **Build Fails**:
  - Check Render logs for specific errors
  - Ensure `package.json` has correct `start` script

- **CORS Errors**:
  - Verify CORS is configured correctly
  - Check that frontend URL is allowed

### Frontend Issues

- **API Calls Fail**:
  - Verify `REACT_APP_BACKEND_URL` is set correctly in Vercel
  - Check browser console for CORS errors
  - Ensure backend URL has no trailing slash

- **Build Fails**:
  - Check Vercel build logs
  - Ensure all dependencies are in `package.json`

### Common Issues

- **Environment Variables Not Working**:
  - In Vercel: Variables must start with `REACT_APP_` for Create React App
  - After adding variables, redeploy the application

- **Backend URL Not Updating**:
  - Clear browser cache
  - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Quick Reference

### Backend (Render)
- **URL Format**: `https://your-service-name.onrender.com`
- **Required Env Vars**: `MONGODB_URI`, `NODE_ENV`, `PORT` (auto-set)
- **Optional Env Vars**: `TEST_MODE` (set to `1` for testing purposes)
- **Health Check**: `/api/healthz`

### Frontend (Vercel)
- **URL Format**: `https://your-project-name.vercel.app`
- **Required Env Vars**: `REACT_APP_BACKEND_URL`
- **Build Output**: `build/` directory

---

## Next Steps

- Set up custom domains (optional)
- Configure automatic deployments from GitHub
- Set up monitoring and logging
- Add SSL certificates (automatically handled by both platforms)

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

