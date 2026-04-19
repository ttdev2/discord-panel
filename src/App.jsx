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
    console.log('[APP] useEffect triggered - checking session...');
    const checkSession = async () => {
      try {
        console.log('[APP] Making /api/me request...');
        const res = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('[APP] /api/me response status:', res.status, 'ok:', res.ok);
        if (res.ok) {
          const userData = await res.json();
          console.log('[APP] Session valid, user:', userData?.username);
          dispatch({ type: ACTIONS.SET_USER_DATA, payload: userData });
          console.log('[APP] Dispatched SET_USER_DATA');
        } else {
          console.log('[APP] Session check failed:', res.status);
        }
      } catch (err) {
        console.warn('[APP] Session check error:', err);
      }
    };

    checkSession();
  }, [dispatch]);

  // DEBUG: Log state on every render
  console.log('[APP RENDER]', {
    isAuth: state.isAuthenticated,
    userData: state.userData?.username,
    sessionId: state.sessionId,
    token: state.token ? 'SET' : 'NOT SET'
  });

  // Render based on authentication state
  if (!state.isAuthenticated) {
    console.log('[APP] NOT AUTHENTICATED - Showing LoginScreen');
    return <LoginScreen />;
  }

  console.log('[APP] AUTHENTICATED - Rendering Dashboard');
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
