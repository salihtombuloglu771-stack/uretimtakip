# NexPlan Backend Guncelle & Yeniden Basla
# Kaynak kodu degistikten sonra calistir

$Root = $PSScriptRoot

Write-Host "Backend derleniyor..." -ForegroundColor Yellow
Set-Location "$Root\backend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Derleme hatasi!" -ForegroundColor Red; exit 1 }

Write-Host "PM2 yeniden baslatiliyor..." -ForegroundColor Yellow
pm2 restart nexplan-backend

Write-Host ""
Write-Host "Durum:" -ForegroundColor Cyan
pm2 list

Write-Host ""
Write-Host "Backend hazir: http://localhost:4000" -ForegroundColor Green
