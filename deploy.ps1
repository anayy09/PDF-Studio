# AuroraPDF Deployment Script (PowerShell)

Write-Host "🚀 AuroraPDF Deployment Helper 🚀" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "📦 Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Deploy to Vercel (Frontend only)" -ForegroundColor White
Write-Host "2. Deploy to Netlify (Frontend only)" -ForegroundColor White
Write-Host "3. Deploy to GitHub Pages (Frontend only)" -ForegroundColor White
Write-Host "4. Deploy to Heroku (Full-stack)" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$option = Read-Host "Select an option (1-5)"

switch ($option) {
    "1" {
        # Vercel
        Write-Host "📡 Deploying to Vercel..." -ForegroundColor Yellow
        npx vercel
    }
    "2" {
        # Netlify
        Write-Host "📡 Deploying to Netlify..." -ForegroundColor Yellow
        npx netlify deploy
    }
    "3" {
        # GitHub Pages
        Write-Host "📡 Deploying to GitHub Pages..." -ForegroundColor Yellow
        $repoName = Read-Host "Enter your repository name"
        
        # Update vite.config.ts for GitHub Pages
        $viteConfig = Get-Content vite.config.ts
        $viteConfig = $viteConfig -replace "base: '.*'", "base: '/$repoName/'"
        $viteConfig | Set-Content vite.config.ts
        
        # Rebuild with the updated config
        npm run build
        
        # Deploy to GitHub Pages
        npx gh-pages -d dist
    }
    "4" {
        # Heroku
        Write-Host "📡 Deploying to Heroku..." -ForegroundColor Yellow
        $herokuApp = Read-Host "Enter your Heroku app name (or leave blank to create new)"
        
        # Create Procfile if it doesn't exist
        if (-not (Test-Path "Procfile")) {
            "web: node server/app.js" | Out-File -FilePath "Procfile" -Encoding ascii
            Write-Host "Created Procfile" -ForegroundColor Green
        }
        
        # Deploy to Heroku
        if ([string]::IsNullOrEmpty($herokuApp)) {
            npx heroku create
        }
        else {
            npx heroku git:remote -a $herokuApp
        }
        
        git add .
        git commit -m "Deploy to Heroku"
        git push heroku main
    }
    "5" {
        Write-Host "👋 Exiting deployment script" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Deployment process completed!" -ForegroundColor Green
