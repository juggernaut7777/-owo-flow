// kofa/mobile/components/OnboardingOverlay.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Tooltip } from './Tooltip';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = '@kofa_onboarding_completed';

interface OnboardingStep {
    title: string;
    description: string;
    targetY: number;
    targetX?: number;
    position?: 'top' | 'bottom';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: '👋 Welcome to KOFA!',
        description: 'Your AI-powered commerce engine for Nigerian merchants. Let me show you around quickly.',
        targetY: 200,
        position: 'bottom',
    },
    {
        title: '📦 Inventory Tab',
        description: 'Add and manage your products here. Use voice tags so customers can find items using Nigerian slang!',
        targetY: SCREEN_HEIGHT - 100,
        position: 'top',
    },
    {
        title: '📋 Orders Tab',
        description: 'Track all your sales - from WhatsApp, Instagram, walk-ins, and more. Log manual sales easily!',
        targetY: SCREEN_HEIGHT - 100,
        position: 'top',
    },
    {
        title: '💬 Chat Tab',
        description: 'Test your AI sales bot here. It speaks Nigerian Pidgin or formal English - your choice!',
        targetY: SCREEN_HEIGHT - 100,
        position: 'top',
    },
    {
        title: '💰 Money Flow',
        description: 'Track business expenses separately from personal spending. Know your real profit!',
        targetY: SCREEN_HEIGHT - 100,
        position: 'top',
    },
];

interface OnboardingOverlayProps {
    children: React.ReactNode;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ children }) => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
            if (!completed) {
                // Small delay to let the app render first
                setTimeout(() => setShowOnboarding(true), 1000);
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        }
    };

    const handleNext = async () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            try {
                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            } catch (error) {
                console.error('Error saving onboarding status:', error);
            }
            setShowOnboarding(false);
        }
    };

    const handleSkip = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
        setShowOnboarding(false);
    };

    return (
        <View style={styles.container}>
            {children}

            {showOnboarding && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    style={styles.overlay}
                >
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Animated.Text style={styles.skipText}>Skip</Animated.Text>
                    </TouchableOpacity>

                    <Tooltip
                        visible={true}
                        title={ONBOARDING_STEPS[currentStep].title}
                        description={ONBOARDING_STEPS[currentStep].description}
                        targetY={ONBOARDING_STEPS[currentStep].targetY}
                        targetX={ONBOARDING_STEPS[currentStep].targetX}
                        position={ONBOARDING_STEPS[currentStep].position}
                        onDismiss={handleNext}
                        step={currentStep}
                        totalSteps={ONBOARDING_STEPS.length}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 999,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        zIndex: 1001,
    },
    skipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OnboardingOverlay;
