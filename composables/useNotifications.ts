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
    
    // Only cache blockchain-confirmed successes
    if (title.includes('Bet placed') ||
        title.includes('Notifications cleared') ||
        title.includes('Address copied')) {
      return // Don't cache these user action confirmations
    }
    
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
    
    // Don't cache error notifications (user actions or failures)
    return
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
    
    // Don't cache user action notifications (not blockchain confirmed)
    if (title.includes('Approving tokens') ||
        title.includes('Transaction accepted') ||
        title.includes('Transaction was cancelled') ||
        title.includes('Transaction cancelled') ||
        title.includes('Approval cancelled') ||
        title.includes('Bet cancelled') ||
        title.includes('Claim Failed') ||
        title.includes('Already Claimed') ||
        title.includes('Notifications cleared') ||
        title.includes('Placing bet on')) {
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
        title: 'Race Complete',
        description: `Transaction Hash: ${shortHash} | Hash: ${txHash}`,
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
    
    // Cache successful transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${shortHash}`)
    }
  }

  const showAllowanceNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    
    const notifications = {
      pending: {
        title: 'Approval Pending',
        description: `Processing approval: ${shortHash}`,
        color: 'info' as const,
        icon: 'i-heroicons-clock',
        duration: 0 // No timeout for pending transactions
      },
      success: {
        title: 'Tokens Approved',
        description: `Transaction Hash: ${shortHash}`,
        color: 'success' as const,
        icon: 'i-heroicons-check-circle',
        duration: DEFAULT_TIMEOUT
      },
      error: {
        title: 'Approval Failed',
        description: `Approval failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'i-heroicons-x-circle',
        duration: DEFAULT_TIMEOUT
      }
    }

    toast.add(notifications[status])
    
    // Cache successful allowance transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${shortHash}`)
    }
  }

  const showClaimNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    
    const notifications = {
      pending: {
        title: 'Claim Pending',
        description: `Processing claim: ${shortHash}`,
        color: 'info' as const,
        icon: 'i-heroicons-clock',
        duration: 0 // No timeout for pending transactions
      },
      success: {
        title: 'SPIRAL Claimed',
        description: `Transaction Hash: ${shortHash}`,
        color: 'success' as const,
        icon: 'i-heroicons-check-circle',
        duration: DEFAULT_TIMEOUT
      },
      error: {
        title: 'Claim Failed',
        description: `Claim failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'i-heroicons-x-circle',
        duration: DEFAULT_TIMEOUT
      }
    }

    toast.add(notifications[status])
    
    // Cache successful claim transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${shortHash}`)
    }
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
      title: `🏆 NFT ID #${tokenId} minted! `,
      description: 'GG! New Achivement NFT landed in your wallet.',
      color: 'success',
      icon: 'i-heroicons-star',
      duration: DEFAULT_TIMEOUT
    })
    
    // Save to cache
    saveToCache('nft', `🏆 NFT ID #${tokenId} minted! `, 'GG! New Achievement NFT landed in your wallet.')
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
    saveToCache('race-result', title, 'See full results!')
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
    showAllowanceNotification,
    showClaimNotification,
    showJackpotNotification,
    showNFTNotification,
    showRaceResultNotification
  }
}
