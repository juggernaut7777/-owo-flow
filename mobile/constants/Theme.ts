// Theme definition for KOFA mobile app - Premium Dark Theme
export const Theme = {
    colors: {
        // New premium palette provided by user
        background: '#05090E', // deep dark background
        surface: '#0D1117', // card surface
        surfaceLight: '#161B22', // elevated surfaces

        // Primary blues
        primary: '#2BAFF2', // vibrant sky blue
        primaryDark: '#1F57F5', // deep blue
        accent: '#00DFFF', // electric cyan accent

        // Status colors
        success: '#22C55E', // green
        warning: '#F59E0B', // amber
        error: '#EF4444', // red
        pending: '#F59E0B', // amber for pending (matches warning)

        // Text
        textPrimary: '#FFFFFF',
        textSecondary: '#8B949E',
        textMuted: '#6E7681',

        // Borders
        border: '#21262D',
        borderLight: '#30363D',
    },
    gradients: {
        primary: ['#2BAFF2', '#1F57F5'],
        accent: ['#00DFFF', '#2BAFF2'],
        dark: ['#05090E', '#0D1117'],
        card: ['#0D1117', '#161B22'],
        success: ['#22C55E', '#16A34A'],
        warning: ['#F59E0B', '#D97706'],
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },
    shadows: {
        elevation1: '0 1px 3px rgba(0,0,0,0.24)',
        elevation2: '0 4px 8px rgba(0,0,0,0.32)',
        glow: '0 0 20px rgba(43, 175, 242, 0.3)',
    },
};
