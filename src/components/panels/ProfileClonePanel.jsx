/**
 * Profile Clone Panel Component
 * Fetch profile data from another user and clone to your account:
 * - Avatar
 * - Banner
 * - Display Name
 * - Bio/About Me
 * - Pronouns
 * 
 * Allows preview before applying changes
 */

import { useState } from 'react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import ErrorAlert from '../ErrorAlert.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';
import { Copy, Search, Eye, Check } from 'lucide-react';

export default function ProfileClonePanel() {
  const { state, dispatch } = useDiscord();
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(null);
  const [preview, setPreview] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleFetchProfile = async () => {
    if (!targetUserId.trim()) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: 'Please enter a user ID', type: 'error' },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('User not found or blocked');

      const userData = await res.json();
      setFetched(userData);
      setPreview(false);

      dispatch({
        type: ACTIONS.CLEAR_ERROR,
      });
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: `Error: ${err.message}`, type: 'error' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProfile = async () => {
    if (!fetched) return;

    setApplying(true);
    try {
      const updates = {
        username: fetched.username || undefined,
        global_name: fetched.global_name || undefined,
        avatar: fetched.avatar || undefined,
        banner: fetched.banner || undefined,
        bio: fetched.bio || undefined,
        pronouns: fetched.pronouns || undefined,
      };

      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updated = await res.json();
      dispatch({
        type: ACTIONS.SET_USER_DATA,
        payload: updated,
      });

      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: '✓ Profile cloned successfully!', type: 'success' },
      });

      setFetched(null);
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: `Error: ${err.message}`, type: 'error' },
      });
    } finally {
      setApplying(false);
    }
  };

  const getAvatarUrl = (user) => {
    if (!user?.avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  };

  const getBannerUrl = (user) => {
    if (!user?.banner) return null;
    return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-discord-darker rounded-lg p-6 border border-discord-blurple/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Copy size={20} />
          Clone User Profile
        </h2>
        <p className="text-discord-subtle text-sm">
          Fetch and preview another user's profile, then clone it to your account
        </p>
      </div>

      {/* Error Alert */}
      {state.error && <ErrorAlert error={state.error} />}

      {/* User ID Input */}
      <div className="bg-discord-card rounded-lg p-4 space-y-3">
        <label className="text-sm font-semibold text-white">Target User ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Discord User ID (18+ digits)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-discord-darker text-white rounded border border-discord-hover focus:border-discord-blurple transition-colors text-sm"
          />
          <button
            onClick={handleFetchProfile}
            disabled={loading || !targetUserId.trim()}
            className="px-4 py-2 bg-discord-blurple hover:bg-discord-blurple/80 disabled:opacity-50 text-white rounded transition-colors font-semibold flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
              </>
            ) : (
              <>
                <Search size={18} />
                Fetch
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Preview */}
      {fetched && (
        <div className="bg-discord-card rounded-lg overflow-hidden border border-discord-hover">
          {/* Banner */}
          {getBannerUrl(fetched) && (
            <img
              src={getBannerUrl(fetched)}
              alt="Banner"
              className="w-full h-32 object-cover"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          {/* Profile Info */}
          <div className="p-4 space-y-4">
            {/* Avatar + Basic Info */}
            <div className="flex items-end gap-4">
              <img
                src={getAvatarUrl(fetched)}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-discord-darker"
                onError={(e) => {
                  e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }}
              />
              <div>
                <div className="text-lg font-bold text-white">
                  {fetched.global_name || fetched.username}
                </div>
                <div className="text-sm text-discord-subtle">@{fetched.username}</div>
                {fetched.pronouns && (
                  <div className="text-xs text-discord-subtle">Pronouns: {fetched.pronouns}</div>
                )}
              </div>
            </div>

            {/* Bio */}
            {fetched.bio && (
              <div>
                <p className="text-xs font-semibold text-discord-subtle mb-1">About Me</p>
                <p className="text-sm text-white break-words">{fetched.bio}</p>
              </div>
            )}

            {/* Profile Data */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-discord-darker rounded p-2">
                <p className="text-discord-subtle">Username</p>
                <p className="text-white font-mono truncate">{fetched.username}</p>
              </div>
              <div className="bg-discord-darker rounded p-2">
                <p className="text-discord-subtle">User ID</p>
                <p className="text-white font-mono truncate">{fetched.id}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPreview(!preview)}
                className="flex-1 px-4 py-2 bg-discord-hover hover:bg-discord-hover/80 text-white rounded transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                {preview ? 'Close Preview' : 'Preview'}
              </button>
              <button
                onClick={handleApplyProfile}
                disabled={applying}
                className="flex-1 px-4 py-2 bg-discord-blurple hover:bg-discord-blurple/80 disabled:opacity-50 text-white rounded transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {applying ? (
                  <>
                    <LoadingSpinner />
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Apply to My Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it Works */}
      {!fetched && (
        <div className="bg-discord-darker rounded-lg p-4 border border-discord-hover/30">
          <p className="text-sm font-semibold text-white mb-2">How to use:</p>
          <ol className="text-xs text-discord-subtle space-y-1">
            <li>1. Enter the target user's Discord ID (18+ digit number)</li>
            <li>2. Click "Fetch" to load their profile data</li>
            <li>3. Review the preview to see what will be cloned</li>
            <li>4. Click "Apply to My Account" to clone their profile</li>
          </ol>
          <p className="text-xs text-red-400 mt-3">
            ⚠️ This will overwrite your current avatar, banner, display name, bio, and pronouns
          </p>
        </div>
      )}

      {applying && <LoadingSpinner message="Applying profile..." />}
    </div>
  );
}
