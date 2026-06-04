param([string]$Scope = "salih-tombuloglu-s-projects")

$BackendPath = "C:\Users\ACER\Desktop\uretimtakip\backend"
$RootPath    = "C:\Users\ACER\Desktop\uretimtakip"

Set-Location $BackendPath

Write-Host "=== NexPlan Railway Deploy ===" -ForegroundColor Cyan

# 1. Proje olustur/baglan
Write-Host "[1/5] Railway projesine baglaniliyor..." -ForegroundColor Yellow
$linked = railway status 2>&1
if ($linked -match "No project|not linked") {
  railway init --name "nexplan-backend"
}

# 2. Env var'lari aktar
Write-Host "[2/5] Env variables yukleniyor..." -ForegroundColor Yellow
Get-Content ".env" | Where-Object { $_ -match "^[A-Z]" } | ForEach-Object {
  $k,$v = $_ -split "=",2
  if ($k -and $v) {
    railway variables set "$k=$v" | Out-Null
    Write-Host "      SET $k" -ForegroundColor DarkGray
  }
}
railway variables set "FRONTEND_URL=https://uretimtakip-six.vercel.app" | Out-Null
Write-Host "      SET FRONTEND_URL" -ForegroundColor DarkGray

# 3. Deploy
Write-Host "[3/5] Deploy ediliyor (bu 1-2 dk surebilir)..." -ForegroundColor Yellow
railway up --detach

# 4. URL al
Write-Host "[4/5] URL bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
$railwayUrl = ""
for ($i = 0; $i -lt 12; $i++) {
  $out = railway domain 2>&1
  $m   = [regex]::Match(($out -join "`n"), "https://[^\s]+railway\.app")
  if ($m.Success) { $railwayUrl = $m.Value; break }
  # Domain yoksa olustur
  if ($i -eq 0) { railway domain create 2>$null | Out-Null }
  Start-Sleep -Seconds 5
  Write-Host "      bekleniyor... $($i*5)s"
}

if (-not $railwayUrl) {
  Write-Host "URL alinamadi. 'railway domain' komutuyla manuel kontrol edin." -ForegroundColor Red
  exit 1
}

Write-Host "      Railway URL: $railwayUrl" -ForegroundColor Green

# 5. Vercel'i guncelle
Write-Host "[5/5] Vercel guncelleniyor..." -ForegroundColor Yellow
Set-Location $RootPath
npx vercel env rm NEXT_PUBLIC_API_URL production --yes --scope $Scope 2>$null | Out-Null
$railwayUrl | npx vercel env add NEXT_PUBLIC_API_URL production --scope $Scope | Out-Null
npx vercel --prod --yes --scope $Scope 2>&1 | Select-String "Aliased"

# .env.local guncelle
$envLocal = [System.IO.File]::ReadAllText("$RootPath\.env.local")
if ($envLocal -match "NEXT_PUBLIC_API_URL=") {
  $envLocal = [regex]::Replace($envLocal, "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=$railwayUrl")
} else {
  $envLocal += "`nNEXT_PUBLIC_API_URL=$railwayUrl"
}
[System.IO.File]::WriteAllText("$RootPath\.env.local", $envLocal)

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "  Backend  : $railwayUrl"
Write-Host "  Frontend : https://uretimtakip-six.vercel.app"
Write-Host ""
Write-Host "Bu URL artik kalicidir!" -ForegroundColor Cyan
