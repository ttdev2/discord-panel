/**
 * Security Middleware
 * Includes: authentication, validation, rate limiting, error handling
 */

import rateLimit from 'express-rate-limit';
import logger from './logger.js';

// Session store (in-memory for this implementation)
const sessionStore = new Map();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Create authenticated session for user
 * @param {string} userId - Discord user ID
 * @param {string} token - Discord token
 * @returns {string} Session ID
 */
export function createSession(userId, token) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessionStore.set(sessionId, {
    userId,
    token,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  });
  return sessionId;
}

/**
 * Retrieve session from cookie
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session data or null if invalid/expired
 */
export function getSession(sessionId) {
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    logger.warn('Invalid session accessed', { sessionId });
    return null;
  }
  
  // Check expiration
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessionStore.delete(sessionId);
    logger.info('Session expired', { sessionId });
    return null;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  return session;
}

/**
 * Invalidate session (logout)
 * @param {string} sessionId - Session ID
 */
export function deleteSession(sessionId) {
  sessionStore.delete(sessionId);
  logger.info('Session deleted', { sessionId });
}

/**
 * Middleware: Extract and validate session
 */
export function requireAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    logger.warn('Request without session', { ip: req.ip, path: req.path });
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Attach session to request
  req.session = session;
  req.sessionId = sessionId;
  next();
}

/**
 * Rate limiter for general endpoints
 * 100 requests per 10 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 600000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static files
    return req.path.startsWith('/badges') || req.path.startsWith('/dist');
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
});

/**
 * Rate limiter for sensitive operations (nuke, ban, delete)
 * 5 requests per hour
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_NUKE_MAX_REQUESTS || 5),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded (sensitive operation)', { ip: req.ip, path: req.path });
    res.status(429).json({ error: 'Too many sensitive requests. Please try again later.' });
  },
});

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Don't expose internal error details in production
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev ? err.message : 'Internal server error';
  const status = err.status || 500;
  
  res.status(status).json({ error: message });
}

/**
 * Cleanup expired sessions periodically
 * Runs every 1 hour
 */
export function startSessionCleanup() {
  setInterval(() => {
    let cleaned = 0;
    for (const [sessionId, session] of sessionStore.entries()) {
      if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
        sessionStore.delete(sessionId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.info('Session cleanup completed', { cleaned, remaining: sessionStore.size });
    }
  }, 60 * 60 * 1000); // 1 hour
}
