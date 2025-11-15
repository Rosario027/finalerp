# Railway Deployment Guide

This guide will help you deploy your FinalERP application to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. GitHub account (already connected to your repo: https://github.com/Rosario027/finalerp.git)
3. A PostgreSQL database (Railway provides PostgreSQL, or you can use Neon)

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Sign in with your GitHub account

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository: `Rosario027/finalerp`
   - Railway will automatically detect it's a Node.js project

3. **Set Up PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will create a PostgreSQL database and set `DATABASE_URL` automatically

4. **Configure Environment Variables**
   - Go to your service settings → "Variables"
   - Add the following environment variables:
   
   **Required:**
   - `DATABASE_URL` - (Automatically set by Railway if you added PostgreSQL)
   
   **Optional but Recommended:**
   - `JWT_SECRET` - A secure random string for JWT token signing (generate with: `openssl rand -base64 32`)
   - `PORT` - Leave this as Railway sets it automatically (your app reads `process.env.PORT`)

5. **Run Database Migrations**
   - After deployment, you'll need to run migrations
   - Go to your service → "Deployments" → Click on the deployment
   - Open the "Shell" tab
   - Run: `npm run db:push`

6. **Deploy**
   - Railway will automatically build and deploy your application
   - The build process runs: `npm run build`
   - The start command runs: `npm start`
   - Railway will provide you with a public URL (e.g., `https://your-app.railway.app`)

### Option 2: Deploy using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway in your project**
   ```bash
   railway init
   ```

4. **Link to existing project or create new one**
   ```bash
   railway link
   ```

5. **Add PostgreSQL Database**
   ```bash
   railway add postgresql
   ```

6. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret-key-here
   ```

7. **Deploy**
   ```bash
   railway up
   ```

8. **Run Database Migrations**
   ```bash
   railway run npm run db:push
   ```

## Environment Variables

### Required Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Automatically set by Railway PostgreSQL service |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `"amazeon-erp-secret-key-change-in-production"` |
| `PORT` | Port to run the server on | `5000` (Railway sets this automatically) |
| `NODE_ENV` | Environment mode | `"production"` (set automatically during build) |

## Important Notes

1. **Database Migrations**: Make sure to run `npm run db:push` after the first deployment to set up your database schema.

2. **Build Process**: The build command (`npm run build`) will:
   - Build the React frontend with Vite (`vite build`)
   - Bundle the Express server with esbuild (`esbuild server/index.ts ...`)

3. **Static Files**: The built frontend files are served from `dist/public` by the Express server.

4. **Port**: Your application already handles the `PORT` environment variable correctly (see `server/index.ts` line 73).

5. **Custom Domain**: You can add a custom domain in Railway dashboard → Service → Settings → Networking.

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (requires Node 20+)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check if PostgreSQL service is running
- Ensure migrations have been run

### Application Won't Start
- Check logs in Railway dashboard
- Verify `PORT` environment variable (Railway sets this automatically)
- Ensure `dist/index.js` exists after build

### 404 Errors
- Verify static files are being served correctly
- Check that `dist/public` directory contains built assets
- Ensure the build process completed successfully

## Post-Deployment

1. **Test your application** using the Railway-provided URL
2. **Set up monitoring** in Railway dashboard
3. **Configure custom domain** (optional)
4. **Set up automatic deployments** from GitHub (enabled by default)

## Need Help?

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check your deployment logs in Railway dashboard

