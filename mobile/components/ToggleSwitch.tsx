// Reusable ToggleSwitch component with theme styling and animated thumb
import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

type ToggleSwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onValueChange, disabled = false }) => {
    return (
        <View style={styles.container}>
            <Switch
                trackColor={{ false: Theme.colors.surface, true: Theme.colors.accent }}
                thumbColor={value ? Theme.colors.textPrimary : Theme.colors.textSecondary}
                ios_backgroundColor={Theme.colors.surface}
                onValueChange={onValueChange}
                value={value}
                disabled={disabled}
                style={styles.switch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
});
