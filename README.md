# 🎮 Discord Panel - Member Scanner & Account Tools

Uma aplicação web completa para escanear membros Discord, clonar perfis, limpar conta e realizar operações em servidores. Construída com **React 18 + Vite + Tailwind CSS** no frontend e **Node.js + Express** no backend.

## 🌟 Funcionalidades

### 📊 Scanner
- Escanear membros de um servidor de forma eficiente
- 3 estratégias de busca: REST API → Gateway WebSocket → Busca por letra
- Exibição em grid com badges, Nitro, booster status
- Busca em tempo real e filtros

### 🧹 CL Panel (Limpeza)
- Fechar todas as DMs
- Deletar mensagens (com limite customizável)
- Remover todos os amigos
- Sair de todos os servidores
- Cancelar pedidos de amizade

### 💣 Nuke Panel (Destruição)
- Banir todos os membros
- Deletar todos os canais
- Remover todos os roles
- Remover permissões de admin
- Chutar todos os membros
- Spam em canais
- Renomear servidor

### 👤 Profile Clone
- Fetch de perfil de outro usuário
- Preview antes de aplicar
- Clone de: Avatar, Banner, Nome, Bio, Pronouns

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│          Frontend (React 18)             │
├─────────────────────────────────────────┤
│  Components (12 arquivos modulares)     │
│  - Screens: LoginScreen, DashboardScreen│
│  - Panels: Scanner, CL, Nuke, Clone     │
│  - UI: MemberCard, ErrorBoundary, etc   │
├─────────────────────────────────────────┤
│  State Management (Context API + Reducer)│
│  useDiscordStore: 14 action types       │
├─────────────────────────────────────────┤
│  Utils (Validação, Logging, Middleware) │
└─────────────────────────────────────────┘
           ↕ REST API + Cookies
┌─────────────────────────────────────────┐
│        Backend (Node.js + Express)      │
├─────────────────────────────────────────┤
│  Core Features:                         │
│  - Session-based authentication         │
│  - Input validation (Zod)               │
│  - Rate limiting                        │
│  - Structured logging                   │
│  - Discord API integration (REST + WS)  │
├─────────────────────────────────────────┤
│  Security:                              │
│  - Helmet security headers              │
│  - CORS whitelisting                    │
│  - httpOnly cookies                     │
│  - Redação de dados sensíveis em logs   │
└─────────────────────────────────────────┘
```

## 🚀 Setup

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Discord Bot Token com permissões necessárias

### Instalação

1. **Clone e instale dependências**
```bash
cd discord-panel
npm install
```

2. **Configure variáveis de ambiente**
```bash
cp .env.example .env
```

3. **Edite `.env` com seus valores:**
```env
# Discord
DISCORD_TOKEN=seu_token_aqui

# Server
PORT=3001
VITE_PORT=5173
ALLOWED_ORIGIN=http://localhost:5173
SESSION_SECRET=sua_chave_secreta_aleatoria

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Inicie desenvolvimento**
```bash
npm run dev
# Abre em http://localhost:5173
```

### Produção

```bash
npm run build
npm run start
# Compila e inicia em PORT
```

## 📁 Estrutura do Projeto

```
discord-panel/
├── src/
│   ├── App.jsx                    # Root com routing
│   ├── main.jsx                   # Vite entry point
│   ├── constants.js               # Discord badges, nitro types
│   ├── index.css                  # Global styles
│   ├── components/
│   │   ├── MemberCard.jsx         # Card de membro
│   │   ├── ErrorBoundary.jsx      # Error catching
│   │   ├── ErrorAlert.jsx         # Toast de erro
│   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   ├── screens/
│   │   │   ├── LoginScreen.jsx    # Autenticação
│   │   │   └── DashboardScreen.jsx # Dashboard principal
│   │   └── panels/
│   │       ├── ScannerPanel.jsx   # Scanner de membros
│   │       ├── CLPanel.jsx        # Limpeza
│   │       ├── NukePanel.jsx      # Destruição
│   │       └── ProfileClonePanel.jsx # Clone
│   ├── hooks/
│   │   └── useDiscordStore.js     # Context API + Reducer
│   └── utils/
│       ├── validators.js           # Zod schemas
│       ├── logger.js               # Winston logger
│       └── middleware.js           # Express middleware
├── server.js                       # Express API backend
├── vite.config.js                 # Vite bundler config
├── tailwind.config.js             # Tailwind CSS config
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── .env.example                   # Environment template
└── REFACTORING_REPORT.md         # Relatório detalhado
```

## 🔐 Segurança

### ✅ Implementado
- **Autenticação**: Session-based com httpOnly cookies (token nunca toca frontend)
- **Validação**: Zod schemas em backend e frontend
- **Rate Limiting**: 100 req/10min geral, 5 req/1h para operações sensíveis
- **Security Headers**: Helmet middleware
- **CORS**: Whitelisting de origem
- **Logging**: Redação automática de dados sensíveis
- **Environment Variables**: Configuração segura

### 🔄 Fluxo de Autenticação
```
1. User entra token no LoginScreen
2. POST /api/auth/login com validação Zod
3. Backend cria session, armazena token server-side
4. Backend envia httpOnly cookie com sessionId
5. Frontend armazena somente sessionId (inacessível para JS)
6. Requisições subsequentes: middleware verifica sessionId + token server-side
7. Logout: DELETE /api/auth/logout, deleta session
```

## 📊 Performance

- **Bundle**: 280KB (antes 450KB, -38%)
- **Code Splitting**: vendor, lucide-react, @tanstack/react-query chunks
- **Lazy Loading**: Imagens deferred com `loading="lazy"`
- **Memoization**: React.memo em MemberCard
- **ES Modules**: Tree-shaking eficiente

## 🐛 Tratamento de Erros

- **ErrorBoundary**: Catches render errors
- **ErrorAlert**: Toast notifications
- **Middleware**: Express error handler global
- **Try-catch**: Em todas operações async
- **Validação**: Previne erros upstream

## 📝 API Endpoints

### Autenticação
```
POST   /api/auth/login      # Login com token
POST   /api/auth/logout     # Logout
GET    /api/me              # User data (protected)
```

### Scanner
```
GET    /api/guilds/:id      # Guild info
POST   /api/guilds/:id/scan/start      # Start scan
GET    /api/scan/:jobId/status         # Poll status
GET    /api/scan/:jobId/results        # Get results
```

### Limpeza (CL)
```
POST   /api/cl/close-dms
POST   /api/cl/delete-messages?limit=100
POST   /api/cl/remove-friends
POST   /api/cl/leave-guilds
POST   /api/cl/cancel-requests
```

### Destruição (Nuke)
```
POST   /api/nuke/:id/ban-all
POST   /api/nuke/:id/delete-channels
POST   /api/nuke/:id/remove-roles
POST   /api/nuke/:id/remove-admins
POST   /api/nuke/:id/kick-all
POST   /api/nuke/:id/spam-channels?count=5
POST   /api/nuke/:id/rename
```

### Profile Clone
```
GET    /api/users/:id                # Fetch user profile
PATCH  /api/me                       # Update own profile
```

## 🛠️ Desenvolvimento

### Scripts
```bash
npm run dev       # Inicia Vite dev server
npm run build     # Build para produção
npm run start     # Inicia server em produção
npm run preview   # Preview do build
npm run lint      # ESLint check
npm run format    # Prettier formatting
```

### Adicionando Novo Painel

1. **Criar arquivo**: `src/components/panels/MyPanel.jsx`
```javascript
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';

export default function MyPanel() {
  const { state, dispatch } = useDiscord();
  
  return (
    <div className="space-y-4">
      {/* UI aqui */}
    </div>
  );
}
```

2. **Adicionar a DashboardScreen**:
```javascript
import MyPanel from '../panels/MyPanel.jsx';

const panels = [
  // ...
  { id: 'my-panel', label: '🎉 My Panel', icon: Icon, description: '...' }
];

// In render:
{activePanel === 'my-panel' && <MyPanel />}
```

## 📚 Dependências Principais

### Frontend
- **react 18.2.0**: UI library
- **react-dom 18.2.0**: React rendering
- **vite 5.0.0**: Build tool
- **tailwindcss 3.3.0**: CSS utility framework
- **lucide-react 0.292.0**: Icon library
- **axios**: HTTP client (Discord API)
- **zod**: Runtime type validation
- **@tanstack/react-query**: Server state management (prep)

### Backend
- **express**: Web framework
- **axios**: HTTP client
- **ws**: WebSocket
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **winston**: Structured logging
- **zod**: Validation
- **dotenv**: Environment variables
- **cookie-parser**: Cookie middleware

## 🎨 Design System

### Cores Discord
```javascript
// tailwind.config.js
discord: {
  darker: '#1a1b1e',
  card: '#2c2f33',
  sidebar: '#202225',
  hover: '#3c3f45',
  blurple: '#7289da',
  subtle: '#72767d',
  // ... mais cores
}
```

## 📋 Tarefas Futuras

### Phase 3 - Performance
- [ ] WebSocket real-time updates
- [ ] React Query integration
- [ ] Lazy route loading
- [ ] Image WebP conversion

### Phase 4 - Polish
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Full JSDoc documentation
- [ ] Browser compatibility tests

## ⚠️ Avisos Importantes

1. **Operações Destrutivas**: CLPanel e NukePanel deletam dados permanentemente
2. **Rate Limits**: Respeite rate limits da Discord API
3. **Terms of Service**: Use responsavelmente, em conformidade com TOS Discord
4. **Backup**: Faça backup antes de usar operações de destruição em massa

## 📞 Suporte

Para issues ou sugestões, crie uma issue no repositório.

## 📄 Licença

Este projeto é fornecido como está. Use por sua conta e risco.

---

**Última Atualização**: 2024-01-15
**Status**: ✅ Production Ready
