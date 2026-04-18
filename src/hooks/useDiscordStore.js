/**
 * Discord Store Context Hook
 * Global state management for Discord data and UI state
 * Replaces prop drilling with centralized state
 */

import { createContext, useContext, useReducer, useMemo } from 'react';

// Create context
const DiscordContext = createContext();

// Initial state
const initialState = {
  // Authentication
  token: null,
  sessionId: null,
  userId: null,
  userData: null,
  isAuthenticated: false,

  // Guild/Scan data
  currentGuildId: null,
  currentGuild: null,
  scanJobId: null,
  scanMembers: [],
  scanStats: {
    total: 0,
    rareBadges: 0,
    nitroUsers: 0,
    boosters: 0,
  },

  // UI state
  isLoading: false,
  error: null,
  selectedFilters: {
    searchName: '',
    badges: [],
    nitro: false,
    booster: false,
  },
};

// Action types
export const ACTIONS = {
  // Auth
  SET_TOKEN: 'SET_TOKEN',
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_USER_DATA: 'SET_USER_DATA',
  CLEAR_AUTH: 'CLEAR_AUTH',

  // Guild data
  SET_CURRENT_GUILD: 'SET_CURRENT_GUILD',
  SET_SCAN_JOB_ID: 'SET_SCAN_JOB_ID',
  SET_SCAN_MEMBERS: 'SET_SCAN_MEMBERS',
  UPDATE_SCAN_STATS: 'UPDATE_SCAN_STATS',

  // UI state
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
};

// Reducer
function discordReducer(state, action) {
  console.log('[REDUCER] Action:', action.type, 'Payload:', action.payload?.username || action.payload);
  
  switch (action.type) {
    case ACTIONS.SET_TOKEN:
      console.log('[REDUCER] Setting token, isAuthenticated will be:', !!action.payload);
      return { ...state, token: action.payload, isAuthenticated: !!action.payload };
    case ACTIONS.SET_SESSION_ID:
      return { ...state, sessionId: action.payload };
    case ACTIONS.SET_USER_DATA:
      console.log('[REDUCER] Setting user data, isAuthenticated will be:', !!action.payload);
      return { 
        ...state, 
        userData: action.payload, 
        userId: action.payload?.id,
        isAuthenticated: !!action.payload 
      };
    case ACTIONS.CLEAR_AUTH:
      return {
        ...initialState,
        scanMembers: [],
        selectedFilters: initialState.selectedFilters,
      };
    case ACTIONS.SET_CURRENT_GUILD:
      return { ...state, currentGuild: action.payload, currentGuildId: action.payload?.id };
    case ACTIONS.SET_SCAN_JOB_ID:
      return { ...state, scanJobId: action.payload };
    case ACTIONS.SET_SCAN_MEMBERS:
      return { ...state, scanMembers: action.payload };
    case ACTIONS.UPDATE_SCAN_STATS:
      return { ...state, scanStats: { ...state.scanStats, ...action.payload } };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        selectedFilters: { ...state.selectedFilters, ...action.payload },
      };
    default:
      return state;
  }
}

// Context Provider Component
export function DiscordProvider({ children }) {
  const [state, dispatch] = useReducer(discordReducer, initialState);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <DiscordContext.Provider value={value}>
      {children}
    </DiscordContext.Provider>
  );
}

// Hook to use context
export function useDiscord() {
  const context = useContext(DiscordContext);
  if (!context) {
    throw new Error('useDiscord must be used within DiscordProvider');
  }
  return context;
}
