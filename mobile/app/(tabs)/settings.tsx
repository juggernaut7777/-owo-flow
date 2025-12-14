import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { getBotStyle, setBotStyle } from '@/lib/api';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SettingsScreen() {
    const [botStyle, setBotStyleState] = useState<'corporate' | 'street'>('corporate');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadBotStyle();
    }, []);

    const loadBotStyle = async () => {
        try {
            const result = await getBotStyle();
            setBotStyleState(result.current_style as 'corporate' | 'street');
        } catch (error) {
            console.error('Error loading bot style:', error);
        }
    };

    const handleToggleBotStyle = async () => {
        const newStyle = botStyle === 'corporate' ? 'street' : 'corporate';
        setIsLoading(true);
        try {
            await setBotStyle(newStyle);
            setBotStyleState(newStyle);
            Alert.alert(
                'Bot Style Updated ✅',
                newStyle === 'corporate'
                    ? 'Your bot will now respond professionally in formal English.'
                    : 'Your bot will now respond in Nigerian Pidgin for a more casual feel.'
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update bot style. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#05090E', '#0D1117', '#05090E']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.orbContainer}>
                <LinearGradient colors={['rgba(43, 175, 242, 0.2)', 'transparent']} style={[styles.orb, styles.orbGreen]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <AnimatedView entering={FadeInDown.springify()} style={styles.header}>
                    <View style={styles.brandRow}>
                        <LinearGradient colors={['#2BAFF2', '#1F57F5']} style={styles.brandBadge}>
                            <Text style={styles.brandIcon}>⚡</Text>
                        </LinearGradient>
                        <Text style={styles.brandName}>KOFA</Text>
                    </View>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>Customize your experience</Text>
                </AnimatedView>

                {/* Bot Personality Section */}
                <AnimatedView entering={FadeInUp.delay(100).springify()} style={styles.section}>
                    <Text style={styles.sectionTitle}>🤖 Bot Personality</Text>
                    <Text style={styles.sectionDesc}>Choose how your AI sales bot communicates with customers</Text>

                    <View style={styles.card}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.cardGradient}>
                            {/* Corporate Option */}
                            <TouchableOpacity
                                style={[styles.optionRow, botStyle === 'corporate' && styles.optionRowActive]}
                                onPress={() => botStyle !== 'corporate' && handleToggleBotStyle()}
                                disabled={isLoading}
                            >
                                <View style={styles.optionLeft}>
                                    <LinearGradient
                                        colors={botStyle === 'corporate' ? ['#2BAFF2', '#1F57F5'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                        style={styles.optionIcon}
                                    >
                                        <Ionicons name="briefcase" size={20} color={botStyle === 'corporate' ? '#000' : '#888'} />
                                    </LinearGradient>
                                    <View>
                                        <Text style={styles.optionTitle}>Professional</Text>
                                        <Text style={styles.optionDesc}>Formal English, business-appropriate</Text>
                                    </View>
                                </View>
                                {botStyle === 'corporate' && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark-circle" size={24} color="#2BAFF2" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={styles.optionDivider} />

                            {/* Street/Nigerian Option */}
                            <TouchableOpacity
                                style={[styles.optionRow, botStyle === 'street' && styles.optionRowActive]}
                                onPress={() => botStyle !== 'street' && handleToggleBotStyle()}
                                disabled={isLoading}
                            >
                                <View style={styles.optionLeft}>
                                    <LinearGradient
                                        colors={botStyle === 'street' ? ['#00DFFF', '#2BAFF2'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                        style={styles.optionIcon}
                                    >
                                        <Text style={{ fontSize: 18 }}>🇳🇬</Text>
                                    </LinearGradient>
                                    <View>
                                        <Text style={styles.optionTitle}>Nigerian Pidgin</Text>
                                        <Text style={styles.optionDesc}>Casual, friendly, local vibes</Text>
                                    </View>
                                </View>
                                {botStyle === 'street' && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark-circle" size={24} color="#00DFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* Preview Box */}
                    <View style={styles.previewBox}>
                        <Text style={styles.previewLabel}>Preview:</Text>
                        <Text style={styles.previewText}>
                            {botStyle === 'corporate'
                                ? '"Hello! We have Premium Red Sneakers available for ₦45,000. Would you like to purchase?"'
                                : '"How far! We get Premium Red Sneakers for 45k. You wan buy am?"'}
                        </Text>
                    </View>
                </AnimatedView>

                {/* About Section */}
                <AnimatedView entering={FadeInUp.delay(200).springify()} style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ About KOFA</Text>

                    <View style={styles.card}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.cardGradient}>
                            <View style={styles.aboutRow}>
                                <Text style={styles.aboutLabel}>Version</Text>
                                <Text style={styles.aboutValue}>2.0.0</Text>
                            </View>
                            <View style={styles.optionDivider} />
                            <View style={styles.aboutRow}>
                                <Text style={styles.aboutLabel}>Backend</Text>
                                <Text style={styles.aboutValue}>kofa-api.onrender.com</Text>
                            </View>
                        </LinearGradient>
                    </View>
                </AnimatedView>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#05090E' },
    orbContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
    orbGreen: { top: -100, right: -100 },
    scrollContent: { paddingHorizontal: 20 },
    header: { paddingTop: 60, marginBottom: 24 },
    brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    brandBadge: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    brandIcon: { fontSize: 12 },
    brandName: { fontSize: 13, fontWeight: '800', color: '#2BAFF2', letterSpacing: 2 },
    title: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
    sectionDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 },
    card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardGradient: { padding: 6 },
    optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14 },
    optionRowActive: { backgroundColor: 'rgba(43, 175, 242, 0.1)' },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    optionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    optionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    optionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    optionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 14 },
    checkmark: {},
    previewBox: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    previewLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    previewText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 22 },
    aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    aboutLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    aboutValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
});
