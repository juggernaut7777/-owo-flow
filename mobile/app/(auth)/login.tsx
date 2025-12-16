/**
 * KOFA Login Screen - Email/Password Authentication
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Missing Email', 'Please enter your email address');
            return;
        }
        if (!password) {
            Alert.alert('Missing Password', 'Please enter your password');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn(email.trim(), password);

            if (!result.success) {
                Alert.alert('Login Failed', result.error || 'Please check your credentials');
            }
            // Navigation is handled by the auth state change
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#05090E', '#0D1117', '#05090E']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative orb */}
            <View style={styles.orbContainer}>
                <LinearGradient
                    colors={['rgba(43, 175, 242, 0.3)', 'transparent']}
                    style={styles.orb}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Logo & Header */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#2BAFF2', '#1F57F5']}
                        style={styles.logoBadge}
                    >
                        <Text style={styles.logoIcon}>⚡</Text>
                    </LinearGradient>
                    <Text style={styles.brandName}>KOFA</Text>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to manage your business</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="rgba(255,255,255,0.4)"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#2BAFF2', '#1F57F5']}
                            style={styles.loginButtonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer Links */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        width: 400,
        height: 400,
        borderRadius: 200,
        top: -150,
        right: -100,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoIcon: {
        fontSize: 28,
    },
    brandName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2BAFF2',
        letterSpacing: 4,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
    },
    form: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    loginButton: {
        marginTop: 32,
        borderRadius: 14,
        overflow: 'hidden',
    },
    loginButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
    },
    signupLink: {
        color: '#2BAFF2',
        fontSize: 15,
        fontWeight: '600',
    },
});
