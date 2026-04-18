#!/usr/bin/env node
/**
 * GITHUB SETUP GUIDE - Discord Panel
 * Como colocar seu código no GitHub (passo a passo)
 */

const githubGuide = `
╔════════════════════════════════════════════════════════════════════════════╗
║         📤 GITHUB SETUP GUIDE - Discord Panel                             ║
║              Como fazer upload do seu código                               ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🎯 PASSO A PASSO COMPLETO
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: Crie repositório vazio no GitHub
────────────────────────────────────────────────────────────────────────────

1. Abra https://github.com
2. Login com sua conta
3. Click no ícone "+" (canto superior direito)
4. Selecione "New repository"
5. Preencha:
   - Repository name: discord-panel
   - Description: Discord Scanner & Account Tools
   - Public (✓ - necessário para Replit/Vercel)
   - NÃO selecione "Initialize with README"
6. Click "Create repository"

✅ Repositório criado!


PASSO 2: Configure Git localmente
────────────────────────────────────────────────────────────────────────────

1. Abra PowerShell na pasta do projeto
   cd C:\\Users\\Administrator\\Desktop\\kkj\\discord-panel

2. Configure seu nome e email (primeira vez apenas):
   
   git config --global user.name "Seu Nome"
   git config --global user.email "seu.email@example.com"

3. Inicialize Git:
   
   git init


PASSO 3: Crie .gitignore (IMPORTANTE!)
────────────────────────────────────────────────────────────────────────────

1. Crie arquivo ".gitignore" na raiz do projeto:
   
   New-Item -Path ".gitignore" -ItemType File

2. Abra com editor e cole:

   # Environment
   .env
   .env.local
   .env.*.local

   # Dependencies
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Build
   dist/
   build/

   # Logging
   logs/
   *.log

   # OS
   .DS_Store
   Thumbs.db

   # IDE
   .vscode/
   .idea/

3. Salve o arquivo


PASSO 4: Adicione arquivos ao Git
────────────────────────────────────────────────────────────────────────────

1. Abra PowerShell na pasta do projeto

2. Verifique o status:
   
   git status
   
   (Deve mostrar arquivos vermelhos - não rastreados)

3. Adicione tudo (menos .gitignore):
   
   git add .

4. Verifique novamente:
   
   git status
   
   (Agora deve mostrar arquivos verdes - staged)


PASSO 5: Faça o primeiro commit
────────────────────────────────────────────────────────────────────────────

1. Execute:
   
   git commit -m "Initial commit - Discord Panel refactored"

2. Output deve mostrar:
   
   [main (root-commit) abc1234] Initial commit...
   XX files changed...


PASSO 6: Conecte ao repositório do GitHub
────────────────────────────────────────────────────────────────────────────

1. Copie a URL do seu repositório GitHub (canto verde "Code")
   Exemplo: https://github.com/SEU_USUARIO/discord-panel.git

2. Adicione como remote:
   
   git remote add origin https://github.com/SEU_USUARIO/discord-panel.git
   
   (Substitua SEU_USUARIO pelo seu username do GitHub)

3. Renomeie branch para main (padrão):
   
   git branch -M main

4. Faça push (envia para GitHub):
   
   git push -u origin main


PASSO 7: Verifique no GitHub
────────────────────────────────────────────────────────────────────────────

1. Abra https://github.com/SEU_USUARIO/discord-panel
2. Você deve ver todos os seus arquivos listados
3. ✅ Sucesso! Seu código está no GitHub


═══════════════════════════════════════════════════════════════════════════════
🔄 PRÓXIMAS ATUALIZAÇÕES (quando quiser)
═══════════════════════════════════════════════════════════════════════════════

Depois de fazer mudanças no código:

1. Verifique status:
   git status

2. Adicione mudanças:
   git add .

3. Faça commit:
   git commit -m "Descrição das mudanças"

4. Faça push (envia para GitHub):
   git push

Pronto! GitHub atualizado automaticamente.


═══════════════════════════════════════════════════════════════════════════════
📋 COMANDOS ESSENCIAIS
═══════════════════════════════════════════════════════════════════════════════

git status
  → Ver quais arquivos foram modificados

git add .
  → Adicionar todos os arquivos para commit

git add nome-do-arquivo.js
  → Adicionar apenas um arquivo

git commit -m "Mensagem descritiva"
  → Fazer commit (salvar localmente)

git push
  → Enviar para GitHub

git pull
  → Trazer mudanças do GitHub (para sincronizar)

git log
  → Ver histórico de commits


═══════════════════════════════════════════════════════════════════════════════
⚠️ IMPORTANTE - O QUE NÃO COMMITAR
═══════════════════════════════════════════════════════════════════════════════

NUNCA comite esses arquivos (use .gitignore):

❌ .env (seu Discord token!)
❌ node_modules/ (muito grande)
❌ dist/ (gerado automaticamente)
❌ logs/ (arquivos de log)
❌ .DS_Store (arquivo do Mac)


═══════════════════════════════════════════════════════════════════════════════
🚀 AGORA USE PARA REPLIT/VERCEL
═══════════════════════════════════════════════════════════════════════════════

Com seu repositório público no GitHub:

1. Replit:
   → replit.com
   → "Import from GitHub"
   → Coloque: https://github.com/SEU_USUARIO/discord-panel
   → Deploy automático

2. Vercel:
   → vercel.com
   → "New Project"
   → Conecte GitHub
   → Selecione discord-panel
   → Deploy automático

3. Railway:
   → railway.app
   → "Deploy from GitHub"
   → Selecione discord-panel
   → Deploy automático


═══════════════════════════════════════════════════════════════════════════════
🐛 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

❌ "fatal: could not read Username"
   → Sua senha do GitHub mudou
   → Use Personal Access Token em vez de senha
   → Crie em: github.com/settings/tokens

❌ "fatal: remote origin already exists"
   → Git remote já configurado
   → Execute: git remote set-url origin https://seu-novo-url

❌ "refusing to merge unrelated histories"
   → Repositório local não corresponde ao remoto
   → Execute: git pull origin main --allow-unrelated-histories

❌ "nothing to commit, working tree clean"
   → Nenhuma mudança detectada
   → Verifique se fez alterações nos arquivos


═══════════════════════════════════════════════════════════════════════════════
💡 DICAS
═══════════════════════════════════════════════════════════════════════════════

1. Mensagens de commit descritivas
   ✓ git commit -m "Add lazy loading to MemberCard"
   ✗ git commit -m "fix"

2. Commit frequentemente
   ✓ Commits pequenos e focados
   ✗ Um commit gigante com tudo

3. Leia antes de fazer push
   git diff
   → Ver exatamente o que vai subir

4. Use branches para features (avançado)
   git checkout -b nova-feature
   git checkout main
   git merge nova-feature


═══════════════════════════════════════════════════════════════════════════════
🎯 RESUMO RÁPIDO (Copy-Paste)
═══════════════════════════════════════════════════════════════════════════════

PRIMEIRA VEZ:

git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USUARIO/discord-panel.git
git branch -M main
git push -u origin main

PRÓXIMAS VEZES:

git add .
git commit -m "Descrição"
git push


═══════════════════════════════════════════════════════════════════════════════

Dúvidas? Volte a este arquivo!

Criado: 2026-04-18
Status: Ready to Deploy
`;

console.log(githubGuide);

export default githubGuide;
