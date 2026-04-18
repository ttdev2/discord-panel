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
          console.log('[APP DEBUG] Session check OK, userData:', userData);
          dispatch({ type: ACTIONS.SET_USER_DATA, payload: userData });
        } else {
          console.log('[APP DEBUG] Session check failed with status:', res.status);
        }
      } catch (err) {
        console.warn('[APP DEBUG] Session check error:', err);
      }
    };

    checkSession();
  }, [dispatch]);

  console.log('[APP DEBUG] Current state.isAuthenticated:', state.isAuthenticated);

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
