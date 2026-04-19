/**
 * Login Screen Component
 * Handles token input and authentication
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import ErrorAlert from '../ErrorAlert.jsx';

export default function LoginScreen() {
  const { dispatch } = useDiscord();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Token é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[LOGIN] Sending login request...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();
      console.log('[LOGIN] Response status:', response.status, 'OK:', response.ok);
      console.log('[LOGIN] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Token inválido');
      }

      // Update global state - SET_USER_DATA also sets isAuthenticated=true
      console.log('[LOGIN] Dispatching SET_USER_DATA with payload:', data.user);
      dispatch({ type: ACTIONS.SET_USER_DATA, payload: data.user });
      console.log('[LOGIN] Dispatch completed, state should update now');
      // Token is now in secure httpOnly cookie, not stored in frontend state
    } catch (err) {
      console.error('[LOGIN] Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-discord-darker via-discord-dark to-discord-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-discord-blurple rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-discord-white mb-2">Discord Scanner</h1>
          <p className="text-discord-muted text-sm">
            Autentique com seu token Discord para começar
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleLogin}
          className="bg-discord-card rounded-lg shadow-xl p-6 space-y-4 border border-discord-hover"
        >
          {/* Token Input */}
          <div>
            <label className="block text-discord-white text-sm font-semibold mb-2">
              Token Discord
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole seu token Discord aqui"
                className="w-full bg-discord-darker border border-discord-hover rounded px-4 py-2.5 text-discord-white placeholder-discord-subtle focus:outline-none focus:border-discord-blurple transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-discord-subtle hover:text-discord-muted transition"
                disabled={loading}
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-discord-subtle mt-2">
              📌 Nunca compartilhe seu token! Use uma conta temporária ou de teste.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-discord-red/20 border border-discord-red/50 rounded p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-discord-red flex-shrink-0 mt-0.5" />
              <p className="text-discord-red text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-discord-blurple hover:bg-discord-blurple2 disabled:bg-discord-subtle disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Autenticando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Info */}
          <div className="bg-discord-blurple/10 border border-discord-blurple/20 rounded p-3 mt-4">
            <p className="text-xs text-discord-muted leading-relaxed">
              <strong>Como obter seu token:</strong>
              <br />
              1. Abra Discord em seu navegador
              <br />
              2. Abra DevTools (F12)
              <br />
              3. Vá para Network → WS
              <br />
              4. Procure por mensagens com seu token na Authorization
            </p>
          </div>
        </form>
      </div>

      {/* Error Toast */}
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
    </div>
  );
}
