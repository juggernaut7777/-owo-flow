import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, shadows, borderRadius, spacing } from '@/constants';
import { sendMessage, ChatMessage, formatNaira } from '@/lib/api';

const AnimatedView = Animated.createAnimatedComponent(View);

// Generate unique user ID (in production, use device ID or auth)
const USER_ID = '+234' + Math.random().toString().slice(2, 12);

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Hello! 👋 Welcome to KOFA!\n\nI can help you check product availability, prices, and make purchases.\n\nWhat are you looking for today?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await sendMessage(USER_ID, inputText.trim());

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                isUser: false,
                timestamp: new Date(),
                product: response.product,
                paymentLink: response.payment_link,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            // Demo mode - simulate response when backend is not running
            const demoResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: getDemoResponse(inputText.trim()),
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, demoResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const getDemoResponse = (input: string): string => {
        const lower = input.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return 'How far! 👋 Wetin I fit help you with today? We get plenty fine items for sale!';
        }
        if (lower.includes('sneaker') || lower.includes('shoe')) {
            return 'Ah! We get the Premium Red Sneakers for ₦45,000! 👟\n\nE dey very fresh, only 12 remain o. You wan buy?';
        }
        if (lower.includes('buy') || lower.includes('purchase')) {
            return 'Sharp sharp! 💳 Make I send you the payment link?\n\nJust confirm which item you wan buy and I go sort you out.';
        }
        if (lower.includes('price') || lower.includes('how much')) {
            return 'Our prices dey very correct! 💰\n\n• Sneakers: ₦45,000\n• Beach Shorts: ₦8,500\n• Ankara Shirt: ₦15,000\n\nWhich one you dey eye?';
        }
        return 'I hear you! 🙏 Just tell me wetin you wan find or check the Products tab to see our full catalog.';
    };

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => (
        <AnimatedView
            entering={item.isUser ? SlideInRight.springify() : SlideInLeft.springify()}
            style={[
                styles.messageContainer,
                item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
            ]}
        >
            {!item.isUser && (
                <LinearGradient
                    colors={['#2BAFF2', '#1F57F5']}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>🤖</Text>
                </LinearGradient>
            )}
            <View
                style={[
                    styles.messageBubble,
                    item.isUser ? styles.userBubble : styles.botBubble,
                ]}
            >
                {item.isUser ? (
                    <LinearGradient
                        colors={['#2BAFF2', '#1F57F5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.userBubbleGradient}
                    >
                        <Text style={styles.userMessageText}>{item.text}</Text>
                        <Text style={styles.timestampUser}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </LinearGradient>
                ) : (
                    <>
                        <Text style={styles.messageText}>{item.text}</Text>

                        {item.product && (
                            <View style={styles.productCard}>
                                <Text style={styles.productName}>{item.product.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.currencySymbol}>₦</Text>
                                    <Text style={styles.productPrice}>
                                        {item.product.price_ngn.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {item.paymentLink && (
                            <TouchableOpacity style={styles.payButton}>
                                <LinearGradient
                                    colors={['#00DFFF', '#2BAFF2']}
                                    style={styles.payButtonGradient}
                                >
                                    <Text style={styles.payButtonText}>💳 Pay Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.timestamp}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </>
                )}
            </View>
        </AnimatedView>
    );

    useEffect(() => {
        // Scroll to bottom when new message arrives
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Background */}
            <LinearGradient
                colors={['#05090E', '#0D1117', '#05090E']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Accent Orbs */}
            <View style={styles.orbContainer}>
                <LinearGradient
                    colors={['rgba(43, 175, 242, 0.2)', 'transparent']}
                    style={[styles.orb, styles.orbGreen]}
                />
            </View>

            {/* Header */}
            <AnimatedView entering={FadeInDown.springify()} style={styles.header}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                    style={styles.headerGradient}
                >
                    <LinearGradient
                        colors={['#2BAFF2', '#1F57F5']}
                        style={styles.headerAvatar}
                    >
                        <Text style={styles.headerAvatarText}>🤖</Text>
                    </LinearGradient>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>KOFA Bot</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, isLoading && styles.statusDotTyping]} />
                            <Text style={styles.headerStatus}>
                                {isLoading ? 'Typing...' : 'Online • Test your bot'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </AnimatedView>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
            />

            {/* Input */}
            <AnimatedView entering={FadeInUp.springify()} style={styles.inputContainer}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                    style={styles.inputGradient}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#000" size="small" />
                        ) : (
                            <LinearGradient
                                colors={inputText.trim() ? ['#2BAFF2', '#1F57F5'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                style={styles.sendButtonGradient}
                            >
                                <Text style={[styles.sendButtonText, !inputText.trim() && styles.sendButtonTextDisabled]}>➤</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
            </AnimatedView>
        </KeyboardAvoidingView>
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
    orbGreen: {
        top: 50,
        right: -150,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 12,
    },
    headerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    headerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 24,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2BAFF2',
        marginRight: 6,
    },
    statusDotTyping: {
        backgroundColor: '#00DFFF',
    },
    headerStatus: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    messageList: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 14,
    },
    messageBubble: {
        maxWidth: '78%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    userBubble: {
        borderBottomRightRadius: 6,
    },
    userBubbleGradient: {
        padding: 14,
    },
    botBubble: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 14,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#FFFFFF',
    },
    userMessageText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#000',
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 8,
        textAlign: 'right',
    },
    timestampUser: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        marginTop: 8,
        textAlign: 'right',
    },
    productCard: {
        backgroundColor: 'rgba(43, 175, 242, 0.15)',
        padding: 12,
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(43, 175, 242, 0.3)',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    currencySymbol: {
        fontSize: 12,
        color: '#2BAFF2',
        fontWeight: '600',
        marginRight: 2,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2BAFF2',
    },
    payButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    payButtonGradient: {
        padding: 12,
        alignItems: 'center',
    },
    payButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingBottom: 90,
        paddingTop: 10,
    },
    inputGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    input: {
        flex: 1,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 16,
        color: '#FFFFFF',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    sendButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonText: {
        fontSize: 20,
        color: '#000',
    },
    sendButtonTextDisabled: {
        color: 'rgba(255,255,255,0.4)',
    },
});
