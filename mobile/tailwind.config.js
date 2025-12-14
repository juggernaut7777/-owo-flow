/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Blue Theme - matching Theme.ts
        primary: {
          DEFAULT: '#2BAFF2',  // vibrant sky blue
          light: '#00DFFF',    // electric cyan
          dark: '#1F57F5',     // deep blue
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          muted: '#8B949E',
        },
        accent: {
          DEFAULT: '#00DFFF',  // Electric cyan accent
          light: '#2BAFF2',
        },
        dark: {
          DEFAULT: '#05090E',  // Deep background
          card: '#0D1117',
          surface: '#161B22',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        naira: '#2BAFF2',  // For price displays (blue theme)
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        display: ['Outfit', 'System'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'button': '0 4px 14px rgba(43, 175, 242, 0.4)',
      },
    },
  },
  plugins: [],
}
