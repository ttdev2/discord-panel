/**
 * CL (Clean) Panel Component
 * Performs account cleanup operations:
 * - Close Direct Messages
 * - Delete Messages (bulk)
 * - Remove Friends
 * - Leave Guilds
 * - Cancel Friend Requests
 * - Delete Guild Messages
 * 
 * WARNING: These operations are destructive and irreversible
 */

import { useState } from 'react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import ErrorAlert from '../ErrorAlert.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';
import { Trash2, Loader } from 'lucide-react';

export default function CLPanel() {
  const { state, dispatch } = useDiscord();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState('');

  const operations = [
    {
      id: 'close-dms',
      label: 'Close All DMs',
      description: 'Close all direct message channels',
      icon: '✕',
    },
    {
      id: 'delete-messages',
      label: 'Delete Messages',
      description: 'Delete your messages from guilds/DMs',
      icon: '🗑️',
    },
    {
      id: 'remove-friends',
      label: 'Remove All Friends',
      description: 'Remove all friends from your account',
      icon: '👥',
    },
    {
      id: 'leave-guilds',
      label: 'Leave All Guilds',
      description: 'Leave all servers you are in',
      icon: '🚪',
    },
    {
      id: 'cancel-requests',
      label: 'Cancel Friend Requests',
      description: 'Cancel all pending friend requests',
      icon: '📮',
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
      const operationMap = {
        'close-dms': '/api/cl/close-dms',
        'delete-messages': `/api/cl/delete-messages?limit=${deleteCount || 100}`,
        'remove-friends': '/api/cl/remove-friends',
        'leave-guilds': '/api/cl/leave-guilds',
        'cancel-requests': '/api/cl/cancel-requests',
      };

      const res = await fetch(operationMap[operation], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="bg-discord-darker rounded-lg p-6 border border-red-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Trash2 size={20} />
          Clean Account (CL)
        </h2>
        <p className="text-discord-subtle text-sm">
          ⚠️ WARNING: These operations are PERMANENT and cannot be undone!
        </p>
      </div>

      {/* Error Alert */}
      {state.error && <ErrorAlert error={state.error} />}

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => handleStartOperation(op.id)}
            disabled={loading}
            className="bg-discord-card hover:bg-discord-card/80 disabled:opacity-50 p-4 rounded-lg text-left transition-all border border-red-500/10 hover:border-red-500/30"
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
          <div className="bg-discord-darker rounded-lg p-6 max-w-sm border border-red-500/20">
            <h3 className="text-lg font-bold text-white mb-2">
              ⚠️ Confirm Dangerous Operation
            </h3>
            <p className="text-discord-subtle text-sm mb-4">
              This action cannot be undone. Are you absolutely sure?
            </p>

            {operation === 'delete-messages' && (
              <input
                type="number"
                min="1"
                placeholder="Number of messages to delete (default: 100)"
                value={deleteCount}
                onChange={(e) => setDeleteCount(e.target.value)}
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
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Executing operation..." />}
    </div>
  );
}
