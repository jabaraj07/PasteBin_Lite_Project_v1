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
   - **Root Directory**: `Back-End` ⚠️ **IMPORTANT**: Set this if your repo contains both frontend and backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
   > **Note**: If using `render.yaml`, the root directory is automatically set. If deploying manually, you MUST set the Root Directory to `Back-End` in the Render dashboard, otherwise the build will fail with "package.json not found" error.

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   - `MONGODB_URI`: Your MongoDB Atlas connection string (Required)
   - `NODE_ENV`: `production` (Required - sets the Node.js environment to production)
   - `FRONTEND_URL`: Your Vercel frontend URL (Required - e.g., `https://your-app.vercel.app` - **NO trailing slash!**)
   - `PORT`: Render will automatically set this (usually 10000) - Optional to override
   - `TEST_MODE`: `1` (Optional - for testing purposes by project reviewers. When set, allows time manipulation via `x-test-now-ms` header for testing scenarios.)
   
   > **Important**: `FRONTEND_URL` is used to generate the paste URLs returned by the API. If not set, URLs will default to `http://localhost:3000`.

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
   - **Root Directory**: `Front-End/pastebin` (if using monorepo) ⚠️ **CRITICAL**
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected) ⚠️ **VERIFY THIS**
   - **Install Command**: `npm install` (should be auto-detected)
   
   > **Important**: If you see "Unexpected token '<'" error, verify:
   > - Root Directory is set to `Front-End/pastebin` (not just `Front-End`)
   > - Output Directory is set to `build` (not `Front-End/pastebin/build`)
   > - Build completed successfully (check deployment logs)

4. **Add Environment Variables** ⚠️ **CRITICAL STEP**
   Click "Environment Variables" and add:
   - `REACT_APP_BACKEND_URL`: Your Render backend URL (e.g., `https://pastebin-backend.onrender.com`)
     - **Required**: Without this, your app will show a white page!
     - **Important**: Do NOT include trailing slash
     - **Example**: `https://pastebin-backend-qify.onrender.com`

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

- **Build Fails - "package.json not found" or "ENOENT" error**:
  - ⚠️ **Most Common Issue**: Root Directory is not set correctly
  - If using `render.yaml`: Make sure `rootDir: Back-End` is specified
  - If deploying manually: Go to Render dashboard → Settings → Set "Root Directory" to `Back-End`
  - Verify `package.json` exists in the `Back-End` folder in your GitHub repo
  - After fixing, trigger a new deployment

- **MongoDB Connection Error**: 
  - Verify `MONGODB_URI` is correct in Render environment variables
  - Check MongoDB Atlas IP whitelist includes Render's IPs (or `0.0.0.0/0`)

- **Build Fails (Other Errors)**:
  - Check Render logs for specific errors
  - Ensure `package.json` has correct `start` script

- **CORS Errors**:
  - Verify CORS is configured correctly
  - Check that frontend URL is allowed

### Frontend Issues

- **Build Fails on Vercel**:
  - **Check Build Logs**: Go to Vercel dashboard → Your deployment → View build logs
  - **Common Causes**:
    - Missing dependencies: Ensure all packages are in `package.json` (not just `package-lock.json`)
    - Node.js version mismatch: Vercel uses Node 18.x by default, check if your code needs a specific version
    - Build command error: Verify `npm run build` works locally
    - Memory issues: Large builds might need more memory (upgrade plan or optimize)
    - Syntax errors: Check for any TypeScript/JavaScript syntax errors in your code
  - **Solution**: 
    - Run `npm run build` locally to test
    - Check Vercel build logs for specific error messages
    - Ensure `package.json` has all dependencies listed
    - Verify Node.js version compatibility

- **White Page / Blank Screen**:
  - ⚠️ **Most Common**: Missing `REACT_APP_BACKEND_URL` environment variable
    - Go to Vercel dashboard → Your project → Settings → Environment Variables
    - Add `REACT_APP_BACKEND_URL` with your Render backend URL (no trailing slash)
    - Redeploy after adding the variable
  - Check browser console (F12) for JavaScript errors
  - Verify the build completed successfully in Vercel dashboard
  - Check Vercel deployment logs for build errors
  - Ensure `vercel.json` is in the `Front-End/pastebin` directory
  - Try clearing browser cache and hard refresh (Ctrl+Shift+R)
  - Check if all JavaScript files are loading (Network tab in browser dev tools)

- **API Calls Fail**:
  - Verify `REACT_APP_BACKEND_URL` is set correctly in Vercel
  - Check browser console for CORS errors
  - Ensure backend URL has no trailing slash
  - Verify backend is running and accessible

- **Build Fails**:
  - Check Vercel build logs for specific errors
  - Ensure all dependencies are in `package.json`
  - Verify Node.js version compatibility
  - Check for syntax errors in your code

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
- **Required Env Vars**: `MONGODB_URI`, `NODE_ENV`, `FRONTEND_URL`, `PORT` (auto-set)
- **Optional Env Vars**: `TEST_MODE` (set to `1` for testing purposes)
- **Health Check**: `/api/healthz`
- **Note**: `FRONTEND_URL` must be your Vercel frontend URL (no trailing slash) - this is used to generate paste URLs

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

