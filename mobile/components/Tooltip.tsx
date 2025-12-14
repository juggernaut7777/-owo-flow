// kofa/mobile/components/Tooltip.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipProps {
    visible: boolean;
    title: string;
    description: string;
    position?: 'top' | 'bottom';
    targetX?: number;
    targetY?: number;
    onDismiss: () => void;
    step?: number;
    totalSteps?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    visible,
    title,
    description,
    position = 'bottom',
    targetX = SCREEN_WIDTH / 2,
    targetY = 100,
    onDismiss,
    step,
    totalSteps,
}) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            opacity.value = withDelay(100, withSpring(1));
        } else {
            scale.value = withSpring(0.8);
            opacity.value = withSpring(0);
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    const tooltipTop = position === 'bottom' ? targetY + 20 : targetY - 140;
    const arrowTop = position === 'bottom' ? -8 : undefined;
    const arrowBottom = position === 'top' ? -8 : undefined;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[styles.container, animatedStyle, { top: tooltipTop }]}
        >
            {/* Arrow */}
            <View
                style={[
                    styles.arrow,
                    position === 'bottom' ? { top: arrowTop } : { bottom: arrowBottom },
                    { left: Math.min(Math.max(targetX - 20, 20), SCREEN_WIDTH - 60) },
                    position === 'top' && styles.arrowDown,
                ]}
            />

            <LinearGradient
                colors={['#0D1117', '#161B22']}
                style={styles.tooltip}
            >
                {/* Step indicator */}
                {step !== undefined && totalSteps !== undefined && (
                    <View style={styles.stepRow}>
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.stepDot,
                                    i === step && styles.stepDotActive,
                                    i < step && styles.stepDotCompleted,
                                ]}
                            />
                        ))}
                    </View>
                )}

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>

                <TouchableOpacity onPress={onDismiss} style={styles.button}>
                    <LinearGradient
                        colors={['#2BAFF2', '#1F57F5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>
                            {step !== undefined && totalSteps !== undefined && step < totalSteps - 1
                                ? 'Next →'
                                : 'Got it ✓'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    arrow: {
        position: 'absolute',
        width: 16,
        height: 16,
        backgroundColor: '#0D1117',
        transform: [{ rotate: '45deg' }],
        zIndex: -1,
    },
    arrowDown: {
        transform: [{ rotate: '45deg' }],
    },
    tooltip: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(43, 175, 242, 0.3)',
        shadowColor: '#2BAFF2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    stepDotActive: {
        backgroundColor: '#2BAFF2',
        width: 24,
    },
    stepDotCompleted: {
        backgroundColor: 'rgba(43, 175, 242, 0.5)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 22,
        marginBottom: 20,
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15,
    },
});

export default Tooltip;
