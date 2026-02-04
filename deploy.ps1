Write-Host "-----------------------------------------" -ForegroundColor Cyan
Write-Host "  🚀 LANCEMENT DU PROJET OPALE   " -ForegroundColor Cyan
Write-Host "-----------------------------------------" -ForegroundColor Cyan

Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "   BUILD DOCKER" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray

docker-compose up --build -d

Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "   GENERATION PRISMA" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray

docker-compose exec backend npx prisma generate

Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "   MIGRATIONS PRISMA" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray

docker-compose exec backend npx prisma migrate deploy

Write-Host "-----------------------------------------" -ForegroundColor DarkGray
Write-Host "  PROJET LANCE AVEC SUCCES" -ForegroundColor Cyan
Write-Host "-----------------------------------------" -ForegroundColor DarkGray

Write-Host "Open on : http://localhost:80"
Write-Host "-----------------------------------------"
