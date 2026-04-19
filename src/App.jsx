/**
 * Discord Scanner Panel - Main Application
 * Root component that manages routing and global state
 * 
 * Architecture:
 * - DiscordProvider: Global state management via Context API + useReducer
 * - LoginScreen: Token authentication with secure httpOnly cookies
 * - DashboardScreen: Main application after login
 * - Various panels: Scanner, CL, Nuke, Profile Clone
 */

import { useEffect } from 'react';
import { DiscordProvider, useDiscord, ACTIONS } from './hooks/useDiscordStore.js';
import LoginScreen from './components/screens/LoginScreen.jsx';
import DashboardScreen from './components/screens/DashboardScreen.jsx';

/**
 * Main App component with authenticated routing
 */
function AppContent() {
  const { state, dispatch } = useDiscord();

  // Check authentication on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const userData = await res.json();
          dispatch({ type: ACTIONS.SET_USER_DATA, payload: userData });
        }
      } catch (err) {
        console.warn('Session check error:', err);
      }
    };

    checkSession();
  }, [dispatch]);

  // Render based on authentication state
  if (!state.isAuthenticated) {
    return <LoginScreen />;
  }

  return <DashboardScreen />;
}

/**
 * Root App component wrapped with providers
 */
export default function App() {
  return (
    <DiscordProvider>
      <AppContent />
    </DiscordProvider>
  );
}
