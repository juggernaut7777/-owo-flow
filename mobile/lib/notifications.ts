/**
 * KOFA Push Notifications Setup
 * Handles Expo push notifications registration and handling
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for push token
const PUSH_TOKEN_KEY = 'kofa_push_token';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export interface PushNotificationData {
    type: 'new_order' | 'low_stock' | 'payment_received' | 'test';
    order_id?: string;
    product_name?: string;
    amount?: number;
    stock_level?: number;
}

/**
 * Request push notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission denied');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error requesting push permissions:', error);
        return false;
    }
}

/**
 * Get the Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
    try {
        // Check if we already have a token stored
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
        if (storedToken) {
            return storedToken;
        }

        // Android needs special channel setup
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'KOFA Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#1E40AF',
            });
        }

        // Get the token
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-expo-project-id', // Update this with actual project ID
        });

        const tokenString = token.data;

        // Store for later use
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenString);

        console.log('📱 Expo Push Token:', tokenString);
        return tokenString;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Register device with KOFA backend for push notifications
 */
export async function registerDeviceWithBackend(
    apiBaseUrl: string,
    vendorId: string = 'default'
): Promise<boolean> {
    try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            console.log('Push notifications not permitted');
            return false;
        }

        const token = await getExpoPushToken();
        if (!token) {
            console.log('Could not get push token');
            return false;
        }

        const deviceType = Platform.OS;

        const response = await fetch(`${apiBaseUrl}/device-tokens?vendor_id=${vendorId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                expo_token: token,
                device_type: deviceType,
            }),
        });

        if (response.ok) {
            console.log('✅ Device registered for push notifications');
            return true;
        } else {
            console.error('Failed to register device:', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Error registering device:', error);
        return false;
    }
}

/**
 * Unregister device from push notifications
 */
export async function unregisterDeviceFromBackend(
    apiBaseUrl: string,
    vendorId: string = 'default'
): Promise<boolean> {
    try {
        const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
        if (!token) return true;

        const response = await fetch(
            `${apiBaseUrl}/device-tokens?expo_token=${encodeURIComponent(token)}&vendor_id=${vendorId}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
            console.log('✅ Device unregistered from push notifications');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error unregistering device:', error);
        return false;
    }
}

/**
 * Add listener for received notifications (app in foreground)
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification responses (user tapped notification)
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
export function handleNotificationTap(
    response: Notifications.NotificationResponse,
    navigation: any // React Navigation object
): void {
    const data = response.notification.request.content.data as PushNotificationData;

    switch (data.type) {
        case 'new_order':
            // Navigate to orders screen
            navigation?.navigate('orders');
            break;
        case 'low_stock':
            // Navigate to inventory screen
            navigation?.navigate('index'); // Inventory tab
            break;
        case 'payment_received':
            // Navigate to orders screen with filter
            navigation?.navigate('orders', { filter: 'paid' });
            break;
        default:
            // Just open the app
            break;
    }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
}

export default {
    requestPermissions,
    getExpoPushToken,
    registerDeviceWithBackend,
    unregisterDeviceFromBackend,
    addNotificationReceivedListener,
    addNotificationResponseListener,
    handleNotificationTap,
    getBadgeCount,
    setBadgeCount,
    clearAllNotifications,
};
