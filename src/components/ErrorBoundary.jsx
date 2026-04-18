/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 * Prevents full app crash from component errors
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-discord-darker">
          <div className="max-w-md bg-discord-card p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-discord-red" />
              <h1 className="text-xl font-bold text-discord-white">Erro na aplicação</h1>
            </div>
            <p className="text-discord-muted mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <details className="bg-discord-darker rounded p-3 mb-4">
              <summary className="cursor-pointer text-discord-subtle text-sm">
                Detalhes do erro
              </summary>
              <pre className="text-xs text-discord-muted mt-2 overflow-auto max-h-32">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-discord-blurple hover:bg-discord-blurple2 text-white font-semibold py-2 rounded transition"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
