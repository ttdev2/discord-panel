/**
 * Dashboard Screen Component
 * Main application view after authentication
 * Manages panel selection and navigation
 */

import { useState } from 'react';
import { LogOut, Server, Users, Zap, PenLine, Radio } from 'lucide-react';
import { useDiscord, ACTIONS } from '../../hooks/useDiscordStore.js';
import ScannerPanel from '../panels/ScannerPanel.jsx';
import CLPanel from '../panels/CLPanel.jsx';
import NukePanel from '../panels/NukePanel.jsx';
import ProfileClonePanel from '../panels/ProfileClonePanel.jsx';

export default function DashboardScreen() {
  const { state, dispatch } = useDiscord();
  const [activePanel, setActivePanel] = useState('scanner');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      dispatch({ type: ACTIONS.CLEAR_AUTH });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const panels = [
    {
      id: 'scanner',
      label: '📊 Scanner',
      icon: Users,
      description: 'Escanear membros do servidor',
    },
    {
      id: 'cl',
      label: '🧹 CL Panel',
      icon: Zap,
      description: 'Operações de limpeza',
    },
    {
      id: 'nuke',
      label: '💣 Nuke Panel',
      icon: Radio,
      description: 'Operações destrutivas',
    },
    {
      id: 'clone',
      label: '👤 Profile Clone',
      icon: PenLine,
      description: 'Clonar perfil',
    },
  ];

  return (
    <div className="min-h-screen bg-discord-darker flex">
      {/* Sidebar */}
      <div className="w-64 bg-discord-sidebar border-r border-discord-card p-4 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-discord-blurple mb-1">Discord Panel</h1>
          <p className="text-discord-subtle text-sm">Olá, {state.userData?.username || 'Usuário'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`w-full text-left px-4 py-3 rounded transition ${
                  activePanel === panel.id
                    ? 'bg-discord-blurple text-white'
                    : 'text-discord-muted hover:bg-discord-card hover:text-discord-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-semibold text-sm">{panel.label}</div>
                    <div className="text-xs opacity-75">{panel.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-discord-red/20 hover:bg-discord-red/30 text-discord-red font-semibold py-2 rounded transition"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activePanel === 'scanner' && <ScannerPanel />}
          {activePanel === 'cl' && <CLPanel />}
          {activePanel === 'nuke' && <NukePanel />}
          {activePanel === 'clone' && <ProfileClonePanel />}
        </div>
      </div>
    </div>
  );
}
