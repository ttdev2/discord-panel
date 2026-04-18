/**
 * Discord Badges Configuration
 * Single source of truth for all badge definitions
 * Includes: flags, labels, icons, rarity, and filtering options
 */

const B = (f) => `/badges/${f}`;

// Core badge definitions - single source of truth
export const BADGES = {
  DISCORD_EMPLOYEE: {
    flag: 1 << 0,
    label: 'Discord Staff',
    icon: B('Discord-staff.png'),
    color: '#5865f2',
    rare: true,
  },
  PARTNERED_SERVER_OWNER: {
    flag: 1 << 1,
    label: 'Partner',
    icon: B('partner.png'),
    color: '#5865f2',
    rare: true,
  },
  HYPESQUAD_EVENTS: {
    flag: 1 << 2,
    label: 'HypeSquad Events',
    icon: B('hypesquadevents.png'),
    color: '#eb459e',
    rare: true,
  },
  BUG_HUNTER_LEVEL_1: {
    flag: 1 << 3,
    label: 'Bug Hunter',
    icon: B('bughunter.png'),
    color: '#fee75c',
    rare: true,
  },
  HOUSE_BRAVERY: {
    flag: 1 << 6,
    label: 'HypeSquad Bravery',
    icon: B('discord-hypesquad-bravery-house-badge.jpg'),
    color: '#9b59b6',
    rare: false,
  },
  HOUSE_BRILLIANCE: {
    flag: 1 << 7,
    label: 'HypeSquad Brilliance',
    icon: B('dsicord-hypesquad-brilliance-house-badge.jpg'),
    color: '#e74c3c',
    rare: false,
  },
  HOUSE_BALANCE: {
    flag: 1 << 8,
    label: 'HypeSquad Balance',
    icon: B('discord-hypesquad-balance-house-badge.jpg'),
    color: '#2ecc71',
    rare: false,
  },
  EARLY_SUPPORTER: {
    flag: 1 << 9,
    label: 'Early Supporter',
    icon: B('earlysupporter.png'),
    color: '#7289da',
    rare: true,
  },
  BUG_HUNTER_LEVEL_2: {
    flag: 1 << 14,
    label: 'Gold Bug Hunter',
    icon: B('bughuntergold.png'),
    color: '#f0b432',
    rare: true,
  },
  VERIFIED_BOT: {
    flag: 1 << 16,
    label: 'Verified Bot',
    icon: null,
    color: '#5865f2',
    rare: false,
  },
  EARLY_VERIFIED_BOT_DEVELOPER: {
    flag: 1 << 17,
    label: 'Early Bot Dev',
    icon: B('earlybotdev.png'),
    color: '#57f287',
    rare: true,
  },
  DISCORD_CERTIFIED_MODERATOR: {
    flag: 1 << 18,
    label: 'Cert. Moderator',
    icon: B('certificademod.png'),
    color: '#5865f2',
    rare: true,
  },
  ACTIVE_DEVELOPER: {
    flag: 1 << 22,
    label: 'Active Dev',
    icon: B('icons8-discord-active-developer-badge-48.png'),
    color: '#57f287',
    rare: false,
  },
};

// Derived: User flags for bitwise operations
export const USER_FLAGS = Object.fromEntries(
  Object.entries(BADGES).map(([key, badge]) => [key, badge.flag])
);

// Derived: Badge info array (for displaying badges)
export const RARE_BADGE_INFO = Object.values(BADGES);

// Scraping options - what users can filter for
export const SCRAP_OPTIONS = [
  // Rare badges (high priority)
  ...Object.values(BADGES)
    .filter((b) => b.rare && b.icon)
    .map((b) => ({
      key: String(b.flag),
      icon: b.icon,
      label: b.label,
      rare: true,
      needsDeep: false,
    })),
  // Non-rare badges
  ...Object.values(BADGES)
    .filter((b) => !b.rare && b.icon)
    .map((b) => ({
      key: String(b.flag),
      icon: b.icon,
      label: b.label,
      rare: false,
      needsDeep: false,
    })),
  // Boost levels (filtered by premium_since date)
  { key: 'boost1', icon: B('5.png'), label: 'Booster 1-5m', rare: false, needsDeep: false },
  { key: 'boost2', icon: B('14.png'), label: 'Booster 6-14m', rare: false, needsDeep: false },
  { key: 'boost3', icon: B('15.png'), label: 'Booster 15m+', rare: false, needsDeep: false },
  // Nitro types (requires Deep Scan for user profile access)
  { key: 'nitro2', icon: B('premium.png'), label: 'Nitro', rare: false, needsDeep: true },
  { key: 'nitro3', icon: B('classic.png'), label: 'Nitro Basic', rare: false, needsDeep: true },
  // Username length
  { key: 'len2', icon: null, label: '2 chars', rare: false, needsDeep: false },
  { key: 'len3', icon: null, label: '3 chars', rare: false, needsDeep: false },
];

// Nitro subscription types
export const NITRO_TYPES = {
  0: { label: 'Sem Nitro', color: '#80848e', emoji: null },
  1: { label: 'Nitro Classic', color: '#f47fff', emoji: '💎' },
  2: { label: 'Nitro', color: '#f47fff', emoji: '🚀' },
  3: { label: 'Nitro Basic', color: '#c8a2c8', emoji: '✨' },
};

/**
 * Get badges for a user based on their public flags
 * @param {number} publicFlags - Discord user public_flags bitfield
 * @returns {Array} Array of badge objects the user has
 */
export function getUserBadges(publicFlags) {
  return RARE_BADGE_INFO.filter((b) => (publicFlags & b.flag) !== 0);
}

/**
 * Check if user has any rare badge
 * @param {number} publicFlags - Discord user public_flags bitfield
 * @returns {boolean} True if user has at least one rare badge
 */
export function isRareBadgeHolder(publicFlags) {
  return RARE_BADGE_INFO.filter((b) => b.rare).some((b) => (publicFlags & b.flag) !== 0);
}

/**
 * Get Discord CDN avatar URL for a user
 * Falls back to default avatar if user has no custom avatar
 * @param {Object} user - Discord user object
 * @returns {string} Avatar URL
 */
export function getAvatarUrl(user) {
  if (!user?.avatar) {
    // Default avatar: discriminator-based for old users, ID-based for new users
    const index = user?.discriminator === '0'
      ? Number(BigInt(user.id) >> 22n) % 6
      : parseInt(user?.discriminator || '0') % 5;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  // Animated avatars use .gif, others use .png
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

/**
 * Get Discord CDN guild icon URL
 * @param {Object} guild - Discord guild object
 * @returns {string|null} Guild icon URL or null if no icon
 */
export function getGuildIcon(guild) {
  if (!guild?.icon) return null;
  const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=128`;
}
