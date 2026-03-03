param(
  [string]$Tag = "",
  [string]$OutFile = "RELEASE_NOTES.md"
)

$ErrorActionPreference = "Stop"

# Find the latest tag if no tag provided
if ($Tag -eq "") {
  $Tag = (git describe --tags --abbrev=0 2>$null)
}

# If no tags exist, fall back to first commit
if (!$Tag) {
  $range = ""
  $titleRange = "All commits"
} else {
  $range = "$Tag..HEAD"
  $titleRange = "$Tag → HEAD"
}

$commits = git log $range --pretty=format:"%s" | Where-Object { $_ -ne "" }

function Add-Section($header, $items) {
  if ($items.Count -gt 0) {
    $script:md += "`n## $header`n"
    foreach ($i in $items) { $script:md += "- $i`n" }
  }
}

$features = @()
$fixes    = @()
$perf     = @()
$docs     = @()
$chore    = @()
$other    = @()

foreach ($c in $commits) {
  if ($c -match '^(feat|feature):\s*(.+)$') { $features += $Matches[2]; continue }
  if ($c -match '^fix:\s*(.+)$')            { $fixes    += $Matches[1]; continue }
  if ($c -match '^perf:\s*(.+)$')           { $perf     += $Matches[1]; continue }
  if ($c -match '^docs:\s*(.+)$')           { $docs     += $Matches[1]; continue }
  if ($c -match '^(chore|build|ci|refactor|style|test):\s*(.+)$') { $chore += "$($Matches[1]): $($Matches[2])"; continue }
  $other += $c
}

$md = @()
$md += "# Doggerz Release Notes"
$md += ""
$md += "**Range:** $titleRange"
$md += ""
$md = $md -join "`n"

Add-Section "✨ Features" $features
Add-Section "🐛 Fixes" $fixes
Add-Section "⚡ Performance" $perf
Add-Section "📝 Docs" $docs
Add-Section "🧹 Maintenance" $chore
Add-Section "🔎 Other" $other

$md | Set-Content -Encoding UTF8 $OutFile

Write-Host "Wrote $OutFile"
