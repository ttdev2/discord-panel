/**
 * Loading Spinner Component
 * Displays during async operations (scan, fetch, etc)
 */

import { Loader } from 'lucide-react';

export default function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <Loader className="w-6 h-6 text-discord-blurple animate-spin" />
      <p className="text-discord-muted text-sm">{message}</p>
    </div>
  );
}
