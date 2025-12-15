import { Theme } from './Theme';

// Light/Dark mode support for Themed.tsx compatibility
// Since KOFA uses a dark theme, both light and dark return the same colors
export const Colors = {
    light: {
        ...Theme.colors,
        text: Theme.colors.textPrimary,
        tint: Theme.colors.primary,
        tabIconDefault: Theme.colors.textMuted,
        tabIconSelected: Theme.colors.primary,
    },
    dark: {
        ...Theme.colors,
        text: Theme.colors.textPrimary,
        tint: Theme.colors.primary,
        tabIconDefault: Theme.colors.textMuted,
        tabIconSelected: Theme.colors.primary,
    },
};

// Named exports for backward compatibility
export const primary = Theme.colors.primary;
export const accent = Theme.colors.accent;
export const dark = Theme.colors.background;
export const light = Theme.colors.surface;
export const semantic = {
    success: Theme.colors.success,
    warning: Theme.colors.warning,
    error: Theme.colors.error,
    pending: Theme.colors.pending,
};
export const naira = '₦';
export const gradients = Theme.gradients;

export default Colors;
