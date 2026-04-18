# Discord Panel - GitHub Setup Script
# Execute este script para fazer upload automatico no GitHub

Write-Host "==== GITHUB SETUP ====" -ForegroundColor Cyan
Write-Host "Colocar seu codigo no GitHub" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Git
Write-Host "1. Verificando Git..." -ForegroundColor Yellow
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "   OK - Git encontrado" -ForegroundColor Green
} else {
    Write-Host "   ERRO - Baixe em: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# 2. Configurar Git
Write-Host "2. Configurando Git (primera vez)..." -ForegroundColor Yellow
git config --global user.name "Seu Nome" 2>$null
git config --global user.email "seu@email.com" 2>$null
Write-Host "   OK" -ForegroundColor Green

# 3. Criar .gitignore
Write-Host "3. Criando .gitignore..." -ForegroundColor Yellow
if (-not (Test-Path ".gitignore")) {
    $gitignore = @"
.env
.env.local
node_modules/
dist/
build/
logs/
.DS_Store
Thumbs.db
.vscode/
.idea/
npm-debug.log*
yarn-debug.log*
"@
    Set-Content -Path ".gitignore" -Value $gitignore -Encoding UTF8
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "   OK - Ja existe" -ForegroundColor Green
}

# 4. Inicializar Git
Write-Host "4. Inicializando Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init 2>&1 | Out-Null
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "   OK - Ja existe" -ForegroundColor Green
}

# 5. Adicionar arquivos
Write-Host "5. Adicionando arquivos..." -ForegroundColor Yellow
Write-Host "   Processando (pode demorar)..." -ForegroundColor Gray

# Primeiro criar .gitignore para excluir node_modules ANTES de adicionar
if (-not (Test-Path ".gitignore")) {
    $gitignore = @"
.env
.env.local
node_modules/
dist/
build/
logs/
.DS_Store
Thumbs.db
.vscode/
.idea/
npm-debug.log*
yarn-debug.log*
"@
    Set-Content -Path ".gitignore" -Value $gitignore -Encoding UTF8
}

# Adicionar com limite de timeout
$addProcess = Start-Process -FilePath "git" -ArgumentList "add", "-A" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
if ($addProcess.ExitCode -eq 0 -or $addProcess.ExitCode -eq $null) {
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "   AVISO - Git add completou com status: $($addProcess.ExitCode)" -ForegroundColor Yellow
}

# 6. Commit
Write-Host "6. Fazendo commit..." -ForegroundColor Yellow
$commitExists = git log --oneline 2>$null | Select-Object -First 1
if (-not $commitExists) {
    git commit -m "Initial commit" 2>&1 | Out-Null
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "   OK - Ja existe" -ForegroundColor Green
}

# 7. Branch main
Write-Host "7. Configurando branch main..." -ForegroundColor Yellow
git branch -M main 2>&1 | Out-Null
Write-Host "   OK" -ForegroundColor Green

Write-Host ""
Write-Host "==== PARTE LOCAL PRONTA ====" -ForegroundColor Green
Write-Host ""
Write-Host "AGORA:" -ForegroundColor Cyan
Write-Host "1. Abra https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Nome: discord-panel" -ForegroundColor Yellow
Write-Host "3. Selecione PUBLIC" -ForegroundColor Yellow
Write-Host "4. Create repository" -ForegroundColor Yellow
Write-Host "5. Copie a URL (https://github.com/seu-usuario/discord-panel.git)" -ForegroundColor Yellow
Write-Host ""

$repoURL = Read-Host "Cole a URL"

if (-not $repoURL.StartsWith("https://")) {
    Write-Host "URL invalida!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Conectando ao GitHub..." -ForegroundColor Yellow
git remote add origin $repoURL 2>&1 | Out-Null
git push -u origin main 2>&1

Write-Host ""
Write-Host "==== SUCESSO ====" -ForegroundColor Green
Write-Host "Repositorio: $repoURL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora use REPLIT ou VERCEL para colocar ONLINE:" -ForegroundColor Yellow
Write-Host "  - Replit: replit.com -> Import from GitHub" -ForegroundColor Gray
Write-Host "  - Vercel: vercel.com -> New Project" -ForegroundColor Gray
Write-Host ""

Read-Host "Pressione Enter"
