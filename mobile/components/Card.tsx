// Reusable Card component with glass‑morphism styling
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

type CardProps = {
    children: React.ReactNode;
    style?: ViewStyle;
};

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>{children}</View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface, // dark card surface
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        // glass‑morphism effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        // optional backdrop blur – requires expo-blur, but we keep simple for now
    },
});
