param([string]$Scope = "salih-tombuloglu-s-projects")

$Root        = $PSScriptRoot
$Cloudflared = "C:\Users\ACER\AppData\Local\cloudflared.exe"
$OutLog      = "$env:TEMP\nexplan-tunnel-out.log"
$ErrLog      = "$env:TEMP\nexplan-tunnel-err.log"

Write-Host "=== NexPlan Tunnel + Vercel ===" -ForegroundColor Cyan

# --- 1. Backend saglik ---
Write-Host "[1/4] Backend kontrol..." -ForegroundColor Yellow
try {
  $null = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 3
  Write-Host "      OK: Backend calisyor." -ForegroundColor Green
} catch {
  Write-Host "      Backend baslatiliyor (PM2)..." -ForegroundColor Yellow
  Set-Location $Root
  pm2 restart nexplan-backend | Out-Null
  Start-Sleep -Seconds 6
}

# --- 2. Eski tunnel process'ini kapat ---
Write-Host "[2/4] Eski tunnel kapatiliyor..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item $OutLog,$ErrLog -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# --- 3. Tunnel baslat ---
Write-Host "[3/4] Cloudflare tunnel baslatiliyor..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $Cloudflared `
  -ArgumentList "tunnel --url http://localhost:4000 --no-autoupdate" `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError  $ErrLog `
  -WindowStyle Hidden -PassThru

Write-Host "      PID: $($proc.Id)"

# URL'yi bekle
$url = ""
$pattern = "https://[a-z0-9\-]+\.trycloudflare\.com"
for ($i = 1; $i -le 25; $i++) {
  Start-Sleep -Seconds 2
  foreach ($f in @($ErrLog, $OutLog)) {
    if (-not (Test-Path $f)) { continue }
    try {
      $fs = [System.IO.File]::Open($f, "Open", "Read", "ReadWrite")
      $sr = New-Object System.IO.StreamReader($fs)
      $content = $sr.ReadToEnd()
      $sr.Close(); $fs.Close()
      $m = [regex]::Match($content, $pattern)
      if ($m.Success) { $url = $m.Value; break }
    } catch {}
  }
  if ($url) { break }
  if ($i % 5 -eq 0) { Write-Host "      $($i*2)s..." }
}

if (-not $url) {
  Write-Host "HATA: Tunnel URL alinamadi!" -ForegroundColor Red
  exit 1
}

Write-Host "      Tunnel: $url" -ForegroundColor Green

# --- 4. Vercel guncelle ---
Write-Host "[4/4] Vercel guncelleniyor..." -ForegroundColor Yellow
Set-Location $Root
npx vercel env rm NEXT_PUBLIC_API_URL production --yes --scope $Scope 2>$null | Out-Null
$url | npx vercel env add NEXT_PUBLIC_API_URL production --scope $Scope 2>&1 | Out-Null
Write-Host "      Env var guncellendi."

Write-Host "      Deploy baslatiliyor..." -ForegroundColor Yellow
$deploy = npx vercel --prod --yes --scope $Scope 2>&1
$liveUrl = ($deploy | Select-String "Aliased\s+https://\S+").Matches.Value -replace "Aliased\s+",""
if (-not $liveUrl) {
  $liveUrl = ($deploy | Select-String "https://uretimtakip-six\.vercel\.app").Matches.Value | Select-Object -First 1
}

Write-Host ""
Write-Host "=== Tamam! ===" -ForegroundColor Green
Write-Host "  Backend : http://localhost:4000"
Write-Host "  Tunnel  : $url"
if ($liveUrl) { Write-Host "  Canli   : $liveUrl" -ForegroundColor Cyan }
Write-Host ""
Write-Host "Kapatmak icin: " -NoNewline
Write-Host "Ctrl+C veya Stop-Process -Id $($proc.Id)" -ForegroundColor DarkGray
Write-Host "Tunnel PID kaydedildi: $env:TEMP\nexplan-tunnel.pid"
$proc.Id | Out-File "$env:TEMP\nexplan-tunnel.pid" -Encoding ASCII