/**
 * Scanner Panel Component
 * Main scanning functionality for Discord members
 */

import { useState, useEffect } from 'react';
import { Search, Play, Loader2, AlertCircle } from 'lucide-react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import LoadingSpinner from '../LoadingSpinner.jsx';
import MemberCard from '../MemberCard.jsx';

export default function ScannerPanel() {
  const { state, dispatch } = useDiscord();
  const [guildId, setGuildId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch guild info
  const handleFetchGuild = async () => {
    if (!guildId.trim()) {
      setError('Guild ID é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/guilds/${guildId.trim()}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Guild não encontrado');
      }

      const guildData = await res.json();
      dispatch({ type: ACTIONS.SET_CURRENT_GUILD, payload: guildData });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start scan
  const handleStartScan = async () => {
    if (!state.currentGuild) return;

    setLoading(true);
    setError('');
    setScanProgress('Iniciando scan...');

    try {
      const res = await fetch(`/api/guilds/${state.currentGuild.id}/scan/start`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao iniciar scan');
      }

      const { jobId } = await res.json();
      dispatch({ type: ACTIONS.SET_SCAN_JOB_ID, payload: jobId });

      // Poll for progress
      await pollScanStatus(jobId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Poll scan status
  const pollScanStatus = async (jobId) => {
    const maxAttempts = 300; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan/status/${jobId}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Status fetch failed');

        const status = await res.json();
        setScanProgress(status.progress || '...');

        if (!status.done && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        } else if (status.done) {
          // Fetch complete results
          const resultRes = await fetch(`/api/scan/result/${jobId}`, {
            credentials: 'include',
          });

          if (resultRes.ok) {
            const { members } = await resultRes.json();
            dispatch({ type: ACTIONS.SET_SCAN_MEMBERS, payload: members });
            setScanProgress('✅ Scan concluído!');
          }

          setLoading(false);
        }
      } catch (err) {
        console.error('Poll error:', err);
        setError('Erro ao buscar status');
        setLoading(false);
      }
    };

    poll();
  };

  // Filter members
  const filteredMembers = state.scanMembers.filter((m) => {
    if (!searchTerm.trim()) return true;
    const username = m.user?.username || '';
    const globalName = m.user?.global_name || '';
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      globalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Guild Input */}
      <div className="bg-discord-card rounded-lg p-6 border border-discord-hover">
        <h2 className="text-lg font-semibold text-discord-white mb-4">1️⃣ Selecionar Servidor</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={guildId}
            onChange={(e) => setGuildId(e.target.value)}
            placeholder="Cole o ID do servidor Discord"
            className="flex-1 bg-discord-darker border border-discord-hover rounded px-4 py-2 text-discord-white placeholder-discord-subtle focus:outline-none focus:border-discord-blurple transition"
            disabled={loading}
          />
          <button
            onClick={handleFetchGuild}
            disabled={loading || !guildId.trim()}
            className="bg-discord-blurple hover:bg-discord-blurple2 disabled:bg-discord-subtle text-white font-semibold px-6 py-2 rounded transition"
          >
            Buscar
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-discord-red/20 border border-discord-red/50 rounded p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-discord-red flex-shrink-0" />
            <p className="text-discord-red text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Guild Info */}
      {state.currentGuild && (
        <div className="bg-discord-card rounded-lg p-6 border border-discord-hover">
          <h2 className="text-lg font-semibold text-discord-white mb-4">2️⃣ Informações do Servidor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-discord-subtle text-sm">Nome</p>
              <p className="text-discord-white font-semibold">{state.currentGuild.name}</p>
            </div>
            <div>
              <p className="text-discord-subtle text-sm">Membros</p>
              <p className="text-discord-white font-semibold">
                {state.currentGuild.member_count?.toLocaleString() || '?'}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartScan}
            disabled={loading}
            className="mt-6 w-full bg-discord-green hover:bg-green-600 disabled:bg-discord-subtle text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Iniciar Scan
              </>
            )}
          </button>

          {scanProgress && (
            <div className="mt-4 p-4 bg-discord-darker rounded border border-discord-blurple/50">
              <p className="text-discord-muted text-sm">{scanProgress}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {state.scanMembers.length > 0 && (
        <div className="bg-discord-card rounded-lg p-6 border border-discord-hover">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-discord-white mb-4">
              3️⃣ Resultados ({filteredMembers.length} membros)
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-discord-subtle" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full pl-10 bg-discord-darker border border-discord-hover rounded px-4 py-2 text-discord-white placeholder-discord-subtle focus:outline-none focus:border-discord-blurple transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <MemberCard key={member.user.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {loading && state.scanMembers.length === 0 && (
        <div className="bg-discord-card rounded-lg p-6 border border-discord-hover">
          <LoadingSpinner message="Escaneando servidor..." />
        </div>
      )}
    </div>
  );
}
