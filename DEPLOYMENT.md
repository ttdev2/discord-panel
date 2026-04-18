#!/usr/bin/env node
/**
 * DEPLOYMENT GUIDE - Discord Panel Online
 * Como colocar sua aplicação online sem deixar rodando no PC
 */

const deploymentGuide = `
╔════════════════════════════════════════════════════════════════════════════╗
║           🌐 DEPLOYMENT GUIDE - Discord Panel Online                      ║
║                    Sem deixar o PC rodando 24/7                            ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🎯 OPÇÃO RECOMENDADA: Vercel (Frontend) + Railway (Backend)
═══════════════════════════════════════════════════════════════════════════════

✅ VERCEL (Frontend)
   • Grátis
   • Deploy automático do GitHub
   • Super rápido (CDN global)
   • URL: discord-panel.vercel.app

✅ RAILWAY (Backend)
   • $5/mês (muito barato)
   • 24/7 sem hibernar
   • Deploy automático
   • URL: discord-panel-api.railway.app

💰 Custo Total: ~$5/mês


═══════════════════════════════════════════════════════════════════════════════
📋 PASSO A PASSO - IMPLEMENTAÇÃO
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: Prepare o GitHub
────────────────────────────────────────────────────────────────────────────

1. Certifique-se que seu código está no GitHub
2. Crie arquivo .gitignore (se não tiver):

    .env
    node_modules/
    dist/
    logs/
    .DS_Store

3. Commit final:
    
    git add .
    git commit -m "Ready for production deployment"
    git push origin main

4. Verifique que no GitHub:
   - package.json está na raiz ✓
   - server.js está na raiz ✓
   - src/ está na raiz ✓


PASSO 2: Deploy Frontend no Vercel
────────────────────────────────────────────────────────────────────────────

1. Abra https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Autorize Vercel no GitHub
4. Click "New Project"
5. Selecione seu repositório "discord-panel"
6. Vercel vai sugerir:
   • Framework: Vite
   • Build Command: npm run build
   • Output Directory: dist
   • Install Command: npm install
   ✓ Clique em "Deploy"

7. Aguarde (~2 min)
8. Você receberá URL: https://seu-projeto.vercel.app

✅ Frontend online!


PASSO 3: Deploy Backend no Railway
────────────────────────────────────────────────────────────────────────────

1. Abra https://railway.app
2. Click "Start Project"
3. Click "Deploy from GitHub"
4. Selecione seu repositório "discord-panel"
5. Railway detecta Node.js automaticamente
6. Vá a "Variables" e adicione:

   DISCORD_TOKEN = seu_token_aqui (SECRETO!)
   PORT = 3001
   ALLOWED_ORIGIN = https://seu-projeto.vercel.app
   SESSION_SECRET = gere_com_comando_abaixo
   LOG_LEVEL = info
   VITE_PORT = não_necessário_em_prod

7. Para gerar SESSION_SECRET (no PowerShell):
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

8. Railway inicia automaticamente
9. Você receberá URL: https://seu-projeto.railway.app

✅ Backend online!


PASSO 4: Conectar Frontend ao Backend
────────────────────────────────────────────────────────────────────────────

1. Abra seu repo no GitHub
2. Edite arquivo: vite.config.js (ou crie .env.production)

   VITE_API_URL=https://seu-projeto.railway.app

3. Ou crie arquivo .env.production na raiz:

   VITE_API_URL=https://seu-projeto.railway.app

4. Commit e push:

   git add .env.production
   git commit -m "Configure production API URL"
   git push origin main

5. Vercel auto-redeploy (procura .env.production)

✅ Conectado!


PASSO 5: Teste
────────────────────────────────────────────────────────────────────────────

1. Abra seu site: https://seu-projeto.vercel.app
2. Digite seu token Discord
3. Clique "Login"
4. Se funcionar: ✅ SUCESSO!
5. Se não funcionar: Verifique logs em Railway dashboard


═══════════════════════════════════════════════════════════════════════════════
⚙️ CONFIGURAÇÕES IMPORTANTES
═══════════════════════════════════════════════════════════════════════════════

VARIÁVEIS DE AMBIENTE (Railway):
────────────────────────────────────────

DISCORD_TOKEN=MjEyMzQ1Njc4OTAxMjM0NTY3ODk... (seu token)
PORT=3001
ALLOWED_ORIGIN=https://seu-projeto.vercel.app
SESSION_SECRET=gerado_comando_acima
LOG_LEVEL=info

⚠️ NUNCA comite o .env no GitHub!
   Railroad/Vercel leem as variáveis do dashboard, não do arquivo.


CORS SETUP:
────────────────────────────────────────

Backend recebe requisições apenas de:
  https://seu-projeto.vercel.app

Se seu frontend está em outro URL, update ALLOWED_ORIGIN


═══════════════════════════════════════════════════════════════════════════════
🐛 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

❌ "Cannot GET /"
   → Backend não está respondendo
   → Verifique Railway logs
   → Verifique VITE_API_URL está correto

❌ "CORS error"
   → ALLOWED_ORIGIN não bate
   → Vercel URL !== ALLOWED_ORIGIN
   → Update em Railway variables

❌ "Invalid token"
   → DISCORD_TOKEN expirou ou está errado
   → Update em Railway dashboard

❌ "Vercel says build failed"
   → npm run build falhou
   → Verifique erros npm
   → Geralmente falta dependência


═══════════════════════════════════════════════════════════════════════════════
📊 ALTERNATIVAS
═══════════════════════════════════════════════════════════════════════════════

Se quer GRÁTIS (mas mais lento):
  ✓ Frontend: Vercel (grátis)
  ✓ Backend: Render.com (grátis, mas hiberna)
  ✗ Problema: Render dorme após 15 min, acorda em 30s

Se quer tudo em um lugar:
  ✓ Replit.com (grátis, fácil)
  ✗ Problema: Lento, hiberna

Se quer mais poder:
  ✓ AWS EC2 (grátis primeiro ano)
  ✓ DigitalOcean (droplet $4/mês)
  ✓ Linode ($5/mês)


═══════════════════════════════════════════════════════════════════════════════
💡 DICAS IMPORTANTES
═══════════════════════════════════════════════════════════════════════════════

1. Discord Token é SECRETO
   ✓ Nunca comite no GitHub
   ✓ Use variáveis de ambiente

2. Domínio Custom (opcional)
   ✓ Vercel suporta domínio próprio
   ✓ Railway suporta também
   ✓ Custa ~$5-15/ano em registrars

3. Auto-deploy
   ✓ Ambos Vercel e Railway monitoram seu GitHub
   ✓ Quando você faz git push, eles auto-deployam
   ✓ Sem fazer nada manualmente!

4. Logs
   ✓ Vercel: Deployments → View Build Logs
   ✓ Railway: View Logs na dashboard


═══════════════════════════════════════════════════════════════════════════════
🚀 PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Escolha Vercel + Railway (recomendado)
2. ✅ Crie contas em ambos serviços
3. ✅ Siga passos 1-5 acima
4. ✅ Teste seu site
5. ✅ Compartilhe URL com amigos!


═══════════════════════════════════════════════════════════════════════════════
📞 RESUMO RÁPIDO (Copiar-Colar)
═══════════════════════════════════════════════════════════════════════════════

VERCEL:
  1. vercel.com → Sign up com GitHub
  2. New Project → Selecione discord-panel repo
  3. Deploy automático
  4. Anote URL

RAILWAY:
  1. railway.app → Deploy from GitHub
  2. Selecione discord-panel repo
  3. Add Variables:
     - DISCORD_TOKEN=seu_token
     - ALLOWED_ORIGIN=https://vercel_url.vercel.app
     - SESSION_SECRET=random_string
     - PORT=3001
  4. Deploy automático
  5. Anote URL

CONECTAR:
  1. GitHub → edit vite.config.js
  2. VITE_API_URL=https://railway_url.railway.app
  3. git push
  4. Pronto!


═══════════════════════════════════════════════════════════════════════════════

Dúvidas? Volte a este arquivo quando precisar!

Criado: 2026-04-18
Status: Ready for Production
`;

console.log(deploymentGuide);

export default deploymentGuide;
