/**
 * Error Alert Component
 * Toast-like error notification for user feedback
 */

import { AlertCircle, X } from 'lucide-react';

export default function ErrorAlert({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 max-w-md bg-discord-red/90 backdrop-blur border border-discord-red/50 text-white rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 z-50">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
