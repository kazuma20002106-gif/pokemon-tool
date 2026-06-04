@echo off
echo ====================================
echo Automatically pushing changes to GitHub...
echo ====================================

git add .
git commit -m "Auto-deploy: Updates by Antigravity"
git push

echo.
echo ====================================
echo Push complete! Vercel build will start now.
echo ====================================
