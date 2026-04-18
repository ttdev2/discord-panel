# Discord Panel - Push para GitHub
# Execute para enviar código para GitHub automaticamente

Write-Host "==== PUSH PARA GITHUB ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCOES:" -ForegroundColor Yellow
Write-Host "1. Abra: https://github.com/seu-usuario/discord-panel" -ForegroundColor Gray
Write-Host "2. Clique no botao verde 'Code'" -ForegroundColor Gray
Write-Host "3. Copie a URL HTTPS (comeca com https://)" -ForegroundColor Gray
Write-Host ""

# Pedir URL do repositório
Write-Host "Cole a URL do seu repositorio GitHub:" -ForegroundColor Cyan
Write-Host "(Ex: https://github.com/seu-usuario/discord-panel.git)" -ForegroundColor Gray
Write-Host ""

$repoURL = Read-Host "URL"

if (-not $repoURL.StartsWith("https://github.com/")) {
    Write-Host "ERRO - URL invalida!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Conectando ao GitHub..." -ForegroundColor Yellow

# Remover remote se existir
git remote remove origin 2>$null

# Adicionar novo remote
git remote add origin $repoURL 2>&1 | Out-Null

Write-Host "Enviando codigo..." -ForegroundColor Yellow
Write-Host "(Isso pode demorar de 1-5 minutos dependendo do tamanho)" -ForegroundColor Gray
Write-Host ""

# Push para GitHub
$pushOutput = git push -u origin main 2>&1
$pushExit = $LASTEXITCODE

if ($pushExit -eq 0) {
    Write-Host "==== SUCESSO ====" -ForegroundColor Green
    Write-Host "Seu codigo foi enviado para GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repositorio: $repoURL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Abra: https://replit.com" -ForegroundColor Cyan
    Write-Host "2. Click: + Create" -ForegroundColor Cyan
    Write-Host "3. Selecione: Import from GitHub" -ForegroundColor Cyan
    Write-Host "4. Cole a URL: $repoURL" -ForegroundColor Cyan
    Write-Host "5. Pronto! Seu app estara online em 2-3 minutos" -ForegroundColor Cyan
} else {
    Write-Host "ERRO ao fazer push:" -ForegroundColor Red
    Write-Host $pushOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "Solucoes:" -ForegroundColor Yellow
    Write-Host "1. Verifique se a URL esta correta" -ForegroundColor Gray
    Write-Host "2. Se usar autenticacao, gere um token em:" -ForegroundColor Gray
    Write-Host "   https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "3. Use: https://seu-usuario:token@github.com/seu-usuario/repo.git" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Pressione Enter para fechar"
