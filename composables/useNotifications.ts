import { useCache } from './useCache'
import { useWeb3 } from './useBackend'
import { useRushI18n } from './useRushI18n'

export const useNotifications = () => {
  const toast = useToast()
  const { t } = useRushI18n()

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

  const showSuccess = (title: string, description?: string, opts?: { nocache?: boolean }) => {
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

    if (opts?.nocache) return

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

  const showWarning = (title: string, description?: string, opts?: { nocache?: boolean }) => {
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

    if (opts?.nocache) return

    // Save to cache
    saveToCache('warning', title, description)
  }

  const showInfo = (title: string, description?: string, opts?: { nocache?: boolean }) => {
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

    if (opts?.nocache) return

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

    notifications[type](t('notify.race_update'), message)
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

    notifications[type](t('notify.betting_update'), message)
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

    notifications[type](t('notify.notification'), message)
  }

  const showAchievementNotification = (achievementName: string, reward?: string) => {
    const fullDescription = reward
      ? t('notify.ach_body', { name: achievementName, reward })
      : achievementName

    toast.add({
      title: t('notify.ach_title'),
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
    saveToCache('achievement', t('notify.ach_title'), fullDescription)
  }

  const showTransactionNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`

    const notifications = {
      pending: {
        title: t('notify.tx_pending'),
        description: t('notify.tx_pending_body', { hash: shortHash }),
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
        title: t('notify.race_complete'),
        description: t('notify.tx_hash', { hash: txHash }),
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
        title: t('notify.tx_failed'),
        description: t('notify.tx_failed_body', { hash: shortHash }),
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
      saveToCache('success', notifications[status].title, t('notify.tx_hash', { hash: txHash }))
    }
  }

  const showAllowanceNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`

    const notifications = {
      pending: {
        title: t('notify.approval_pending'),
        description: t('notify.approval_body', { hash: shortHash }),
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
        title: t('notify.tokens_approved'),
        description: t('notify.tx_hash', { hash: shortHash }),
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
        title: t('notify.approval_failed'),
        description: t('notify.approval_failed_body', { hash: shortHash }),
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
      saveToCache('success', notifications[status].title, t('notify.tx_hash', { hash: txHash }))
    }
  }

  const showClaimNotification = (txHash: string, status: 'pending' | 'success' | 'error') => {
    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`

    const notifications = {
      pending: {
        title: t('notify.claim_pending'),
        description: t('notify.claim_body', { hash: shortHash }),
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
        title: t('notify.spiral_claimed'),
        description: t('notify.tx_hash', { hash: shortHash }),
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
        title: t('notify.claim_failed'),
        description: t('notify.claim_failed_body', { hash: shortHash }),
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
      saveToCache('success', notifications[status].title, t('notify.tx_hash', { hash: txHash }))
    }
  }

  const showJackpotNotification = (tier: number, amount: string) => {
    const tierKey =
      tier === 1 ? 'betting.mini_jackpot' : tier === 2 ? 'betting.mega_jackpot' : tier === 3 ? 'betting.super_jackpot' : null

    const description = t('notify.jackpot_body', {
      tier: tierKey ? t(tierKey) : t('results.unknown_jackpot'),
      amount,
    })

    toast.add({
      title: t('notify.jackpot_won'),
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
    saveToCache('jackpot', t('notify.jackpot_won'), description)
  }

  const showNFTNotification = (tokenId: string) => {
    toast.add({
      title: t('notify.nft_landed', { id: tokenId }),
      description: t('notify.nft_landed_body'),
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
    saveToCache('nft', t('notify.nft_landed', { id: tokenId }), t('notify.nft_landed_body'))
  }

  const showRaceResultNotification = (shipName: string, placement: string, payout: string) => {
    const title = t('notify.race_line', { place: placement, ship: shipName })
    const description = t('notify.payout_line', { amount: payout })

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
    const title = t('notify.signup')
    const description = t('notify.welcome', { user: username }) + (txHash ? ` ${txHash}` : '')

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
