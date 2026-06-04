# NexPlan — Yerel Geliştirme Başlatıcı
# Hem backend (port 4000) hem frontend (port 3000) başlatır

$Root    = $PSScriptRoot
$Backend = Join-Path $Root "backend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NexPlan — Yerel Geliştirme Modu" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend — ayrı pencerede
Write-Host "▶ Backend başlatılıyor (http://localhost:4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Backend'; npm run dev"

# Backend hazır olana kadar bekle
Write-Host "  Bekleniyor..." -NoNewline
$hazir = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 2 -ErrorAction Stop
        $hazir = $true
        break
    } catch {}
    Write-Host "." -NoNewline
}
Write-Host ""

if ($hazir) {
    Write-Host "✅ Backend hazır" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend henüz yanıt vermiyor, frontend yine de başlatılıyor..." -ForegroundColor Yellow
}

# 2. Frontend — bu pencerede
Write-Host ""
Write-Host "▶ Frontend başlatılıyor (http://localhost:3000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Giriş: http://localhost:3000/giris" -ForegroundColor Cyan
Write-Host "  Kullanıcı: admin  |  Şifre: 1234" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Durdurmak için Ctrl+C" -ForegroundColor Gray
Write-Host ""

Set-Location $Root
npm run dev
