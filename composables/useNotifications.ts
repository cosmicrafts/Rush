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
        type: type as 'success' | 'error' | 'warning' | 'info' | 'jackpot' | 'achievement',
        title,
        description,
        walletAddress: account.value,
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
      icon: 'icon-park-twotone:success',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-emerald-500/10 border border-emerald-500/20',
        title: 'text-emerald-600 dark:text-emerald-400',
        description: 'text-emerald-600/80 dark:text-emerald-400/80',
      },
    })

    // Only cache blockchain-confirmed successes
    if (
      title.includes('Bet placed') ||
      title.includes('Notifications cleared') ||
      title.includes('Address copied')
    ) {
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
      icon: 'material-symbols:chat-error-rounded',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-red-500/10 border border-red-500/20',
        title: 'text-red-600 dark:text-red-400',
        description: 'text-red-600/80 dark:text-red-400/80',
      },
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
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-yellow-500/10 border border-yellow-500/20',
        title: 'text-yellow-600 dark:text-yellow-400',
        description: 'text-yellow-600/80 dark:text-yellow-400/80',
      },
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
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-sky-500/10 border border-sky-500/20',
        title: 'text-sky-600 dark:text-sky-400',
        description: 'text-sky-600/80 dark:text-sky-400/80',
      },
    })

    // Don't cache user action notifications (not blockchain confirmed)
    if (
      title.includes('Approving tokens') ||
      title.includes('Transaction accepted') ||
      title.includes('Transaction was cancelled') ||
      title.includes('Transaction cancelled') ||
      title.includes('Approval cancelled') ||
      title.includes('Bet cancelled') ||
      title.includes('Claim Failed') ||
      title.includes('Already Claimed') ||
      title.includes('Notifications cleared') ||
      title.includes('Placing bet on')
    ) {
      return
    }

    // Save to cache
    saveToCache('info', title, description)
  }

  const showApprovalNotification = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      icon: 'mdi:tag-approve', // Custom icon for approval
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-sky-500/10 border border-sky-500/20',
        title: 'text-sky-600 dark:text-sky-400',
        description: 'text-sky-600/80 dark:text-sky-400/80',
      },
    })

    // Don't cache approval notifications
    return
  }

  const showRaceNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    }

    notifications[type]('Race Update', message)
  }

  const showBettingNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    }

    notifications[type]('Betting Update', message)
  }

  const showWalletNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const notifications = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    }

    notifications[type]('Metamask', message)
  }

  const showAchievementNotification = (achievementName: string, reward?: string) => {
    const description = reward ? `Reward: ${reward} SPIRAL` : undefined
    const fullDescription = `${achievementName}${description ? ` - ${description}` : ''}`

    toast.add({
      title: '🏆 Achievement!',
      description: fullDescription,
      color: 'primary',
      icon: 'i-heroicons-trophy',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-purple-500/10 border border-purple-500/20',
        title: 'text-purple-600 dark:text-purple-400',
        description: 'text-purple-600/80 dark:text-purple-400/80',
      },
    })

    // Save to cache
    saveToCache('achievement', '🏆 Achievement!', fullDescription)
  }

  const showTransactionNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`

    const notifications = {
      pending: {
        title: 'Transaction Pending',
        description: `Processing transaction: ${shortHash}`,
        color: 'info' as const,
        icon: 'i-heroicons-clock',
        duration: 0, // No timeout for pending transactions
        ui: {
          root: 'bg-sky-500/10 border border-sky-500/20',
          title: 'text-sky-600 dark:text-sky-400',
          description: 'text-sky-600/80 dark:text-sky-400/80',
        },
      },
      success: {
        title: 'Race Complete',
        description: `Transaction Hash: ${txHash}`,
        color: 'success' as const,
        icon: 'heroicons:flag-16-solid',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-emerald-500/10 border border-emerald-500/20',
          title: 'text-emerald-600 dark:text-emerald-400',
          description: 'text-emerald-600/80 dark:text-emerald-400/80',
        },
      },
      error: {
        title: 'Transaction Failed',
        description: `Transaction failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'material-symbols:chat-error-rounded',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-red-500/10 border border-red-500/20',
          title: 'text-red-600 dark:text-red-400',
          description: 'text-red-600/80 dark:text-red-400/80',
        },
      },
    }

    toast.add(notifications[status])

    // Cache successful transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${txHash}`)
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
        duration: 0, // No timeout for pending transactions
        ui: {
          root: 'bg-sky-500/10 border border-sky-500/20',
          title: 'text-sky-600 dark:text-sky-400',
          description: 'text-sky-600/80 dark:text-sky-400/80',
        },
      },
      success: {
        title: 'Tokens Approved',
        description: `Transaction Hash: ${shortHash}`,
        color: 'success' as const,
        icon: 'icon-park-twotone:success',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-emerald-500/10 border border-emerald-500/20',
          title: 'text-emerald-600 dark:text-emerald-400',
          description: 'text-emerald-600/80 dark:text-emerald-400/80',
        },
      },
      error: {
        title: 'Approval Failed',
        description: `Approval failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'material-symbols:chat-error-rounded',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-red-500/10 border border-red-500/20',
          title: 'text-red-600 dark:text-red-400',
          description: 'text-red-600/80 dark:text-red-400/80',
        },
      },
    }

    toast.add(notifications[status])

    // Cache successful allowance transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${txHash}`)
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
        duration: 0, // No timeout for pending transactions
        ui: {
          root: 'bg-sky-500/10 border border-sky-500/20',
          title: 'text-sky-600 dark:text-sky-400',
          description: 'text-sky-600/80 dark:text-sky-400/80',
        },
      },
      success: {
        title: 'SPIRAL Claimed',
        description: `Transaction Hash: ${shortHash}`,
        color: 'success' as const,
        icon: 'icon-park-twotone:success',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-emerald-500/10 border border-emerald-500/20',
          title: 'text-emerald-600 dark:text-emerald-400',
          description: 'text-emerald-600/80 dark:text-emerald-400/80',
        },
      },
      error: {
        title: 'Claim Failed',
        description: `Claim failed: ${shortHash}`,
        color: 'error' as const,
        icon: 'material-symbols:chat-error-rounded',
        duration: DEFAULT_TIMEOUT,
        ui: {
          root: 'bg-red-500/10 border border-red-500/20',
          title: 'text-red-600 dark:text-red-400',
          description: 'text-red-600/80 dark:text-red-400/80',
        },
      },
    }

    toast.add(notifications[status])

    // Cache successful claim transactions with full hash in description
    if (status === 'success') {
      saveToCache('success', notifications[status].title, `Transaction Hash: ${txHash}`)
    }
  }

  const showJackpotNotification = (tier: number, amount: string) => {
    const tierNames = {
      1: 'Mini Jackpot',
      2: 'Mega Jackpot',
      3: 'Super Jackpot',
    }

    const description = `${tierNames[tier as keyof typeof tierNames] || 'Jackpot'}: ${amount} SPIRAL`

    toast.add({
      title: '🎰 Jackpot Won!',
      description,
      color: 'warning',
      icon: 'i-heroicons-sparkles',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-yellow-500/10 border border-yellow-500/20',
        title: 'text-yellow-600 dark:text-yellow-400',
        description: 'text-yellow-600/80 dark:text-yellow-400/80',
      },
    })

    // Save to cache
    saveToCache('jackpot', '🎰 Jackpot Won!', description)
  }

  const showNFTNotification = (tokenId: string) => {
    toast.add({
      title: `🏆 NFT ID #${tokenId}`,
      description: 'New Achivement NFT landed in your wallet.',
      color: 'success',
      icon: 'i-heroicons-star',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-emerald-500/10 border border-emerald-500/20',
        title: 'text-emerald-600 dark:text-emerald-400',
        description: 'text-emerald-600/80 dark:text-emerald-400/80',
      },
    })

    // Save to cache
    saveToCache('nft', `🏆 NFT ID #${tokenId}`, 'New Achievement NFT landed in your wallet.')
  }

  const showRaceResultNotification = (shipName: string, placement: string, payout: string) => {
    const title = `${placement} - ${shipName}`
    const description = `Payout: ${payout} SPIRAL`

    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-trophy',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-emerald-500/10 border border-emerald-500/20',
        title: 'text-emerald-600 dark:text-emerald-400',
        description: 'text-emerald-600/80 dark:text-emerald-400/80',
      },
    })

    // Save to cache
    saveToCache('race-result', title, description)
  }

  const showRegistrationNotification = (username: string, txHash?: string) => {
    const title = 'Sign up'
    const description = txHash 
      ? `Welcome to Rush ${username}! ${txHash}`
      : `Welcome to Rush ${username}!`

    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-user-plus',
      duration: DEFAULT_TIMEOUT,
      ui: {
        root: 'bg-emerald-500/10 border border-emerald-500/20',
        title: 'text-emerald-600 dark:text-emerald-400',
        description: 'text-emerald-600/80 dark:text-emerald-400/80',
      },
    })

    // Save to cache
    saveToCache('success', title, description)
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApprovalNotification,
    showRaceNotification,
    showBettingNotification,
    showWalletNotification,
    showAchievementNotification,
    showTransactionNotification,
    showAllowanceNotification,
    showClaimNotification,
    showJackpotNotification,
    showNFTNotification,
    showRaceResultNotification,
    showRegistrationNotification,
  }
}
