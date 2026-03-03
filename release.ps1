param(
  [switch]$Major,
  [switch]$Minor,
  [switch]$SkipWebBuild
)

$ErrorActionPreference = "Stop"

# Load current version
$versionFile = "version.json"

if (!(Test-Path $versionFile)) {
  throw "version.json not found!"
}

$versionData = Get-Content $versionFile | ConvertFrom-Json

$versionName = $versionData.versionName
$versionCode = [int]$versionData.versionCode

# Split version
$parts = $versionName.Split(".")
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

# Bump logic
if ($Major) {
  $major++
  $minor = 0
  $patch = 0
}
elseif ($Minor) {
  $minor++
  $patch = 0
}
else {
  $patch++
}

$versionCode++
$newVersionName = "$major.$minor.$patch"

Write-Host "== Doggerz Release ==" -ForegroundColor Cyan
Write-Host "Old Version: $versionName ($versionCode - 1)"
Write-Host "New Version: $newVersionName ($versionCode)" -ForegroundColor Yellow

# Save updated version.json
@{
  versionName = $newVersionName
  versionCode = $versionCode
} | ConvertTo-Json | Set-Content $versionFile

if (-not $SkipWebBuild) {
  Write-Host "1) Building web..." -ForegroundColor Yellow
  npm run build
}

Write-Host "2) Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

Write-Host "3) Building AAB..." -ForegroundColor Yellow
Push-Location android
try {
  $env:DOGGERZ_VERSION_NAME = $newVersionName
  $env:DOGGERZ_VERSION_CODE = "$versionCode"
  ./gradlew bundleRelease
}
finally {
  Pop-Location
}

$aab = "android\app\build\outputs\bundle\release\app-release.aab"

if (!(Test-Path $aab)) {
  throw "AAB not found!"
}

New-Item -ItemType Directory -Force -Path "releases" | Out-Null
$outName = "Doggerz-$newVersionName-$versionCode.aab"
Copy-Item $aab ("releases\" + $outName) -Force

Write-Host "`nDONE ✅" -ForegroundColor Green
Write-Host "Release file: releases\$outName"
