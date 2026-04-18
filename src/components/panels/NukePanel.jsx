/**
 * Nuke Panel Component
 * Performs extreme server destruction operations:
 * - Ban All Members
 * - Delete All Channels
 * - Remove All Roles
 * - Remove Admin Permissions
 * - Kick All Members
 * - Delete Roles
 * - Spam Channels
 * - Rename Server
 * 
 * WARNING: These operations affect the entire guild and are PERMANENT
 */

import { useState } from 'react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import ErrorAlert from '../ErrorAlert.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';
import { Bomb, Loader } from 'lucide-react';

export default function NukePanel() {
  const { state, dispatch } = useDiscord();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [spamCount, setSpamCount] = useState('');
  const [newServerName, setNewServerName] = useState('');

  const operations = [
    {
      id: 'ban-all',
      label: 'Ban All Members',
      description: 'Ban every member in the server',
      icon: '🚫',
    },
    {
      id: 'delete-channels',
      label: 'Delete All Channels',
      description: 'Delete every channel in the server',
      icon: '🗑️',
    },
    {
      id: 'remove-roles',
      label: 'Remove All Roles',
      description: 'Delete every custom role in the server',
      icon: '👑',
    },
    {
      id: 'remove-admins',
      label: 'Remove Admin Perms',
      description: 'Revoke admin permissions from all members',
      icon: '⛔',
    },
    {
      id: 'kick-all',
      label: 'Kick All Members',
      description: 'Kick every member from the server',
      icon: '🔫',
    },
    {
      id: 'spam-channels',
      label: 'Spam Channels',
      description: 'Spam all channels with messages',
      icon: '💬',
    },
    {
      id: 'rename-server',
      label: 'Rename Server',
      description: 'Change the server name',
      icon: '📝',
    },
  ];

  const handleStartOperation = async (opId) => {
    setOperation(opId);
    setConfirmOpen(true);
  };

  const handleConfirmOperation = async () => {
    setLoading(true);
    setConfirmOpen(false);

    try {
      const guildId = state.currentGuild?.id;
      if (!guildId) throw new Error('No guild selected');

      const operationMap = {
        'ban-all': `/api/nuke/${guildId}/ban-all`,
        'delete-channels': `/api/nuke/${guildId}/delete-channels`,
        'remove-roles': `/api/nuke/${guildId}/remove-roles`,
        'remove-admins': `/api/nuke/${guildId}/remove-admins`,
        'kick-all': `/api/nuke/${guildId}/kick-all`,
        'spam-channels': `/api/nuke/${guildId}/spam-channels?count=${spamCount || 5}`,
        'rename-server': `/api/nuke/${guildId}/rename`,
      };

      const body = operation === 'rename-server' ? { name: newServerName } : {};

      const res = await fetch(operationMap[operation], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Operation failed: ${res.statusText}`);

      const result = await res.json();
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: `✓ ${result.message}`, type: 'success' },
      });
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { message: `Error: ${err.message}`, type: 'error' },
      });
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-discord-darker rounded-lg p-6 border border-red-700/30">
        <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
          <Bomb size={20} />
          Server Nuke Operations
        </h2>
        <p className="text-discord-subtle text-sm">
          🔴 EXTREME WARNING: These operations will DESTROY the entire server and CANNOT be reversed!
        </p>
      </div>

      {/* Current Guild */}
      {state.currentGuild && (
        <div className="bg-discord-card rounded-lg p-3 border border-discord-hover">
          <p className="text-xs text-discord-subtle">Target Server:</p>
          <p className="text-white font-semibold">{state.currentGuild.name}</p>
        </div>
      )}

      {/* Error Alert */}
      {state.error && <ErrorAlert error={state.error} />}

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => handleStartOperation(op.id)}
            disabled={loading || !state.currentGuild}
            className="bg-discord-card hover:bg-red-900/20 disabled:opacity-50 p-4 rounded-lg text-left transition-all border border-red-700/10 hover:border-red-700/30"
          >
            <div className="text-2xl mb-2">{op.icon}</div>
            <div className="font-semibold text-white">{op.label}</div>
            <div className="text-xs text-discord-subtle">{op.description}</div>
          </button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-darker rounded-lg p-6 max-w-sm border border-red-700/30">
            <h3 className="text-lg font-bold text-red-500 mb-2">
              🔴 FINAL WARNING - PERMANENT DAMAGE
            </h3>
            <p className="text-discord-subtle text-sm mb-4">
              This operation will permanently affect the server. This CANNOT be undone. Are you absolutely certain?
            </p>

            {operation === 'spam-channels' && (
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Number of messages (default: 5)"
                value={spamCount}
                onChange={(e) => setSpamCount(e.target.value)}
                className="w-full mb-4 px-3 py-2 bg-discord-card text-white rounded border border-discord-hover text-sm"
              />
            )}

            {operation === 'rename-server' && (
              <input
                type="text"
                placeholder="New server name"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                maxLength="100"
                className="w-full mb-4 px-3 py-2 bg-discord-card text-white rounded border border-discord-hover text-sm"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-discord-card hover:bg-discord-card/80 text-white rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOperation}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Executing...
                  </>
                ) : (
                  'EXECUTE'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Executing nuke operation..." />}
    </div>
  );
}
