// kofa/mobile/app/(tabs)/spend.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, shadows, borderRadius, spacing } from '@/constants';

const API_BASE = 'https://kofa.onrender.com';

interface ExpenseSummary {
    business_burn: number;
    personal_spend: number;
    total_outflow: number;
    expense_count: number;
}

interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    expense_type: 'BUSINESS' | 'PERSONAL';
    date: string;
}

export default function SpendScreen() {
    const [mode, setMode] = useState<'BUSINESS' | 'PERSONAL'>('BUSINESS');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Operations');
    const [summary, setSummary] = useState<ExpenseSummary | null>(null);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSummary();
        fetchExpenses();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await fetch(`${API_BASE}/expenses/summary`);
            const data = await res.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const res = await fetch(`${API_BASE}/expenses/list`);
            const data = await res.json();
            setRecentExpenses(data.slice(-5).reverse());
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const handleLogExpense = async () => {
        if (!amount || !description) {
            alert('Please enter amount and description');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/expenses/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    category,
                    expense_type: mode,
                }),
            });

            if (res.ok) {
                setAmount('');
                setDescription('');
                fetchSummary();
                fetchExpenses();
            }
        } catch (error) {
            console.error('Error logging expense:', error);
            alert('Failed to log expense. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`;

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={['#05090E', '#0D1117', '#05090E']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Accent Orbs */}
            <View style={styles.orbContainer}>
                <LinearGradient
                    colors={mode === 'BUSINESS'
                        ? ['rgba(43, 175, 242, 0.2)', 'transparent']
                        : ['rgba(0, 223, 255, 0.2)', 'transparent']}
                    style={[styles.orb, styles.orbMain]}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <View style={styles.brandRow}>
                        <LinearGradient
                            colors={['#2BAFF2', '#1F57F5']}
                            style={styles.brandBadge}
                        >
                            <Text style={styles.brandIcon}>⚡</Text>
                        </LinearGradient>
                        <Text style={styles.brandName}>KOFA</Text>
                    </View>
                    <Text style={styles.headerTitle}>Money Flow</Text>
                    <Text style={styles.subtitle}>Track your spending</Text>
                </Animated.View>

                {/* Summary Cards */}
                <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.summaryContainer}>
                    <TouchableOpacity
                        style={[styles.summaryCard, mode === 'BUSINESS' && styles.summaryCardActive]}
                        onPress={() => setMode('BUSINESS')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(43, 175, 242, 0.2)', 'rgba(43, 175, 242, 0.05)']}
                            style={styles.summaryCardGradient}
                        >
                            <View style={styles.summaryIconRow}>
                                <LinearGradient
                                    colors={['#2BAFF2', '#1F57F5']}
                                    style={styles.summaryIconBg}
                                >
                                    <Ionicons name="briefcase" size={18} color="#FFF" />
                                </LinearGradient>
                                {mode === 'BUSINESS' && (
                                    <View style={styles.activeIndicator}>
                                        <View style={styles.activeDot} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.summaryLabel}>Business</Text>
                            <Text style={styles.summaryAmount}>
                                {formatNaira(summary?.business_burn || 0)}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.summaryCard, mode === 'PERSONAL' && styles.summaryCardActive]}
                        onPress={() => setMode('PERSONAL')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(0, 223, 255, 0.2)', 'rgba(0, 223, 255, 0.05)']}
                            style={styles.summaryCardGradient}
                        >
                            <View style={styles.summaryIconRow}>
                                <LinearGradient
                                    colors={['#00DFFF', '#2BAFF2']}
                                    style={styles.summaryIconBg}
                                >
                                    <Ionicons name="person" size={18} color="#FFF" />
                                </LinearGradient>
                                {mode === 'PERSONAL' && (
                                    <View style={styles.activeIndicator}>
                                        <View style={[styles.activeDot, { backgroundColor: '#00DFFF' }]} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.summaryLabel}>Personal</Text>
                            <Text style={[styles.summaryAmount, { color: '#00DFFF' }]}>
                                {formatNaira(summary?.personal_spend || 0)}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Input Form */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.formCard}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                        style={styles.formGradient}
                    >
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>
                                {mode === 'BUSINESS' ? '💼 Business Expense' : '👤 Personal Expense'}
                            </Text>
                        </View>

                        <Text style={styles.label}>Amount (₦)</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputPrefix}>₦</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.inputFull}
                            placeholder="e.g. Diesel, Lunch, Data"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleLogExpense}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={mode === 'BUSINESS'
                                    ? ['#2BAFF2', '#1F57F5']
                                    : ['#00DFFF', '#2BAFF2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveBtnGradient}
                            >
                                <Text style={styles.saveBtnText}>
                                    {loading ? 'Logging...' : '+ Log Expense'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Recent Expenses */}
                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Recent Outflow</Text>

                    {recentExpenses.length === 0 ? (
                        <Animated.View entering={FadeIn.delay(400)} style={styles.emptyState}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                style={styles.emptyIconContainer}
                            >
                                <Text style={styles.emptyIcon}>📊</Text>
                            </LinearGradient>
                            <Text style={styles.emptyTitle}>No expenses logged</Text>
                            <Text style={styles.emptyText}>Start tracking your money flow</Text>
                        </Animated.View>
                    ) : (
                        recentExpenses.map((expense, index) => (
                            <Animated.View
                                key={expense.id}
                                entering={FadeInUp.delay(400 + index * 50)}
                                style={styles.logItem}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                                    style={styles.logItemGradient}
                                >
                                    <View style={styles.logLeft}>
                                        <LinearGradient
                                            colors={expense.expense_type === 'BUSINESS'
                                                ? ['#2BAFF2', '#1F57F5']
                                                : ['#00DFFF', '#2BAFF2']}
                                            style={styles.logTypeBadge}
                                        >
                                            <Ionicons
                                                name={expense.expense_type === 'BUSINESS' ? 'briefcase' : 'person'}
                                                size={14}
                                                color="#000"
                                            />
                                        </LinearGradient>
                                        <View>
                                            <Text style={styles.logDesc}>{expense.description}</Text>
                                            <Text style={styles.logCategory}>{expense.category}</Text>
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.logAmount,
                                        { color: expense.expense_type === 'BUSINESS' ? '#2BAFF2' : '#00DFFF' }
                                    ]}>
                                        -{formatNaira(expense.amount)}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>
                        ))
                    )}
                </Animated.View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05090E',
    },
    orbContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    orbMain: {
        top: -100,
        right: -100,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 60,
        marginBottom: 20,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    brandBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    brandIcon: {
        fontSize: 12,
    },
    brandName: {
        fontSize: 13,
        fontWeight: '800',
        color: '#00DFFF',
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    summaryCardActive: {
        borderColor: 'rgba(43, 175, 242, 0.5)',
    },
    summaryCardGradient: {
        padding: 16,
        alignItems: 'flex-start',
    },
    summaryIconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    },
    summaryIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIndicator: {
        padding: 4,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2BAFF2',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '500',
    },
    summaryAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2BAFF2',
        marginTop: 4,
    },
    formCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 24,
    },
    formGradient: {
        padding: 20,
    },
    formHeader: {
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 8,
        marginTop: 16,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        paddingHorizontal: 16,
    },
    inputPrefix: {
        fontSize: 24,
        color: '#2BAFF2',
        fontWeight: '600',
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        paddingVertical: 16,
    },
    inputFull: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        color: '#FFFFFF',
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
    },
    saveBtn: {
        marginTop: 24,
        borderRadius: 14,
        overflow: 'hidden',
    },
    saveBtnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    recentSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    emptyIcon: {
        fontSize: 36,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    logItem: {
        marginBottom: 10,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    logItemGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    logLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logTypeBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logDesc: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    logCategory: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    logAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
});
