import { useCache } from './useCache'
import { useWeb3 } from './useWeb3'

export const useNotifications = () => {
  const toast = useToast()
  
  // Unified timeout system - 3 seconds default
  const DEFAULT_TIMEOUT = 3000

  // Cache integration
  const { saveNotification } = useCache()
  const { account } = useWeb3()

  // Helper function to save notification to cache
  const saveToCache = (type: string, title: string, description?: string) => {
    if (!account.value) return

    try {
      saveNotification({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type as any,
        title,
        description,
        walletAddress: account.value
      })
    } catch (error) {
      console.error('Failed to save notification to cache:', error)
    }
  }

  const showSuccess = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-check-circle',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('success', title, description)
  }

  const showError = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('error', title, description)
  }

  const showWarning = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('warning', title, description)
  }

  const showInfo = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      icon: 'i-heroicons-information-circle',
      duration: DEFAULT_TIMEOUT
    })
    
    // Don't cache betting-related notifications
    if (title.includes('Placing bet on') || title.includes('Betting')) {
      return
    }
    
    // Save to cache
    saveToCache('info', title, description)
  }

  const showRaceNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }
    
    notifications[type]('Race Update', message)
  }

  const showBettingNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }
    
    notifications[type]('Betting Update', message)
  }

  const showWalletNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }
    
    notifications[type]('Metamask', message)
  }

  const showAchievementNotification = (achievementName: string, reward?: string) => {
    const description = reward ? `Reward: ${reward} SPIRAL` : undefined
    const fullDescription = `${achievementName}${description ? ` - ${description}` : ''}`
    
    toast.add({
      title: '🏆 Achievement Unlocked!',
      description: fullDescription,
      color: 'primary',
      icon: 'i-heroicons-trophy',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('achievement', '🏆 Achievement Unlocked!', fullDescription)
  }

  const showTransactionNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    
    const notifications = {
      pending: {
        title: 'Transaction Pending',
        description: `Processing transaction: ${shortHash}`,
        color: 'info' as const,
        icon: 'i-heroicons-clock',
        duration: 0 // No timeout for pending transactions
      },
      success: {
        title: 'Transaction Successful',
        description: `Transaction confirmed: ${shortHash}`,
        color: 'success' as const,
        icon: 'i-heroicons-check-circle',
        duration: DEFAULT_TIMEOUT
      },
      error: {
        title: 'Transaction Failed',
        description: `Transaction failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'i-heroicons-x-circle',
        duration: DEFAULT_TIMEOUT
      }
    }

    toast.add(notifications[status])
  }

  const showJackpotNotification = (tier: number, amount: string) => {
    const tierNames = {
      1: 'Mini Jackpot',
      2: 'Mega Jackpot', 
      3: 'Super Jackpot'
    }
    
    const description = `${tierNames[tier as keyof typeof tierNames] || 'Jackpot'}: ${amount} SPIRAL`
    
    toast.add({
      title: '🎰 Jackpot Won!',
      description,
      color: 'warning',
      icon: 'i-heroicons-sparkles',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('jackpot', '🎰 Jackpot Won!', description)
  }

  const showNFTNotification = (tokenId: string) => {
    toast.add({
      title: `Achievement NFT #${tokenId} minted! 🏆`,
      description: 'Check your wallet for the new NFT!',
      color: 'success',
      icon: 'i-heroicons-star',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('nft', `Achievement NFT #${tokenId} minted! 🏆`, 'Check your wallet for the new NFT!')
  }

  const showRaceResultNotification = (shipName: string, placement: string, payout: string) => {
    const title = `${shipName} finished ${placement} place - Payout: ${payout} SPIRAL`
    
    toast.add({
      title,
      description: 'Race completed!',
      color: 'success',
      icon: 'i-heroicons-trophy',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('race-result', title, 'Race completed!')
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showRaceNotification,
    showBettingNotification,
    showWalletNotification,
    showAchievementNotification,
    showTransactionNotification,
    showJackpotNotification,
    showNFTNotification,
    showRaceResultNotification
  }
}
