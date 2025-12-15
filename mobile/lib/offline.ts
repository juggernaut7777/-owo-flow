/**
 * KOFA Offline Sync Manager
 * Handles offline mode, background sync, and local caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    PRODUCTS_CACHE: 'kofa_products_cache',
    ORDERS_CACHE: 'kofa_orders_cache',
    SYNC_QUEUE: 'kofa_sync_queue',
    LAST_SYNC: 'kofa_last_sync',
    OFFLINE_SALES: 'kofa_offline_sales',
};

// Types
export interface OfflineSale {
    id: string;
    product_name: string;
    quantity: number;
    amount_ngn: number;
    channel: 'instagram' | 'walk-in' | 'whatsapp' | 'other';
    notes?: string;
    created_at: string;
    synced: boolean;
}

export interface SyncQueueItem {
    id: string;
    action: 'create_sale' | 'create_order' | 'update_stock' | 'create_expense';
    payload: any;
    created_at: string;
    retries: number;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSyncAt: string | null;
    pendingActions: number;
    cachedProducts: number;
}

/**
 * Check if device is online
 */
export async function checkConnectivity(apiBaseUrl: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiBaseUrl}/health`, {
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Cache products locally for offline access
 */
export async function cacheProducts(products: any[]): Promise<void> {
    try {
        await AsyncStorage.setItem(
            STORAGE_KEYS.PRODUCTS_CACHE,
            JSON.stringify({
                products,
                cached_at: new Date().toISOString(),
            })
        );
    } catch (error) {
        console.error('Failed to cache products:', error);
    }
}

/**
 * Get cached products
 */
export async function getCachedProducts(): Promise<any[] | null> {
    try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
        if (cached) {
            const data = JSON.parse(cached);
            return data.products;
        }
        return null;
    } catch (error) {
        console.error('Failed to get cached products:', error);
        return null;
    }
}

/**
 * Cache orders locally
 */
export async function cacheOrders(orders: any[]): Promise<void> {
    try {
        await AsyncStorage.setItem(
            STORAGE_KEYS.ORDERS_CACHE,
            JSON.stringify({
                orders,
                cached_at: new Date().toISOString(),
            })
        );
    } catch (error) {
        console.error('Failed to cache orders:', error);
    }
}

/**
 * Get cached orders
 */
export async function getCachedOrders(): Promise<any[] | null> {
    try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_CACHE);
        if (cached) {
            const data = JSON.parse(cached);
            return data.orders;
        }
        return null;
    } catch (error) {
        console.error('Failed to get cached orders:', error);
        return null;
    }
}

/**
 * Add item to sync queue (for offline actions)
 */
export async function addToSyncQueue(
    action: SyncQueueItem['action'],
    payload: any
): Promise<string> {
    try {
        const queueItem: SyncQueueItem = {
            id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action,
            payload,
            created_at: new Date().toISOString(),
            retries: 0,
        };
        
        const existing = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue: SyncQueueItem[] = existing ? JSON.parse(existing) : [];
        queue.push(queueItem);
        
        await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
        
        console.log(`📤 Added to sync queue: ${action}`);
        return queueItem.id;
    } catch (error) {
        console.error('Failed to add to sync queue:', error);
        throw error;
    }
}

/**
 * Get pending sync queue items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
        const queue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Failed to get sync queue:', error);
        return [];
    }
}

/**
 * Remove item from sync queue (after successful sync)
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
    try {
        const existing = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue: SyncQueueItem[] = existing ? JSON.parse(existing) : [];
        const filtered = queue.filter(item => item.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to remove from sync queue:', error);
    }
}

/**
 * Save an offline sale (when network is unavailable)
 */
export async function saveOfflineSale(sale: Omit<OfflineSale, 'id' | 'created_at' | 'synced'>): Promise<OfflineSale> {
    const offlineSale: OfflineSale = {
        ...sale,
        id: `offline-sale-${Date.now()}`,
        created_at: new Date().toISOString(),
        synced: false,
    };
    
    try {
        const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_SALES);
        const sales: OfflineSale[] = existing ? JSON.parse(existing) : [];
        sales.push(offlineSale);
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_SALES, JSON.stringify(sales));
        
        // Also add to sync queue
        await addToSyncQueue('create_sale', {
            product_name: sale.product_name,
            quantity: sale.quantity,
            amount_ngn: sale.amount_ngn,
            channel: sale.channel,
            notes: sale.notes,
        });
        
        console.log(`💾 Saved offline sale: ${sale.product_name}`);
        return offlineSale;
    } catch (error) {
        console.error('Failed to save offline sale:', error);
        throw error;
    }
}

/**
 * Get all offline sales
 */
export async function getOfflineSales(): Promise<OfflineSale[]> {
    try {
        const sales = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_SALES);
        return sales ? JSON.parse(sales) : [];
    } catch (error) {
        console.error('Failed to get offline sales:', error);
        return [];
    }
}

/**
 * Process sync queue - sync pending actions with server
 */
export async function processSyncQueue(apiBaseUrl: string): Promise<{
    synced: number;
    failed: number;
    remaining: number;
}> {
    const queue = await getSyncQueue();
    let synced = 0;
    let failed = 0;
    
    for (const item of queue) {
        try {
            let endpoint = '';
            let method = 'POST';
            
            switch (item.action) {
                case 'create_sale':
                    endpoint = '/sales/manual';
                    break;
                case 'create_order':
                    endpoint = '/orders';
                    break;
                case 'update_stock':
                    endpoint = `/products/${item.payload.product_id}/restock`;
                    break;
                case 'create_expense':
                    endpoint = '/expenses';
                    break;
                default:
                    console.warn(`Unknown sync action: ${item.action}`);
                    continue;
            }
            
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.payload),
            });
            
            if (response.ok) {
                await removeFromSyncQueue(item.id);
                synced++;
                console.log(`✅ Synced: ${item.action}`);
            } else {
                failed++;
                console.log(`❌ Failed to sync: ${item.action} - ${response.status}`);
            }
        } catch (error) {
            failed++;
            console.warn(`Sync error for ${item.action}:`, error);
        }
    }
    
    // Update last sync time
    if (synced > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
    
    const remaining = queue.length - synced;
    return { synced, failed, remaining };
}

/**
 * Get overall sync status
 */
export async function getSyncStatus(apiBaseUrl: string): Promise<SyncStatus> {
    const isOnline = await checkConnectivity(apiBaseUrl);
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const queue = await getSyncQueue();
    const cachedProductsData = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
    
    let cachedProducts = 0;
    if (cachedProductsData) {
        const data = JSON.parse(cachedProductsData);
        cachedProducts = data.products?.length || 0;
    }
    
    return {
        isOnline,
        lastSyncAt: lastSync,
        pendingActions: queue.length,
        cachedProducts,
    };
}

/**
 * Clear all cached data (for debugging/logout)
 */
export async function clearAllCache(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.PRODUCTS_CACHE,
            STORAGE_KEYS.ORDERS_CACHE,
            STORAGE_KEYS.SYNC_QUEUE,
            STORAGE_KEYS.LAST_SYNC,
            STORAGE_KEYS.OFFLINE_SALES,
        ]);
        console.log('🗑️ Cleared all cache');
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}

export default {
    checkConnectivity,
    cacheProducts,
    getCachedProducts,
    cacheOrders,
    getCachedOrders,
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue,
    saveOfflineSale,
    getOfflineSales,
    processSyncQueue,
    getSyncStatus,
    clearAllCache,
    STORAGE_KEYS,
};
