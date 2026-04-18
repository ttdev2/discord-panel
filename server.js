/**
 * Discord Scanner Panel - Backend API
 * Secure, modular backend with authentication, validation, and rate limiting
 *
 * Features:
 * - Session-based authentication (Cookie httpOnly)
 * - Input validation with Zod schemas
 * - Rate limiting for protection against DDoS
 * - Secure logging (no token exposure)
 * - Multiple scanning techniques (REST, Gateway WebSocket, Letter search)
 * - Async job system for long-running operations
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import WebSocket from 'ws';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Internal modules
import logger from './src/utils/logger.js';
import {
  requireAuth,
  generalLimiter,
  strictLimiter,
  errorHandler,
  createSession,
  getSession,
  deleteSession,
  startSessionCleanup,
} from './src/utils/middleware.js';
import { validateInput, GuildIDSchema, TokenSchema } from './src/utils/validators.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 80;
const DISCORD_API = 'https://discord.com/api/v10';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// ─────── Middleware Setup ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Apply rate limiting to all routes
app.use(generalLimiter);

// Static file serving
app.use('/badges', express.static('badges'));
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Start session cleanup job
startSessionCleanup();

// ─────── Utility Functions ───────────────────────────────────────────

/**
 * Sleep for given milliseconds
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Make authenticated request to Discord API
 * Handles rate limiting with exponential backoff
 * Note: Token is not logged for security
 */
async function discordRequest(url, token, params = {}) {
  const headers = { Authorization: token };
  let retries = 0;
  const MAX_RETRIES = 3;

  while (retries < MAX_RETRIES) {
    try {
      const res = await axios.get(`${DISCORD_API}${url}`, { headers, params });
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      // Log unexpected errors
      if (![401, 403, 429].includes(status)) {
        console.error('[DISCORD API ERROR]', {
          endpoint: url,
          status,
          statusText: err.response?.statusText,
          data
        });
      }

      if (status === 429) {
        const retryAfter = (data?.retry_after || 1) * 1000;
        logger.warn('Discord API rate limited', { endpoint: url });
        await sleep(retryAfter + 200);
        retries++;
      } else if (status === 401) {
        const error = new Error('Token inválido ou expirado');
        error.status = 401;
        throw error;
      } else if (status === 403) {
        const error = new Error('Acesso negado');
        error.status = 403;
        throw error;
      } else {
        throw err;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// ─────── Authentication Endpoints ───────────────────────────────────

/**
 * POST /api/auth/login
 * Validate token and create secure session
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { token } = req.body;

    const validation = validateInput(TokenSchema, token);
    if (!validation.success) {
      logger.warn('Invalid token format');
      return res.status(400).json({ error: 'Token format inválido' });
    }

    const userData = await discordRequest('/users/@me', token);
    if (!userData?.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const sessionId = createSession(userData.id, token);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    logger.info('User authenticated', { userId: userData.id });
    res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
      },
    });
  } catch (err) {
    // Log the full error for debugging
    console.error('[LOGIN ERROR DETAILS]', {
      message: err.message,
      status: err.status,
      response: err.response?.status,
      data: err.response?.data
    });
    logger.error('Login error', { message: err.message, status: err.status });
    const status = err.status || 500;
    res.status(status).json({ error: 'Token inválido ou expirado' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidate session
 */
app.post('/api/auth/logout', requireAuth, (req, res) => {
  deleteSession(req.sessionId);
  res.clearCookie('sessionId');
  logger.info('User logged out');
  res.json({ success: true });
});

/**
 * GET /api/me
 * Get current authenticated user info
 */
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const userData = await discordRequest('/users/@me', req.session.token);
    res.json(userData);
  } catch (err) {
    logger.error('Get user error', { message: err.message });
    res.status(err.status || 500).json({ error: 'Erro ao buscar usuário' });
  }
});

// ─────── Guild Endpoints ─────────────────────────────────────────────

/**
 * GET /api/guilds/:id
 * Get guild information with member count
 */
app.get('/api/guilds/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = validateInput(GuildIDSchema, id);
    if (!validation.success) {
      return res.status(400).json({ error: 'Guild ID inválido' });
    }

    const guildData = await discordRequest(
      `/guilds/${validation.data}?with_counts=true`,
      req.session.token
    );
    res.json(guildData);
  } catch (err) {
    logger.error('Guild fetch error', { error: err.message });
    const status = err.status || 500;
    let msg = 'Erro ao buscar servidor';
    if (status === 403) msg = 'Sem acesso ao servidor';
    if (status === 404) msg = 'Servidor não encontrado';
    res.status(status).json({ error: msg });
  }
});

// ─────── Gateway WebSocket Scanner ──────────────────────────────────

const GW_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789_'.split('');

/**
 * Scan members via Discord Gateway WebSocket
 * Uses op8 queries to bypass REST API member limits
 */
async function scanViaGateway(
  job,
  guildId,
  token,
  onChunk = null,
  sharedMemberMap = null,
  sharedDonePrefixes = null
) {
  const GATEWAY = process.env.DISCORD_GATEWAY_URL || 'wss://gateway.discord.gg/?v=10&encoding=json';
  const isBotToken = token.startsWith('Bot ');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(GATEWAY, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://discord.com',
      },
    });

    const memberMap = sharedMemberMap || new Map();
    const donePrefixes = sharedDonePrefixes || new Set();
    let heartbeatInterval = null;
    let seq = null;
    let resolved = false;
    let scanComplete = false;
    let chunkTimer = null;
    let queriesStarted = false;
    const queryQueue = [];
    const pendingQueries = new Map();
    const sentPrefixes = new Set(donePrefixes);
    let totalQueued = 0;
    let totalDone = 0;

    GW_CHARS.forEach((c) => {
      if (!donePrefixes.has(c)) {
        queryQueue.push({ prefix: c, depth: 1 });
        totalQueued++;
      }
    });

    const finish = (err) => {
      if (resolved) return;
      resolved = true;
      clearInterval(heartbeatInterval);
      clearTimeout(chunkTimer);
      try {
        ws.terminate();
      } catch (_) {}
      const collected = Array.from(memberMap.values());
      if (err && collected.length === 0) {
        logger.error('Gateway scan failed', { error: err.message });
        reject(err);
      } else {
        resolve({ members: collected, complete: scanComplete });
      }
    };

    const resetTimer = (ms = 22000) => {
      clearTimeout(chunkTimer);
      chunkTimer = setTimeout(() => {
        if (queryQueue.length > 0 && pendingQueries.size === 0) {
          sendNextQuery();
        } else if (pendingQueries.size === 0) {
          finish();
        }
      }, ms);
    };

    const MAX_CONCURRENT = 3;

    const sendNextQuery = () => {
      if (ws.readyState !== WebSocket.OPEN) return;

      while (pendingQueries.size < MAX_CONCURRENT && queryQueue.length > 0) {
        while (queryQueue.length > 0 && sentPrefixes.has(queryQueue[0].prefix)) {
          queryQueue.shift();
        }
        if (queryQueue.length === 0) break;

        const { prefix, depth } = queryQueue.shift();
        if (sentPrefixes.has(prefix)) continue;
        sentPrefixes.add(prefix);

        const nonce = `gw_${prefix}`;
        const pct = Math.round((totalDone / Math.max(totalQueued, 1)) * 100);
        job.progress = `🔤 "${prefix}" (${totalDone}/${totalQueued}, ${pct}%) — ${memberMap.size.toLocaleString()} membros`;
        job.found = memberMap.size;

        ws.send(
          JSON.stringify({
            op: 8,
            d: { guild_id: guildId, query: prefix, limit: 100, presences: true, nonce },
          })
        );
        pendingQueries.set(nonce, { prefix, depth, count: 0 });
      }

      if (queryQueue.length === 0 && pendingQueries.size === 0) {
        scanComplete = true;
        finish();
      } else {
        resetTimer(20000);
      }
    };

    ws.on('open', () => {
      job.progress = '🔌 Conectado ao Gateway Discord...';
    });

    ws.on('message', (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const { op, d, t, s } = payload;
      if (s != null) seq = s;

      // HELLO → heartbeat + IDENTIFY
      if (op === 10) {
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: seq }));
          }
        }, Math.floor(d.heartbeat_interval * 0.9));

        const identifyPayload = isBotToken
          ? {
              op: 2,
              d: {
                token,
                intents: 513,
                properties: { os: 'linux', browser: 'disco', device: 'disco' },
              },
            }
          : {
              op: 2,
              d: {
                token,
                capabilities: 4093,
                properties: {
                  os: 'Windows',
                  browser: 'Chrome',
                  device: '',
                  system_locale: 'pt-BR',
                  browser_user_agent:
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  browser_version: '124.0.0.0',
                  os_version: '10',
                  referrer: 'https://discord.com/',
                  referring_domain: 'discord.com',
                  referrer_current: '',
                  referring_domain_current: '',
                  release_channel: 'stable',
                  client_build_number: 258765,
                  client_event_source: null,
                },
                presence: { status: 'online', since: 0, activities: [], afk: false },
                compress: false,
                client_state: {
                  guild_versions: {},
                  highest_last_message_id: '0',
                  read_state_version: 0,
                  user_guild_settings_version: -1,
                  user_settings_version: -1,
                  private_channels_version: '0',
                  api_code_version: 0,
                },
              },
            };

        ws.send(JSON.stringify(identifyPayload));
      }

      if (op === 9) {
        finish(new Error('Sessão inválida'));
      }

      if (op === 0) {
        const beginScan = (channelId) => {
          if (queriesStarted) return;
          queriesStarted = true;
          const channels = channelId ? { [channelId]: [[0, 99]] } : {};
          ws.send(
            JSON.stringify({
              op: 14,
              d: {
                guild_id: guildId,
                typing: true,
                threads: false,
                activities: true,
                members: [],
                channels,
                thread_member_lists: [],
              },
            })
          );
          job.progress = '📡 Sincronizando lista de membros...';
          setTimeout(sendNextQuery, 3000);
        };

        if (t === 'READY') {
          job.progress = '✅ Autenticado. Aguardando GUILD_CREATE...';
          if (isBotToken) {
            ws.send(
              JSON.stringify({
                op: 8,
                d: { guild_id: guildId, query: '', limit: 0, presences: false, nonce: 'bot_all' },
              })
            );
            resetTimer(60000);
          } else {
            const readyGuilds = d.guilds || [];
            const guildEntry = readyGuilds.find((g) => g.id === guildId);
            if (guildEntry && !guildEntry.unavailable) {
              setTimeout(() => beginScan(null), 500);
            } else {
              setTimeout(() => {
                if (!queriesStarted) beginScan(null);
              }, 15000);
            }
          }
        }

        if (t === 'GUILD_CREATE' && d.id === guildId) {
          const textCh = (d.channels || []).find((c) => c.type === 0);
          setTimeout(() => beginScan(textCh?.id || null), 500);
        }

        if (t === 'GUILD_MEMBER_LIST_UPDATE' && d.guild_id === guildId && queriesStarted) {
          for (const op of d.ops || []) {
            for (const item of op.items || []) {
              if (item.member?.user?.id) {
                memberMap.set(item.member.user.id, item.member);
              }
            }
          }
          job.found = memberMap.size;
        }

        if (t === 'GUILD_MEMBERS_CHUNK' && d.guild_id === guildId) {
          const chunkMembers = d.members || [];
          const chunkPresences = d.presences || [];
          const presenceByUser = {};

          for (const p of chunkPresences) {
            if (p.user?.id) presenceByUser[p.user.id] = p;
          }

          for (const m of chunkMembers) {
            if (!m.user?.id) continue;
            if (presenceByUser[m.user.id]) m.presence = presenceByUser[m.user.id];
            memberMap.set(m.user.id, m);
          }

          if (onChunk && chunkMembers.length > 0) onChunk(chunkMembers);
          job.found = memberMap.size;

          const nonce = d.nonce || '';
          const isLast = d.chunk_index === d.chunk_count - 1;

          if (nonce === 'bot_all') {
            job.progress = `📦 Chunk ${d.chunk_index + 1}/${d.chunk_count}`;
            resetTimer(30000);
            if (isLast) finish();
          } else if (nonce.startsWith('gw_')) {
            const meta = pendingQueries.get(nonce);
            if (meta) meta.count += chunkMembers.length;

            if (isLast) {
              const count = meta?.count ?? chunkMembers.length;
              const { prefix, depth } = meta || {};
              pendingQueries.delete(nonce);

              if (prefix) donePrefixes.add(prefix);
              totalDone++;

              if (count === 100 && depth < 3) {
                GW_CHARS.forEach((c) => {
                  const sub = prefix + c;
                  if (!sentPrefixes.has(sub)) {
                    queryQueue.push({ prefix: sub, depth: depth + 1 });
                    totalQueued++;
                  }
                });
              }

              setTimeout(sendNextQuery, 40);
            }
          }
        }
      }
    });

    ws.on('error', (err) => {
      finish(new Error('WebSocket erro: ' + err.message));
    });

    ws.on('close', (code) => {
      logger.warn('Gateway closed', { code });
      if (!resolved) {
        finish(new Error(`Gateway fechou (${code})`));
      }
    });

    // Hard timeout: 10 minutes
    setTimeout(() => {
      if (!resolved) {
        job.progress += ' (timeout)';
        finish();
      }
    }, 10 * 60 * 1000);
  });
}

// ─────── Scan Jobs ──────────────────────────────────────────────────

const scanJobs = new Map();
const SEARCH_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789_.-'.split('');

/**
 * Main scan job runner - 3 phase fallback strategy
 */
async function runScanJob(job, guildId, token) {
  // Phase 1: REST pagination
  try {
    job.mode = 'paginated';
    job.progress = 'Carregando membros...';
    let allMembers = [];
    let after = '0';
    let page = 0;

    while (page < 200) {
      const params = { limit: 1000 };
      if (after !== '0') params.after = after;

      let chunk;
      try {
        chunk = await discordRequest(`/guilds/${guildId}/members`, token, params);
      } catch (e) {
        if (e.status === 429) {
          await sleep(5000);
          continue;
        }
        throw e;
      }

      if (!chunk || chunk.length === 0) break;
      allMembers = allMembers.concat(chunk);
      job.found = allMembers.length;
      job.progress = `Paginado: ${allMembers.length} membros...`;
      page++;

      if (chunk.length < 1000) break;
      after = chunk[chunk.length - 1].user.id;
      await sleep(350);
    }

    job.members = allMembers;
    job.found = allMembers.length;
    job.status = 'done';
    job.done = true;
    job.progress = `✅ ${allMembers.length} membros carregados.`;
    return;
  } catch (err) {
    if (err.status !== 403) throw err;
    job.progress = '⚠️ REST bloqueado. Tentando Gateway...';
    await sleep(500);
  }

  // Phase 2: Gateway WebSocket
  const gwMemberMap = new Map();
  const gwDonePrefixes = new Set();
  const MAX_GW_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_GW_RETRIES; attempt++) {
    try {
      job.mode = 'gateway';
      job.progress =
        attempt === 1
          ? '🔌 Conectando ao Gateway...'
          : `🔄 Reconectando (${attempt}/${MAX_GW_RETRIES})...`;

      const result = await scanViaGateway(job, guildId, token, null, gwMemberMap, gwDonePrefixes);
      job.found = gwMemberMap.size;

      if (result.complete) break;
      if (gwMemberMap.size === 0 && attempt >= 2) break;
      if (attempt < MAX_GW_RETRIES) {
        await sleep(3000);
        continue;
      }
    } catch (err) {
      job.progress = `⚠️ Gateway erro (${attempt}/${MAX_GW_RETRIES})`;
      if (gwMemberMap.size > 0) break;
      if (attempt < MAX_GW_RETRIES) await sleep(3000);
    }
  }

  if (gwMemberMap.size > 0) {
    job.members = Array.from(gwMemberMap.values());
    job.found = job.members.length;
    job.status = 'done';
    job.done = true;
    job.progress = `✅ ${job.members.length} membros encontrados.`;
    return;
  }

  job.progress = '⚠️ Tentando busca por letras...';

  // Phase 3: Letter-based search
  job.mode = 'search';
  const memberMap = new Map();

  for (let i = 0; i < SEARCH_CHARS.length; i++) {
    const ch = SEARCH_CHARS[i];
    job.progress = `🔍 Letra "${ch}" (${i + 1}/${SEARCH_CHARS.length})`;
    job.found = memberMap.size;

    let retries = 0;
    let abortSearch = false;

    while (retries < 2) {
      try {
        const results = await discordRequest(`/guilds/${guildId}/members/search`, token, {
          query: ch,
          limit: 1000,
        });

        (results || []).forEach((m) => {
          if (m.user?.id) memberMap.set(m.user.id, m);
        });
        break;
      } catch (e) {
        if (e.status === 429) {
          await sleep(5000);
          retries++;
        } else if (e.status === 403) {
          job.status = 'error';
          job.done = true;
          job.progress = '❌ Sem acesso ao servidor.';
          abortSearch = true;
          break;
        } else {
          job.errors = (job.errors || 0) + 1;
          break;
        }
      }
    }

    if (abortSearch) return;
    await sleep(700);
  }

  job.members = Array.from(memberMap.values());
  job.found = job.members.length;
  job.status = 'done';
  job.done = true;
  job.progress = `✅ ${job.members.length} membros encontrados.`;
}

/**
 * POST /api/guilds/:guildId/scan/start
 * Start asynchronous member scan
 */
app.post('/api/guilds/:guildId/scan/start', requireAuth, strictLimiter, async (req, res) => {
  try {
    const { guildId } = req.params;

    const validation = validateInput(GuildIDSchema, guildId);
    if (!validation.success) {
      return res.status(400).json({ error: 'Guild ID inválido' });
    }

    let guildData;
    try {
      guildData = await discordRequest(
        `/guilds/${validation.data}?with_counts=true`,
        req.session.token
      );
    } catch (err) {
      return res.status(err.status || 500).json({ error: 'Servidor não encontrado' });
    }

    const jobId = `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const job = {
      status: 'running',
      mode: 'paginated',
      done: false,
      found: 0,
      progress: 'Iniciando...',
      members: [],
      errors: 0,
      guildData,
    };

    scanJobs.set(jobId, job);

    runScanJob(job, validation.data, req.session.token).catch((err) => {
      job.status = 'error';
      job.done = true;
      job.progress = `❌ ${err.message}`;
      logger.error('Scan job failed', { error: err.message });
    });

    logger.info('Scan started', { guildId: validation.data });
    res.json({ jobId, guildData });
  } catch (err) {
    logger.error('Scan start error', { error: err.message });
    res.status(500).json({ error: 'Erro ao iniciar scan' });
  }
});

/**
 * GET /api/scan/status/:jobId
 * Get scan job status
 */
app.get('/api/scan/status/:jobId', requireAuth, (req, res) => {
  const job = scanJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });

  const { members, ...rest } = job;
  res.json(rest);
});

/**
 * GET /api/scan/result/:jobId
 * Get scan results
 */
app.get('/api/scan/result/:jobId', requireAuth, (req, res) => {
  const job = scanJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  if (!job.done) return res.status(202).json({ error: 'Scan ainda em andamento' });

  res.json({ members: job.members, total: job.members.length, guildData: job.guildData });
});

// ─────── Cleanup & Error Handling ────────────────────────────────────

// Cleanup old jobs every 15 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [jobId, job] of scanJobs.entries()) {
    if (job.done && now - parseInt(jobId.split('-')[1]) > 60 * 60 * 1000) {
      scanJobs.delete(jobId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info('Job cleanup', { removed: cleaned });
  }
}, 15 * 60 * 1000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Global error handler
app.use(errorHandler);

// ─────── Server Startup ──────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`✅ Discord Scanner API running on port ${PORT}`);
});
