/**
 * Input Validation Schema
 * Using Zod for runtime type-safe validation
 * These schemas are used both on frontend (UX) and backend (security)
 */

import { z } from 'zod';

// Validation patterns
const DISCORD_ID_PATTERN = /^\d{17,}$/;
const SNOWFLAKE_PATTERN = /^\d{17,19}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,}$/; // Simplified, actual format is more complex

// Basic ID validation
export const DiscordIDSchema = z
  .string()
  .trim()
  .refine(
    (id) => DISCORD_ID_PATTERN.test(id),
    { message: 'Discord ID must be a 17-20 digit number' }
  );

// Guild ID validation
export const GuildIDSchema = DiscordIDSchema;

// User ID validation
export const UserIDSchema = DiscordIDSchema;

// Channel ID validation
export const ChannelIDSchema = DiscordIDSchema;

// Token validation (basic)
export const TokenSchema = z
  .string()
  .trim()
  .refine(
    (token) => token.length > 20,
    { message: 'Invalid token format' }
  );

// Webhook URL validation
export const WebhookURLSchema = z
  .string()
  .trim()
  .url('Invalid webhook URL')
  .refine(
    (url) => url.includes('discord.com/api/webhooks/'),
    { message: 'Must be a Discord webhook URL' }
  );

// Query parameters for scanning
export const ScanQuerySchema = z.object({
  guildId: GuildIDSchema,
  token: TokenSchema.optional(),
});

// Nuke operation payload
export const NukePayloadSchema = z.object({
  guildId: GuildIDSchema,
  userIds: z.array(UserIDSchema).min(1),
});

// Profile clone payload
export const ProfileClonePayloadSchema = z.object({
  userId: UserIDSchema,
  username: z.string().min(1).max(32),
});

// Webhook configuration
export const WebhookConfigSchema = z.object({
  url: WebhookURLSchema,
  guildId: GuildIDSchema,
  filters: z.array(z.string()).optional(),
});

/**
 * Safely validate input and return result with error handling
 * @param {Object} schema - Zod schema
 * @param {*} data - Data to validate
 * @returns {Object} { success: boolean, data?: *, error?: string }
 */
export function validateInput(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}
