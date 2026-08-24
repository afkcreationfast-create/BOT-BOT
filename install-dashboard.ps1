$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Get-Location

Write-Host "BOT-BOT Dashboard installer" -ForegroundColor Cyan

if (-not (Test-Path ".\src\index.js")) {
    throw "Lance ce script depuis la racine de BOT-BOT (le dossier qui contient src\index.js)."
}

if (-not (Test-Path ".\public")) {
    New-Item -ItemType Directory ".\public" | Out-Null
}

Copy-Item "$root\src\index.js" ".\src\index.dashboard.js" -Force
Copy-Item "$root\src\apiServer.js" ".\src\apiServer.js" -Force
Copy-Item "$root\src\config.js" ".\src\config.dashboard.js" -Force
Copy-Item "$root\public\index.html" ".\public\index.html" -Force
Copy-Item "$root\public\styles.css" ".\public\styles.css" -Force
Copy-Item "$root\public\app.js" ".\public\app.js" -Force

Write-Host ""
Write-Host "Fichiers copiés." -ForegroundColor Green
Write-Host "Le fichier src\index.dashboard.js contient la nouvelle version." -ForegroundColor Yellow
Write-Host "Pour l'activer, remplace src\index.js par src\index.dashboard.js après avoir vérifié le contenu." -ForegroundColor Yellow
Write-Host ""
Write-Host "Teste ensuite :" -ForegroundColor Cyan
Write-Host "node --check .\src\index.dashboard.js"
Write-Host ""
