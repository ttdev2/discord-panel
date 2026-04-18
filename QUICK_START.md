# 🚀 QUICK START GUIDE

## 5 Minutos para Começar

### 1️⃣ Setup Inicial
```bash
# Clone o repositório
cd discord-panel

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com seu Discord token
```

### 2️⃣ Desenvolvimento
```bash
# Terminal 1: Backend (Node.js API)
npm run dev
# Escuta em http://localhost:3001

# Terminal 2: Frontend (Vite dev server)
# Automático com npm run dev, abre em http://localhost:5173
```

### 3️⃣ Autenticação
1. Abra http://localhost:5173 no navegador
2. Cole seu Discord token no input
3. Clique em "Login"
4. ✅ Redirecionado para o Dashboard

### 4️⃣ Funcionalidades

#### 📊 Scanner Panel
1. Digite o ID de um servidor Discord (17+ dígitos)
2. Clique "Fetch Guild" para validar
3. Clique "Start Scan" para escanear membros
4. Aguarde o progresso (polling automático)
5. Veja os membros em um grid com badges, Nitro, booster status
6. Use a busca para filtrar por nome

#### 🧹 CL Panel (Limpeza)
- **Close DMs**: Fecha todas DMs abertas
- **Delete Messages**: Delete suas mensagens (com limite)
- **Remove Friends**: Remove todos os amigos
- **Leave Guilds**: Sai de todos os servidores
- **Cancel Requests**: Cancela pedidos de amizade pendentes

⚠️ **Confirmação obrigatória** para cada operação

#### 💣 Nuke Panel (Destruição)
- **Ban All**: Bane todos os membros do servidor
- **Delete Channels**: Deleta todos os canais
- **Remove Roles**: Remove todos os roles
- **Remove Admins**: Remove permissões admin
- **Kick All**: Chuta todos os membros
- **Spam**: Envia mensagens em canais
- **Rename**: Renomeia o servidor

🔴 **GRANDE AVISO**: Estas operações são PERMANENTES e IRREVERSÍVEIS

#### 👤 Profile Clone
1. Digite o ID de um usuário Discord (18+ dígitos)
2. Clique "Fetch" para carregar perfil
3. Veja preview do perfil (avatar, banner, nome, bio, pronouns)
4. Clique "Apply to My Account" para clonar
5. ✅ Seu perfil é atualizado

### 5️⃣ Saída
```bash
# Clique no botão "Sair" no sidebar
# OU simplesmente feche o navegador
# (Session é validada, não persiste sem login)
```

---

## 📁 Estrutura de Arquivos - O Que Muda

### Novo em `src/`
```
components/
  ├── MemberCard.jsx ..................... Grid card de membro
  ├── ErrorBoundary.jsx ................. Previne crash
  ├── ErrorAlert.jsx .................... Toast erro
  ├── LoadingSpinner.jsx ................ Spinner
  ├── screens/
  │   ├── LoginScreen.jsx ............... ← Start aqui
  │   └── DashboardScreen.jsx
  └── panels/
      ├── ScannerPanel.jsx
      ├── CLPanel.jsx
      ├── NukePanel.jsx
      └── ProfileClonePanel.jsx

hooks/
  └── useDiscordStore.js ................ Context API global state

utils/
  ├── validators.js ..................... Zod schemas
  ├── logger.js ......................... Winston logging
  └── middleware.js ..................... Express auth/rate-limit
```

---

## 🔐 Segurança - Como Funciona

### Token Storage
```
❌ Antes: Token em localStorage (JavaScript access risk)
✅ Depois: Token em httpOnly cookie (JavaScript não pode acessar)
```

### Validação
```
❌ Antes: Sem validação, aceita qualquer input
✅ Depois: Zod validation em frontend + backend
```

### Rate Limiting
```
- Geral: 100 requisições / 10 minutos
- Sensível: 5 requisições / 1 hora (scan, nuke, etc)
```

---

## 🐛 Troubleshooting

### "Cannot GET /"
```bash
# Certifique-se que backend está rodando
npm run dev
# Veja se npm install completou
rm -rf node_modules package-lock.json && npm install
```

### "Invalid token"
```bash
# Seu token expirou ou é inválido
# Gere um novo token em Discord Developer Portal
# Copie e cole novamente no LoginScreen
```

### "Scanner não retorna membros"
```bash
# Possíveis causas:
# 1. Bot não tem permissão no servidor
# 2. Servidor bloqueou bot
# 3. ID do servidor inválido (17+ dígitos)

# Verifique:
# - Bot está no servidor?
# - Bot tem "Administrator" ou "Scan Members" permission?
# - ID está correto? (não é username)
```

### "Nuke Panel diz 'No guild selected'"
```bash
# Você precisa usar Scanner Panel primeiro
# Isso carrega o servidor no estado global
# Depois você pode usar Nuke operations
```

### Erro no console / aplicação crasheia
```bash
# ErrorBoundary deve ter capturado
# Veja a UI com mensagem de erro e botão "Reload"
# Clique para recarregar a página
# Se continuar, verifique logs:
tail -f logs/app.log
```

---

## 📊 Monitoramento

### Logs
```bash
# Logs são salvos em ./logs/app.log
# Rotating: máx 5MB, mantém 5 arquivos
tail -f logs/app.log | grep ERROR  # Ver apenas erros
tail -f logs/app.log | grep "Scan" # Ver scans
```

### API Health Check
```bash
curl http://localhost:3001/health
# Se erro 404, a rota não existe (normal)
# Se erro ECONNREFUSED, backend não está rodando
```

---

## 🏗️ Build para Produção

```bash
# Build frontend
npm run build
# Cria dist/

# Build backend (já está em JS)
# Apenas certifique-se que node_modules está instalado

# Inicie em produção
npm run start
# Escuta em PORT (padrão 3001)
```

### Variáveis de Ambiente Produção
```env
# .env (produção)
DISCORD_TOKEN=seu_token
PORT=3001
VITE_PORT=não_necessário  # Produção usa build compilado
ALLOWED_ORIGIN=https://seu-dominio.com
SESSION_SECRET=gera_com_openssl_rand_base64_32
LOG_LEVEL=warn  # Menos verbose em produção
```

---

## 📝 Desenvolvimento - Adicionar Novo Painel

### 1. Criar arquivo
```javascript
// src/components/panels/MyNewPanel.jsx
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';

export default function MyNewPanel() {
  const { state, dispatch } = useDiscord();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Meu Novo Painel</h2>
      {/* UI aqui */}
    </div>
  );
}
```

### 2. Adicionar a DashboardScreen
```javascript
// src/components/screens/DashboardScreen.jsx
import MyNewPanel from '../panels/MyNewPanel.jsx';

const panels = [
  // ... existing
  { 
    id: 'my-panel',
    label: '🎉 My Panel',
    icon: MyIcon,
    description: 'Meu painel novo'
  }
];

// In render:
{activePanel === 'my-panel' && <MyNewPanel />}
```

### 3. Pronto! 🎉
Novo painel aparece no sidebar automaticamente

---

## 📚 Documentação Completa

- **README.md** - Setup, features, APIs completas
- **REFACTORING_REPORT.md** - Análise técnica detalhada
- **CHANGELOG.md** - Todas as mudanças
- **IMPLEMENTATION_SUMMARY.js** - Resumo estruturado

---

## 🎯 Próximos Passos

### Agora (Phase 2 ✅)
- [x] Componentes modulares
- [x] State management
- [x] Segurança
- [x] Logging
- [x] Rate limiting

### Próximo (Phase 3)
- [ ] WebSocket real-time
- [ ] React Query caching
- [ ] Lazy route loading
- [ ] Image optimization

### Depois (Phase 4)
- [ ] Testes automatizados
- [ ] E2E testing
- [ ] Accessibility audit
- [ ] Production deploy

---

## ✅ Checklist de Primeira Execução

- [ ] `npm install` completou
- [ ] `.env` configurado com DISCORD_TOKEN válido
- [ ] `npm run dev` inicia sem erros
- [ ] Navegador abre em http://localhost:5173
- [ ] LoginScreen é exibido
- [ ] Você consegue fazer login com token
- [ ] Dashboard mostra user info
- [ ] Scanner Panel funciona
- [ ] Grid de membros é exibido
- [ ] Outros painéis estão acessíveis

Se tudo ✅, você está pronto para usar!

---

## 💡 Dicas

1. **Token Discord**: Vá para Discord Dev Portal → Bot → Token → Copy
2. **Guild ID**: Digite `@bot` em um servidor, o ID vem na mensagem
3. **User ID**: Digite `@username` para pegar o ID
4. **Logs**: Verifique `logs/app.log` se algo der errado
5. **Erros**: ErrorBoundary captura crashes, recarregue depois

---

**Pronto para começar? Execute `npm run dev` e abra o navegador! 🚀**

