import defaultConfig from 'tailwindcss/defaultConfig';
import formPlugin from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#1e1f22',
          darker: '#111214',
          sidebar: '#2b2d31',
          card: '#313338',
          hover: '#35373c',
          blurple: '#5865f2',
          blurple2: '#4752c4',
          green: '#57f287',
          red: '#ed4245',
          yellow: '#fee75c',
          fuchsia: '#eb459e',
          white: '#ffffff',
          muted: '#b5bac1',
          subtle: '#80848e',
        },
      },
      // Smooth transitions
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
    },
  },
  plugins: [formPlugin],
};

