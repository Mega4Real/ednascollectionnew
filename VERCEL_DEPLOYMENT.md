# Redeploying to Vercel - Instructions

Your Vercel deployment is showing the old site because it's deploying from the root directory instead of the `client` folder where your React app is located.

## Option 1: Update Vercel Project Settings (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Find **Root Directory** setting
5. Set it to: `client`
6. Click **Save**
7. Go to **Deployments** tab
8. Click the three dots on the latest deployment → **Redeploy**

## Option 2: Deploy Client Folder Separately

If you want to keep the root deployment separate:

1. In your Vercel dashboard, create a **New Project**
2. Import your GitHub repository
3. During setup, set **Root Directory** to `client`
4. Set **Framework Preset** to `Vite`
5. Add environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.vercel.app`)
6. Click **Deploy**

## Option 3: Deploy via Vercel CLI

```bash
cd client
npm run build
npx vercel --prod
```

## After Deployment

1. Verify the new site is live (no dark mode icon)
2. Test admin login at: `https://your-site.vercel.app/admin/login`
3. Ensure `VITE_API_URL` environment variable is set in Vercel

## Important Notes

- The old site files (`index.html`, `styles.css`, `script.js` in root) are from your previous version
- The new React app is in the `client` folder
- Make sure Vercel deploys from `client` directory, not root
