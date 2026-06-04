# NexPlan Backend Otomatik Başlatıcı
# Bu script bilgisayar açıldığında backend + tünel başlatır ve Vercel'i günceller

$BackendPath = "C:\Users\ACER\Desktop\uretimtakip\backend"
$CloudflaredPath = "C:\Users\ACER\AppData\Local\cloudflared.exe"
$TunnelLog = "C:\Temp\nexplan-tunnel.log"
$BackendLog = "C:\Temp\nexplan-backend.log"

New-Item -ItemType Directory -Force "C:\Temp" | Out-Null

Write-Host "🚀 NexPlan Backend başlatılıyor..."

# 1. Backend başlat
$backendProc = Start-Process -FilePath "cmd" `
    -ArgumentList "/c cd `"$BackendPath`" && npm run dev" `
    -RedirectStandardOutput $BackendLog `
    -WindowStyle Hidden -PassThru
Write-Host "✅ Backend PID: $($backendProc.Id)"

# Backend hazır olana kadar bekle
$hazir = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 2
        $hazir = $true; break
    } catch {}
}

if (-not $hazir) {
    Write-Host "❌ Backend başlamadı!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend hazır"

# 2. Cloudflare tünelini başlat
Remove-Item $TunnelLog -ErrorAction SilentlyContinue
$tunnelProc = Start-Process -FilePath $CloudflaredPath `
    -ArgumentList "tunnel --url http://localhost:4000 --no-autoupdate" `
    -RedirectStandardOutput $TunnelLog `
    -RedirectStandardError $TunnelLog `
    -WindowStyle Hidden -PassThru

Write-Host "⏳ Tünel açılıyor..."
Start-Sleep -Seconds 10

# URL'yi yakala
$tunnelUrl = ""
for ($i = 0; $i -lt 15; $i++) {
    $log = Get-Content $TunnelLog -ErrorAction SilentlyContinue
    $match = ($log | Select-String "https://[^ ]*trycloudflare[^ ]*").Matches.Value | Select-Object -First 1
    if ($match) { $tunnelUrl = $match; break }
    Start-Sleep -Seconds 2
}

if (-not $tunnelUrl) {
    Write-Host "❌ Tünel URL'si alınamadı" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tünel: $tunnelUrl"

# 3. Vercel env var'ını güncelle
Write-Host "🔄 Vercel güncelleniyor..."
Set-Location "C:\Users\ACER\Desktop\uretimtakip"

# Eski production URL'yi sil ve yenisini ekle
npx vercel env rm NEXT_PUBLIC_API_URL production --yes --scope salih-tombuloglu-s-projects 2>&1 | Out-Null
npx vercel env add NEXT_PUBLIC_API_URL production --value $tunnelUrl --yes --scope salih-tombuloglu-s-projects 2>&1 | Out-Null

# 4. Vercel redeploy
Write-Host "🚀 Vercel redeploy..."
npx vercel --prod --yes --scope salih-tombuloglu-s-projects 2>&1 | Select-Object -Last 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ NexPlan hazır!" -ForegroundColor Green
Write-Host "   Backend : http://localhost:4000" -ForegroundColor Green
Write-Host "   Tünel   : $tunnelUrl" -ForegroundColor Green
Write-Host "   Canlı   : https://uretimtakip-six.vercel.app" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Bu pencereyi açık tut (tünel ve backend çalışsın diye)
Write-Host "`nKapatmayın — backend çalışıyor. Durdurmak için Ctrl+C"
Wait-Process -Id $tunnelProc.Id -ErrorAction SilentlyContinue
