# Deployment Guide for AuroraPDF

This guide describes how to deploy AuroraPDF to various hosting platforms.

## Prerequisites
- Make sure your project builds correctly: `npm run build`
- The build output will be in the `dist` directory

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. Sign up for a [Vercel](https://vercel.com) account
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel login` and follow the instructions
4. From the project directory, run:
   ```
   vercel
   ```
5. Follow the interactive prompts to deploy

### Option 2: Netlify

1. Sign up for a [Netlify](https://netlify.com) account
2. Install Netlify CLI: `npm i -g netlify-cli`
3. Run `netlify login`
4. Deploy with:
   ```
   netlify deploy
   ```
5. When asked for the deploy directory, specify `dist`

### Option 3: GitHub Pages

1. Create a repository on GitHub
2. Add the following to your `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/', // Replace with your repository name
     // ...other config
   })
   ```
3. Build your project: `npm run build`
4. Deploy with gh-pages: 
   ```
   npm install -g gh-pages
   gh-pages -d dist
   ```

## Backend Deployment (Server)

The server component should be deployed separately:

### Option 1: Heroku

1. Sign up for a [Heroku](https://heroku.com) account
2. Install Heroku CLI: `npm i -g heroku`
3. Run `heroku login`
4. Create a `Procfile` in your project root:
   ```
   web: node server/app.js
   ```
5. Create a Heroku app: `heroku create aurora-pdf-api`
6. Deploy: `git push heroku main`

### Option 2: Railway

1. Sign up for [Railway](https://railway.app)
2. Connect your GitHub repository
3. When configuring the deployment, set the following:
   - Build command: `npm run build`
   - Start command: `node server/app.js`

## CORS Configuration

Make sure to update your CORS settings in `server/app.ts` with your production URL:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://your-domain.com'] : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
```

## Environment Variables

Set these environment variables on your hosting platform:
- `PORT` - The port for the server (often set automatically by the platform)
- `NODE_ENV` - Set to 'production'
