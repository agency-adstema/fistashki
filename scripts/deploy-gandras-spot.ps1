#Requires -Version 5.1
<#
.SYNOPSIS
  Deploy Gandras Spot to VPS (isolated from Adstema).

.DESCRIPTION
  - Shop: https://gandraspot.rs (Next.js PM2 :6596, /var/www/gandras-spot-web)
  - Admin CRM: https://admin.gandraspot.rs (same Next.js; /admin/*)
  - API + WebSocket: https://admin.gandraspot.rs/api (Nest PM2 :4100, /var/www/gandras-spot-api)
  - Does NOT touch lamena.io (MojTermin), /var/www/adstema*, PM2 admin/backend/crm/mojtermin*

.EXAMPLE
  pwsh -File scripts/deploy-gandras-spot.ps1
#>
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$GandrasRoot = Join-Path $RepoRoot 'gandras-spot'
$BackendRoot = Join-Path $GandrasRoot 'backend'

function EnvOr([string] $name, [string] $default) {
  $v = [Environment]::GetEnvironmentVariable($name)
  if ($v) { return $v }
  return $default
}

$HostAddr = EnvOr 'GANDRAS_VPS_HOST' '178.62.254.33'
$RemoteUser = EnvOr 'GANDRAS_VPS_USER' 'root'
$Server = "${RemoteUser}@${HostAddr}"
$WebDir = EnvOr 'GANDRAS_WEB_DIR' '/var/www/gandras-spot-web'
$ApiDir = EnvOr 'GANDRAS_API_DIR' '/var/www/gandras-spot-api'
$ApiUrl = EnvOr 'GANDRAS_PUBLIC_API_URL' '/api'
$WebPort = EnvOr 'GANDRAS_WEB_PORT' '6596'
$ApiPort = EnvOr 'GANDRAS_API_PORT' '4100'
$Pm2Web = EnvOr 'GANDRAS_PM2_WEB' 'gandras-spot-web'
$Pm2Api = EnvOr 'GANDRAS_PM2_API' 'gandras-spot-api'

$WebTar = Join-Path $RepoRoot 'deploy-gandras-web.tgz'
$ApiTar = Join-Path $RepoRoot 'deploy-gandras-api.tgz'

if (-not (Test-Path $GandrasRoot)) { throw "Missing $GandrasRoot" }
if (-not (Test-Path $BackendRoot)) { throw "Missing $BackendRoot" }

# --- Frontend build (standalone) ---
Write-Host "=== Next.js build ($GandrasRoot) ===" -ForegroundColor Cyan
Push-Location $GandrasRoot
$env:NEXT_PUBLIC_API_URL = $ApiUrl
npm run build
if ($LASTEXITCODE -ne 0) { throw 'next build failed' }
Pop-Location

$Standalone = Join-Path $GandrasRoot '.next\standalone'
$ServerJs = Join-Path $Standalone 'server.js'
if (-not (Test-Path $ServerJs)) {
  $nested = Get-ChildItem -Path $Standalone -Filter 'server.js' -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($nested) {
    $Standalone = $nested.Directory.FullName
    $ServerJs = $nested.FullName
  }
}
if (-not (Test-Path $ServerJs)) { throw "Missing server.js under $Standalone" }

Write-Host "=== package web tarball (from $Standalone) ===" -ForegroundColor Cyan
if (Test-Path $WebTar) { Remove-Item $WebTar -Force }
$WebStage = Join-Path $env:TEMP "gandras-web-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $WebStage | Out-Null
Copy-Item -Recurse $Standalone (Join-Path $WebStage 'app')
$staticSrc = Join-Path $GandrasRoot '.next\static'
if (Test-Path $staticSrc) {
  New-Item -ItemType Directory -Path (Join-Path $WebStage 'app\.next') -Force | Out-Null
  Copy-Item -Recurse $staticSrc (Join-Path $WebStage 'app\.next\static')
}
$publicSrc = Join-Path $GandrasRoot 'public'
if (Test-Path $publicSrc) {
  Copy-Item -Recurse $publicSrc (Join-Path $WebStage 'app\public')
}
tar -czf $WebTar -C $WebStage app
Remove-Item $WebStage -Recurse -Force

# --- Backend build ---
Write-Host "=== Nest build ($BackendRoot) ===" -ForegroundColor Cyan
Push-Location $BackendRoot
npm run build
if ($LASTEXITCODE -ne 0) { throw 'nest build failed' }
Pop-Location

Write-Host '=== package api tarball ===' -ForegroundColor Cyan
if (Test-Path $ApiTar) { Remove-Item $ApiTar -Force }
Push-Location $BackendRoot
tar -czf $ApiTar dist prisma package.json package-lock.json scripts
Pop-Location

# --- Upload ---
Write-Host "=== scp -> $Server ===" -ForegroundColor Cyan
scp -o BatchMode=yes -o ConnectTimeout=60 $WebTar "${Server}:/tmp/deploy-gandras-web.tgz"
scp -o BatchMode=yes -o ConnectTimeout=60 $ApiTar "${Server}:/tmp/deploy-gandras-api.tgz"
scp -o BatchMode=yes -o ConnectTimeout=60 (Join-Path $RepoRoot 'deploy\nginx-gandras-gandraspot.rs.conf') "${Server}:/tmp/nginx-gandras-gandraspot.rs.conf"
scp -o BatchMode=yes -o ConnectTimeout=60 (Join-Path $RepoRoot 'deploy\nginx-gandras-admin.gandraspot.rs.conf') "${Server}:/tmp/nginx-gandras-admin.gandraspot.rs.conf"
scp -o BatchMode=yes -o ConnectTimeout=60 (Join-Path $RepoRoot 'deploy\nginx-gandras-admin.gandraspot.rs.http.conf') "${Server}:/tmp/nginx-gandras-admin.gandraspot.rs.http.conf"

scp -o BatchMode=yes -o ConnectTimeout=60 (Join-Path $RepoRoot 'scripts\deploy-gandras-spot-remote.sh') "${Server}:/tmp/deploy-gandras-spot-remote.sh"

$EnvLocal = Join-Path $BackendRoot '.env'
if (Test-Path $EnvLocal) {
  scp -o BatchMode=yes -o ConnectTimeout=60 $EnvLocal "${Server}:/tmp/gandras-spot-api.env"
}

Write-Host '=== remote install ===' -ForegroundColor Cyan
ssh -o BatchMode=yes -o ConnectTimeout=120 $Server "sed -i 's/\r$//' /tmp/deploy-gandras-spot-remote.sh && chmod +x /tmp/deploy-gandras-spot-remote.sh && bash /tmp/deploy-gandras-spot-remote.sh"
if ($LASTEXITCODE -ne 0) { throw 'remote install failed' }

Remove-Item $WebTar -Force -ErrorAction SilentlyContinue
Remove-Item $ApiTar -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host '=== Done ===' -ForegroundColor Green
Write-Host "Shop:  https://gandraspot.rs/" -ForegroundColor Cyan
Write-Host "Admin: https://admin.gandraspot.rs/admin/login" -ForegroundColor Cyan
Write-Host "API:   https://admin.gandraspot.rs/api/docs" -ForegroundColor Cyan
Write-Host 'DNS: gandraspot.rs + admin.gandraspot.rs A -> 178.62.254.33' -ForegroundColor Yellow
