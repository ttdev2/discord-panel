@echo off
echo Iniciando Discord Panel...
pm2 stop discord-panel 2>nul
pm2 start server.js --name discord-panel --restart-delay 2000 --max-restarts 50
pm2 save
timeout /t 2 /nobreak >nul
start "Cloudflare" cloudflared.exe tunnel --url http://localhost:80
echo Pronto! Veja a janela do Cloudflare para pegar a URL.
echo Servidor com auto-restart ativo via PM2.
