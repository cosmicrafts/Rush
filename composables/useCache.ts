import { ref, computed } from 'vue'

// Cache configuration
const CACHE_CONFIG = {
  RACE_RESULTS_PREFIX: 'raceResults_',
  NOTIFICATIONS_PREFIX: 'notifications_',
  SESSION_PREFIX: 'session_',
  MAX_NOTIFICATIONS: 50, // Reduced from 100 as suggested
  NOTIFICATION_LIFETIME: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
  CACHE_VERSION: '1.0' // For future cache migrations
}

// Types
interface CachedRaceResults {
  raceId: string | number
  playerShip: number
  betAmount: string
  placement: number
  placements: number[]
  winner: number
  jackpotTier: number
  jackpotAmount: string
  totalPayout: string
  playerEarnings: string
  achievementsUnlocked: Record<string, unknown>[]
  nftRewards: Record<string, unknown>[]
  txHash: string
  timestamp: number
  cacheVersion: string
}

interface CachedNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'jackpot' | 'achievement'
  title: string
  description?: string
  timestamp: number
  walletAddress: string
  cacheVersion: string
}

interface CachedSession {
  walletAddress: string
  lastConnected: number
  persistentBettingData?: {
    selectedShip: any
    betAmount: string
  }
  cacheVersion: string
}

// Singleton state - shared across all instances
const currentWalletAddress = ref<string>('')
const isCacheLoaded = ref(false)
const cacheError = ref<string>('')
const notificationCount = ref(0) // Reactive notification count

export const useCache = () => {

  // Computed cache keys
  const raceResultsKey = computed(() => 
    currentWalletAddress.value ? `${CACHE_CONFIG.RACE_RESULTS_PREFIX}${currentWalletAddress.value}` : ''
  )
  
  const notificationsKey = computed(() => 
    currentWalletAddress.value ? `${CACHE_CONFIG.NOTIFICATIONS_PREFIX}${currentWalletAddress.value}` : ''
  )
  
  const sessionKey = computed(() => 
    currentWalletAddress.value ? `${CACHE_CONFIG.SESSION_PREFIX}${currentWalletAddress.value}` : ''
  )

  // Utility functions
  const logCacheError = (operation: string, error: any) => {
    const errorMessage = `Cache ${operation} failed: ${error?.message || error}`
    console.error(errorMessage)
    cacheError.value = errorMessage
  }

  const isLocalStorageAvailable = (): boolean => {
    try {
      const test = '__cache_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Core cache operations
  const saveToCache = <T>(key: string, data: T): boolean => {
    if (!isLocalStorageAvailable()) {
      logCacheError('save', 'localStorage not available')
      return false
    }

    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: CACHE_CONFIG.CACHE_VERSION
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
      return true
    } catch (error) {
      logCacheError('save', error)
      return false
    }
  }

  const loadFromCache = <T>(key: string): T | null => {
    if (!isLocalStorageAvailable()) {
      logCacheError('load', 'localStorage not available')
      return null
    }

    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      
      // Check if cache is expired (for notifications)
      if (parsed.timestamp && Date.now() - parsed.timestamp > CACHE_CONFIG.NOTIFICATION_LIFETIME) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.data
    } catch (error) {
      logCacheError('load', error)
      return null
    }
  }

  const removeFromCache = (key: string): boolean => {
    if (!isLocalStorageAvailable()) {
      logCacheError('remove', 'localStorage not available')
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logCacheError('remove', error)
      return false
    }
  }

  // Race Results Cache
  const saveRaceResults = (raceResults: Omit<CachedRaceResults, 'timestamp' | 'cacheVersion'>): boolean => {
    if (!raceResultsKey.value) {
      logCacheError('save race results', 'No wallet address')
      return false
    }

    const cacheData: CachedRaceResults = {
      ...raceResults,
      timestamp: Date.now(),
      cacheVersion: CACHE_CONFIG.CACHE_VERSION
    }

    return saveToCache(raceResultsKey.value, cacheData)
  }

  const loadRaceResults = (): CachedRaceResults | null => {
    if (!raceResultsKey.value) {
      logCacheError('load race results', 'No wallet address')
      return null
    }

    return loadFromCache<CachedRaceResults>(raceResultsKey.value)
  }

  const clearRaceResults = (): boolean => {
    if (!raceResultsKey.value) return false
    return removeFromCache(raceResultsKey.value)
  }

  // Notifications Cache
  const saveNotification = (notification: Omit<CachedNotification, 'timestamp' | 'cacheVersion'>): boolean => {
    console.log('💾 Saving notification, wallet address:', currentWalletAddress.value, 'key:', notificationsKey.value)
    if (!notificationsKey.value) {
      logCacheError('save notification', 'No wallet address')
      return false
    }

    try {
      const notifications = loadNotifications()
      const newNotification: CachedNotification = {
        ...notification,
        timestamp: Date.now(),
        cacheVersion: CACHE_CONFIG.CACHE_VERSION
      }

      // Add new notification to the beginning
      notifications.unshift(newNotification)

      // Keep only the latest MAX_NOTIFICATIONS
      if (notifications.length > CACHE_CONFIG.MAX_NOTIFICATIONS) {
        notifications.splice(CACHE_CONFIG.MAX_NOTIFICATIONS)
      }

      // Clean up expired notifications
      const now = Date.now()
      const validNotifications = notifications.filter(
        n => now - n.timestamp < CACHE_CONFIG.NOTIFICATION_LIFETIME
      )

      const success = saveToCache(notificationsKey.value, validNotifications)
      
      // Update reactive count after saving
      if (success) {
        notificationCount.value = validNotifications.length
        console.log('🔄 Updated notification count:', notificationCount.value)
      }
      
      return success
    } catch (error) {
      logCacheError('save notification', error)
      return false
    }
  }

  const loadNotifications = (): CachedNotification[] => {
    console.log('📋 Loading notifications, wallet address:', currentWalletAddress.value, 'key:', notificationsKey.value)
    if (!notificationsKey.value) {
      logCacheError('load notifications', 'No wallet address')
      return []
    }

    const notifications = loadFromCache<CachedNotification[]>(notificationsKey.value)
    if (!notifications) return []

    // Clean up expired notifications
    const now = Date.now()
    const validNotifications = notifications.filter(
      n => now - n.timestamp < CACHE_CONFIG.NOTIFICATION_LIFETIME
    )

    // Save cleaned notifications back to cache
    if (validNotifications.length !== notifications.length) {
      saveToCache(notificationsKey.value, validNotifications)
    }

    // Update reactive count
    notificationCount.value = validNotifications.length
    console.log('📋 Loaded notifications:', validNotifications.length)
    return validNotifications
  }

  const clearNotifications = (): boolean => {
    if (!notificationsKey.value) return false
    const success = removeFromCache(notificationsKey.value)
    if (success) {
      notificationCount.value = 0 // Update reactive count
    }
    return success
  }

  // Session Cache
  const saveSession = (sessionData: Omit<CachedSession, 'timestamp' | 'cacheVersion'>): boolean => {
    if (!sessionKey.value) {
      logCacheError('save session', 'No wallet address')
      return false
    }

    const cacheData: CachedSession = {
      ...sessionData,
      lastConnected: Date.now(),
      cacheVersion: CACHE_CONFIG.CACHE_VERSION
    }

    return saveToCache(sessionKey.value, cacheData)
  }

  const loadSession = (): CachedSession | null => {
    if (!sessionKey.value) {
      logCacheError('load session', 'No wallet address')
      return null
    }

    return loadFromCache<CachedSession>(sessionKey.value)
  }

  const clearSession = (): boolean => {
    if (!sessionKey.value) return false
    return removeFromCache(sessionKey.value)
  }

  // Wallet management
  const setWalletAddress = (address: string) => {
    console.log('🔑 Setting wallet address in cache:', address)
    currentWalletAddress.value = address
    isCacheLoaded.value = false
    cacheError.value = ''
  }

  const clearWalletCache = (): boolean => {
    if (!currentWalletAddress.value) return false

    const success = 
      clearRaceResults() &&
      clearNotifications() &&
      clearSession()

    return success
  }

  // Cache cleanup utilities
  const cleanupExpiredCache = (): void => {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()

      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.NOTIFICATIONS_PREFIX)) {
          const notifications = loadFromCache<CachedNotification[]>(key)
          if (notifications) {
            const validNotifications = notifications.filter(
              n => now - n.timestamp < CACHE_CONFIG.NOTIFICATION_LIFETIME
            )
            if (validNotifications.length !== notifications.length) {
              saveToCache(key, validNotifications)
            }
          }
        }
      })
    } catch (error) {
      logCacheError('cleanup', error)
    }
  }

  // Cache statistics
  const getCacheStats = () => {
    if (!currentWalletAddress.value) return null

    const raceResults = loadRaceResults()
    const notifications = loadNotifications()
    const session = loadSession()

    return {
      hasRaceResults: !!raceResults,
      notificationCount: notifications.length,
      hasSession: !!session,
      lastRaceTimestamp: raceResults?.timestamp,
      lastSessionTimestamp: session?.lastConnected
    }
  }

  // Initialize cache for current wallet
  const initializeWalletCache = async (): Promise<void> => {
    if (!currentWalletAddress.value) {
      logCacheError('initialize', 'No wallet address')
      return
    }

    try {
      console.log('🔄 Initializing cache for wallet:', currentWalletAddress.value)
      
      // Load existing cache data
      const raceResults = loadRaceResults()
      const notifications = loadNotifications()
      const session = loadSession()

      console.log('📊 Cache data loaded:', {
        hasRaceResults: !!raceResults,
        notificationCount: notifications.length,
        hasSession: !!session
      })

      // Update session timestamp
      if (session) {
        saveSession({
          walletAddress: currentWalletAddress.value,
          lastConnected: Date.now(),
          persistentBettingData: session.persistentBettingData
        })
      } else {
        // Create new session
        saveSession({
          walletAddress: currentWalletAddress.value,
          lastConnected: Date.now()
        })
      }

      isCacheLoaded.value = true
      console.log('✅ Cache initialized for wallet:', currentWalletAddress.value)
    } catch (error) {
      logCacheError('initialize', error)
    }
  }

  return {
    // State
    currentWalletAddress,
    isCacheLoaded,
    cacheError,
    notificationCount,

    // Race Results
    saveRaceResults,
    loadRaceResults,
    clearRaceResults,

    // Notifications
    saveNotification,
    loadNotifications,
    clearNotifications,

    // Session
    saveSession,
    loadSession,
    clearSession,

    // Wallet Management
    setWalletAddress,
    clearWalletCache,
    initializeWalletCache,

    // Utilities
    cleanupExpiredCache,
    getCacheStats,

    // Configuration
    CACHE_CONFIG
  }
}
