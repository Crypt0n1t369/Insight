#!/bin/bash
# Deploy Credo Platform

echo "=== Credo Platform Deployment ==="

# 1. Build the API
echo "Building API..."
cd "$(dirname "$0")/.."
npm run build

# 2. Deploy to Render.com (requires render-cli and authentication)
echo ""
echo "To deploy API to Render.com:"
echo "1. Install: npm install -g render-cli"
echo "2. Login: render login"
echo "3. Deploy: render blueprint apply render.yaml"
echo ""
echo "Or deploy manually:"
echo "- Push to GitHub"
echo "- Go to https://dashboard.render.com/blueprints"
echo "- Connect your GitHub repo"
echo ""

# 3. Deploy frontend to GitHub Pages
echo "Frontend pushed to GitHub."
echo "Go to: https://github.com/$GITHUB_REPOSITORY/settings/pages"
echo "Select: GitHub Actions as source"
echo ""
echo "Dashboard will be at: https://<your-username>.github.io/Insight/"
