#!/bin/bash

# AuroraPDF Deployment Script

echo "🚀 AuroraPDF Deployment Helper 🚀"
echo "--------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🌐 Deployment Options:"
echo "1. Deploy to Vercel (Frontend only)"
echo "2. Deploy to Netlify (Frontend only)"
echo "3. Deploy to GitHub Pages (Frontend only)"
echo "4. Deploy to Heroku (Full-stack)"
echo "5. Exit"
echo ""

read -p "Select an option (1-5): " option

case $option in
    1)
        # Vercel
        echo "📡 Deploying to Vercel..."
        npx vercel
        ;;
    2)
        # Netlify
        echo "📡 Deploying to Netlify..."
        npx netlify deploy
        ;;
    3)
        # GitHub Pages
        echo "📡 Deploying to GitHub Pages..."
        read -p "Enter your repository name: " repo_name
        
        # Update vite.config.ts for GitHub Pages
        sed -i "s|base: '.*'|base: '/$repo_name/'|g" vite.config.ts
        
        # Rebuild with the updated config
        npm run build
        
        # Deploy to GitHub Pages
        npx gh-pages -d dist
        ;;
    4)
        # Heroku
        echo "📡 Deploying to Heroku..."
        read -p "Enter your Heroku app name (or leave blank to create new): " heroku_app
        
        # Create Procfile if it doesn't exist
        if [ ! -f "Procfile" ]; then
            echo "web: node server/app.js" > Procfile
            echo "Created Procfile"
        fi
        
        # Deploy to Heroku
        if [ -z "$heroku_app" ]; then
            npx heroku create
        else
            npx heroku git:remote -a $heroku_app
        fi
        
        git add .
        git commit -m "Deploy to Heroku"
        git push heroku main
        ;;
    5)
        echo "👋 Exiting deployment script"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo "✅ Deployment process completed!"
