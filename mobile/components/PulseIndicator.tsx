// kofa/mobile/components/PulseIndicator.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface PulseIndicatorProps {
    color?: string;
    size?: number;
    pulseScale?: number;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
    color = '#2BAFF2',
    size = 8,
    pulseScale = 2.5,
}) => {
    const pulseOpacity = useSharedValue(0.6);
    const pulseScaleValue = useSharedValue(1);

    useEffect(() => {
        // Pulse animation
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
                withTiming(0.6, { duration: 0 })
            ),
            -1, // infinite
            false
        );

        pulseScaleValue.value = withRepeat(
            withSequence(
                withTiming(pulseScale, { duration: 1000, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 0 })
            ),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
        transform: [{ scale: pulseScaleValue.value }],
    }));

    return (
        <View style={[styles.container, { width: size * 3, height: size * 3 }]}>
            {/* Pulse ring */}
            <Animated.View
                style={[
                    styles.pulse,
                    pulseStyle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                ]}
            />
            {/* Core dot */}
            <View
                style={[
                    styles.core,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulse: {
        position: 'absolute',
    },
    core: {
        shadowColor: '#2BAFF2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default PulseIndicator;
