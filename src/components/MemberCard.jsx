import React, { memo, useState } from 'react';
import { Shield } from 'lucide-react';
import { getUserBadges, getAvatarUrl, NITRO_TYPES } from '../constants.js';

/**
 * Badge Icon Component
 * Displays badge image with fallback handling
 */
function BadgeIcon({ src, alt }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) return null;

  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      className="w-5 h-5 object-contain flex-shrink-0 rounded"
    />
  );
}

/**
 * Get booster badge icon based on boost duration
 * Returns appropriate tier icon (1-5m, 6-14m, 15m+)
 */
function getBoosterMonths(premiumSince) {
  const months = Math.floor(
    (Date.now() - new Date(premiumSince).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  return months;
}

function getBoosterIcon(premiumSince) {
  const months = getBoosterMonths(premiumSince);
  if (months >= 15) return '/badges/15.png';
  if (months >= 6) return '/badges/14.png';
  return '/badges/5.png';
}

/**
 * Member Card Component
 * Displays a single member's info with badges, nitro status, etc
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const MemberCard = memo(function MemberCard({ member }) {
  const { user, premium_since, roles, nick } = member;
  const [avatarError, setAvatarError] = useState(false);

  const publicFlags = user?.public_flags || 0;
  const badges = getUserBadges(publicFlags);
  const isBooster = !!premium_since;
  const nitroInfo = user?.premium_type != null ? NITRO_TYPES[user.premium_type] : null;
  const displayName = nick || user?.global_name || user?.username || 'Unknown';
  const tag = user?.discriminator && user.discriminator !== '0' ? `#${user.discriminator}` : '';

  const avatarUrl = avatarError ? 'https://cdn.discordapp.com/embed/avatars/0.png' : getAvatarUrl(user);

  return (
    <div className="bg-discord-card rounded-lg p-4 flex flex-col gap-3 border border-transparent hover:border-discord-blurple transition-all duration-200 hover:shadow-lg hover:shadow-discord-blurple/10">
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            loading="lazy"
            onError={() => setAvatarError(true)}
            className="w-12 h-12 rounded-full object-cover"
          />
          {isBooster && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: '#f47fff' }}
              title="Server Booster"
            >
              💠
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate text-sm">{displayName}</p>
          <p className="text-discord-subtle text-xs truncate">
            {user?.username}
            {tag}
          </p>
          <p className="text-discord-subtle text-xs font-mono truncate">{user?.id}</p>
        </div>
      </div>

      {/* Badges row: icons only, emoji fallback if CDN fails */}
      {(badges.length > 0 || isBooster || (nitroInfo && nitroInfo.label !== 'Sem Nitro')) && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {badges.map((badge) => (
            <BadgeIcon key={badge.flag} src={badge.icon} alt={badge.label} />
          ))}
          {isBooster && <BadgeIcon src={getBoosterIcon(premium_since)} alt={`Booster ${getBoosterMonths(premium_since)}m`} />}
          {nitroInfo && nitroInfo.label !== 'Sem Nitro' && (
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: nitroInfo.color }}
              title={nitroInfo.label}
            >
              {nitroInfo.emoji}
            </span>
          )}
        </div>
      )}

      {/* Roles count */}
      {roles && roles.length > 0 && (
        <div className="flex items-center gap-1 text-discord-subtle text-xs">
          <Shield size={11} />
          <span>
            {roles.length} cargo{roles.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
});

export default MemberCard;

