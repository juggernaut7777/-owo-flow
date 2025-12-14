// Reusable Button component with theme styling and optional loading state
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

type ButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false, loading = false, style }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style, disabled && styles.disabled]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={Theme.colors.textPrimary} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Theme.colors.accent,
        paddingVertical: Theme.spacing.sm,
        paddingHorizontal: Theme.spacing.md,
        borderRadius: Theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        // subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    text: {
        color: Theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.5,
    },
});
