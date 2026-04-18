# Script para instalar Git automaticamente

Write-Host "==== INSTALADOR GIT ====" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git já está instalado
$gitExists = $null
try {
    $gitExists = git --version 2>$null
} catch {
    $gitExists = $null
}

if ($gitExists) {
    Write-Host "Git ja esta instalado: $gitExists" -ForegroundColor Green
    exit 0
}

Write-Host "Git nao encontrado. Instalando..." -ForegroundColor Yellow
Write-Host ""

# Download Git
$downloadUrl = "https://github.com/git-for-windows/git/releases/download/v2.45.0.windows.1/Git-2.45.0-64-bit.exe"
$installerPath = "$env:TEMP\git-installer.exe"

Write-Host "1. Baixando Git..." -ForegroundColor Yellow

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "   OK - Download concluido" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Nao conseguiu baixar" -ForegroundColor Red
    Write-Host "   Baixe manualmente em: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Instalando Git..." -ForegroundColor Yellow

# Instalar Git
try {
    & $installerPath /SILENT /NORESTART 2>$null
    Write-Host "   OK - Instalacao iniciada" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Nao conseguiu instalar" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Aguardando conclusao..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "==== CONCLUIDO ====" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: REINICIE O POWERSHELL!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Depois execute:" -ForegroundColor Cyan
Write-Host "  .\github-setup-simple.ps1" -ForegroundColor Cyan
Write-Host ""

# Limpar
Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue

Read-Host "Pressione Enter"
