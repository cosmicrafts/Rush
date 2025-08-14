export const useNotifications = () => {
  const toast = useToast()
  
  // Unified timeout system - 3 seconds default
  const DEFAULT_TIMEOUT = 3000

  const showSuccess = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-check-circle',
      duration: DEFAULT_TIMEOUT
    })
  }

  const showError = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
      duration: DEFAULT_TIMEOUT
    })
  }

  const showWarning = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
      duration: DEFAULT_TIMEOUT
    })
  }

  const showInfo = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      icon: 'i-heroicons-information-circle',
      duration: DEFAULT_TIMEOUT
    })
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
    toast.add({
      title: '🏆 Achievement Unlocked!',
      description: `${achievementName}${description ? ` - ${description}` : ''}`,
      color: 'primary',
      icon: 'i-heroicons-trophy',
      duration: DEFAULT_TIMEOUT
    })
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
    
    toast.add({
      title: '🎰 Jackpot Won!',
      description: `${tierNames[tier as keyof typeof tierNames] || 'Jackpot'}: ${amount} SPIRAL`,
      color: 'warning',
      icon: 'i-heroicons-sparkles',
      duration: DEFAULT_TIMEOUT
    })
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
    showJackpotNotification
  }
}
