import { ref, computed, watch } from 'vue'
import { useWeb3 } from './useWeb3'
import { SHIPS_ROSTER } from '~/data/ships'

export interface Achievement {
  id: string
  name: string
  description: string
  type: 'Betting' | 'Placement' | 'Milestone' | 'Special'
  shipId?: number
  threshold: number
  reward: number
  unlocked: boolean
  progress: number
  maxProgress: number
  progressText: string
}

interface PlayerStats {
  totalBets: number
  totalWinnings: number
  totalRaces: number
  bestPlacement: number
  averagePlacement: number
  favoriteShip: number
  username?: string
  avatar?: number
}

interface AchievementCache {
  lastUpdated: number
  playerStats: PlayerStats | null
  betCounts: number[]
  placementCounts: Record<string, number>
  achievements: Achievement[]
  account: string
}

export const useAchievements = () => {
  const {
    isConnected,
    account,
    isConnectionReady,
    getPlayerStats,
    spaceshipPlacementCount,
    getSpaceshipBetCount,
  } = useWeb3()

  // State
  const loadingAchievements = ref(false)
  const refreshingInBackground = ref(false)

  const allAchievements = ref<Achievement[]>([])
  const unlockedAchievements = ref<Achievement[]>([])
  const recentUnlocks = ref<Achievement[]>([])

  // Cache (unused but kept for future use)
  // const achievementCache = ref<AchievementCache | null>(null)
  // const cacheValidDuration = 30000 // 30 seconds

  // Computed properties for categorized achievements
  const bettingAchievements = computed(() =>
    allAchievements.value.filter(a => a.type === 'Betting')
  )

  const placementAchievements = computed(() =>
    allAchievements.value.filter(a => a.type === 'Placement')
  )

  const milestoneAchievements = computed(() =>
    allAchievements.value.filter(a => a.type === 'Milestone')
  )

  const specialAchievements = computed(() =>
    allAchievements.value.filter(a => a.type === 'Special')
  )

  const achievementProgress = computed(() => {
    if (allAchievements.value.length === 0) return 0
    return Math.round((unlockedAchievements.value.length / allAchievements.value.length) * 100)
  })

  // Cache validation (unused but kept for future use)
  // const isCacheValid = () => {
  //   if (!achievementCache.value || !account.value) return false

  //   const isRecent = Date.now() - achievementCache.value.lastUpdated < cacheValidDuration
  //   const isSameAccount = achievementCache.value.account === account.value

  //   return isRecent && isSameAccount
  // }

  // Load from cache (unused but kept for future use)
  // const loadFromCache = () => {
  //   if (!achievementCache.value) return

  //   allAchievements.value = [...achievementCache.value.achievements]
  //   unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
  //   recentUnlocks.value = unlockedAchievements.value.slice(-5)
  // }

  // Update cache
  const updateCache = (data: {
    playerStats: PlayerStats | null
    betCounts: number[]
    placementCounts: Record<string, number>
    achievements: Achievement[]
  }) => {
    if (!account.value) return

    achievementCache.value = {
      lastUpdated: Date.now(),
      account: account.value,
      ...data,
    }
  }

  // Check for significant changes
  const hasSignificantChanges = (
    newData: {
      betCounts: number[]
      placementCounts: Record<string, number>
      playerStats: PlayerStats | null
    },
    oldCache: AchievementCache | null
  ) => {
    if (!oldCache) return true

    // Check bet counts
    for (let i = 0; i < newData.betCounts.length; i++) {
      if (newData.betCounts[i] !== oldCache.betCounts[i]) return true
    }

    // Check placement counts
    for (const key in newData.placementCounts) {
      if (newData.placementCounts[key] !== oldCache.placementCounts[key]) return true
    }

    // Check player stats
    if (newData.playerStats?.totalRaces !== oldCache.playerStats?.totalRaces) return true
    if (
      Math.floor(parseFloat(String(newData.playerStats?.totalWinnings || 0))) !==
      Math.floor(parseFloat(String(oldCache.playerStats?.totalWinnings || 0)))
    )
      return true
    if (newData.playerStats?.highestJackpotTier !== oldCache.playerStats?.highestJackpotTier)
      return true

    return false
  }

  // Define all available achievements based on contract logic
  const defineAllAchievements = (): Achievement[] => {
    const achievements: Achievement[] = []
    const shipNames = [
      'Comet',
      'Juggernaut',
      'Shadow',
      'Phantom',
      'Phoenix',
      'Vanguard',
      'Wildcard',
      'Apex',
    ]

    // Betting achievements for each ship
    shipNames.forEach((shipName, shipId) => {
      achievements.push({
        id: `betting-${shipId}-5`,
        name: `The Rising Star of ${shipName}`,
        description: `First steps to glory with ${shipName}`,
        type: 'Betting',
        shipId,
        threshold: 5,
        reward: 50,
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        progressText: `Bet ${shipName} 5 times`,
      })

      achievements.push({
        id: `betting-${shipId}-25`,
        name: `Bearer of the Crest - ${shipName}`,
        description: `Prove your worth as ${shipName}'s chosen`,
        type: 'Betting',
        shipId,
        threshold: 25,
        reward: 200,
        unlocked: false,
        progress: 0,
        maxProgress: 25,
        progressText: `Bet ${shipName} 25 times`,
      })

      achievements.push({
        id: `betting-${shipId}-100`,
        name: `Eternal Overseer of ${shipName}`,
        description: `Achieve immortality with ${shipName}`,
        type: 'Betting',
        shipId,
        threshold: 100,
        reward: 1000,
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        progressText: `Bet ${shipName} 100 times`,
      })

      // Placement achievements for each ship
      achievements.push({
        id: `placement-${shipId}-1-3`,
        name: `Triumphant Warrior of ${shipName}`,
        description: `Claim your first cosmic victories with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 3,
        reward: 150,
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        progressText: `Win 1st place with ${shipName} 3 times`,
      })

      achievements.push({
        id: `placement-${shipId}-1-10`,
        name: `Dominant Force of ${shipName}`,
        description: `Become a cosmic legend with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 10,
        reward: 500,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        progressText: `Win 1st place with ${shipName} 10 times`,
      })

      achievements.push({
        id: `placement-${shipId}-2-5`,
        name: `Guardian-in-Training - ${shipName}`,
        description: `Show your protective spirit with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 5,
        reward: 100,
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        progressText: `Get 2nd place with ${shipName} 5 times`,
      })

      achievements.push({
        id: `placement-${shipId}-2-20`,
        name: `Keeper of the Code - ${shipName}`,
        description: `Join the cosmic elite with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 20,
        reward: 400,
        unlocked: false,
        progress: 0,
        maxProgress: 20,
        progressText: `Get 2nd place with ${shipName} 20 times`,
      })

      achievements.push({
        id: `placement-${shipId}-3-10`,
        name: `Pathfinder of Peace - ${shipName}`,
        description: `Navigate the stars with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 10,
        reward: 75,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        progressText: `Get 3rd place with ${shipName} 10 times`,
      })

      achievements.push({
        id: `placement-${shipId}-3-50`,
        name: `Sentinel of Stability - ${shipName}`,
        description: `Guard the cosmic order with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 50,
        reward: 300,
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        progressText: `Get 3rd place with ${shipName} 50 times`,
      })

      achievements.push({
        id: `placement-${shipId}-4-15`,
        name: `Harbinger of Harmony - ${shipName}`,
        description: `Survive the cosmic chaos with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 15,
        reward: 50,
        unlocked: false,
        progress: 0,
        maxProgress: 15,
        progressText: `Get 4th place with ${shipName} 15 times`,
      })

      achievements.push({
        id: `placement-${shipId}-4-75`,
        name: `Wielder of the Will - ${shipName}`,
        description: `Achieve cosmic immortality with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 75,
        reward: 250,
        unlocked: false,
        progress: 0,
        maxProgress: 75,
        progressText: `Get 4th place with ${shipName} 75 times`,
      })
    })

    // Milestone achievements
    achievements.push({
      id: 'milestone-races-10',
      name: 'Initiate of the Cosmos',
      description: 'First steps to cosmic glory',
      type: 'Milestone',
      threshold: 10,
      reward: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      progressText: 'Complete 10 races',
    })

    achievements.push({
      id: 'milestone-races-50',
      name: 'Strategist in Training',
      description: 'Master the art of cosmic racing',
      type: 'Milestone',
      threshold: 50,
      reward: 500,
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      progressText: 'Complete 50 races',
    })

    achievements.push({
      id: 'milestone-races-100',
      name: 'Guardian of the Galaxy',
      description: 'Protect the cosmic order',
      type: 'Milestone',
      threshold: 100,
      reward: 2000,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      progressText: 'Complete 100 races',
    })

    // Special achievements
    achievements.push({
      id: 'special-winnings-10000',
      name: 'Cosmic Conqueror',
      description: 'Amass 10,000 SPIRAL in winnings',
      type: 'Special',
      threshold: 10000,
      reward: 5000,
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
      progressText: 'Earn 10,000 SPIRAL in winnings',
    })

    achievements.push({
      id: 'special-jackpot-3',
      name: 'Super Jackpot Hunter',
      description: 'Hit the Super Jackpot',
      type: 'Special',
      threshold: 3,
      reward: 3000,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      progressText: 'Hit Super Jackpot',
    })

    return achievements
  }

  // Staged loading states
  const loadingStage = ref<
    'none' | 'definitions' | 'player-stats' | 'bet-counts' | 'placement-counts'
  >('none')
  const stageProgress = ref(0)
  const totalStages = 4

  // Load achievements in stages
  const loadAchievementsStaged = async () => {
    if (!isConnectionReady() || !account.value) return

    try {
      loadingAchievements.value = true
      loadingStage.value = 'definitions'
      stageProgress.value = 1

      // Stage 1: Load achievement definitions (instant)
      console.log('📋 Stage 1: Loading achievement definitions')
      allAchievements.value = defineAllAchievements()
      loadingStage.value = 'player-stats'
      stageProgress.value = 2

      // Stage 2: Load player stats (1 call)
      console.log('📊 Stage 2: Loading player stats')
      const stats = await getPlayerStats()
      if (!stats) return

      // Update milestone and special achievements immediately
      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Milestone' && achievement.id.includes('races')) {
          achievement.progress = stats.totalRaces
          achievement.unlocked = stats.totalRaces >= achievement.threshold
        } else if (achievement.type === 'Special') {
          if (achievement.id.includes('winnings')) {
            achievement.progress = Math.floor(parseFloat(stats.totalWinnings))
            achievement.unlocked =
              Math.floor(parseFloat(stats.totalWinnings)) >= achievement.threshold
          } else if (achievement.id.includes('jackpot')) {
            achievement.progress = stats.highestJackpotTier
            achievement.unlocked = stats.highestJackpotTier >= achievement.threshold
          }
        }
      }

      // Update UI after stage 2
      unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
      recentUnlocks.value = unlockedAchievements.value.slice(-5)
      loadingStage.value = 'bet-counts'
      stageProgress.value = 3

      // Stage 3: Load bet counts in parallel (8 calls)
      console.log('🎲 Stage 3: Loading bet counts')
      const betCountPromises = Array.from({ length: 8 }, (_, i) =>
        getSpaceshipBetCount(account.value!, i).catch(() => 0)
      )
      const allBetCounts = await Promise.all(betCountPromises)

      // Update betting achievements immediately
      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Betting' && achievement.shipId !== undefined) {
          achievement.progress = allBetCounts[achievement.shipId] || 0
          achievement.unlocked = (allBetCounts[achievement.shipId] || 0) >= achievement.threshold
        }
      }

      // Update UI after stage 3
      unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
      recentUnlocks.value = unlockedAchievements.value.slice(-5)
      loadingStage.value = 'placement-counts'
      stageProgress.value = 4

      // Stage 4: Load placement counts in parallel
      console.log('🏁 Stage 4: Loading placement counts')
      const placementPromises: Promise<{ key: string; count: number }>[] = []

      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Placement' && achievement.shipId !== undefined) {
          const parts = achievement.id.split('-')
          const placement = parseInt(parts[2])
          placementPromises.push(
            spaceshipPlacementCount(account.value!, achievement.shipId!, placement)
              .then(count => ({ key: `${achievement.shipId}-${placement}`, count }))
              .catch(() => ({ key: `${achievement.shipId}-${placement}`, count: 0 }))
          )
        }
      }

      const placementResults = await Promise.all(placementPromises)
      const placementCounts: Record<string, number> = {}
      placementResults.forEach(({ key, count }) => {
        placementCounts[key] = count
      })

      // Update placement achievements
      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Placement' && achievement.shipId !== undefined) {
          const parts = achievement.id.split('-')
          const placement = parseInt(parts[2])
          const key = `${achievement.shipId}-${placement}`
          achievement.progress = placementCounts[key] || 0
          achievement.unlocked = (placementCounts[key] || 0) >= achievement.threshold
        }
      }

      // Final UI update
      unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
      recentUnlocks.value = unlockedAchievements.value.slice(-5)

      // Update cache
      updateCache({
        playerStats: stats,
        betCounts: allBetCounts,
        placementCounts,
        achievements: allAchievements.value,
      })

      console.log('✅ All stages completed')
      loadingStage.value = 'none'
      stageProgress.value = 0
    } catch (error) {
      console.error('Failed to load achievements staged:', error)
    } finally {
      loadingAchievements.value = false
    }
  }

  // Background refresh function
  const refreshAchievementsInBackground = async () => {
    if (!isConnectionReady() || !account.value) return

    try {
      refreshingInBackground.value = true

      // Get latest data
      const stats = await getPlayerStats()
      if (!stats) return

      // Load bet counts in parallel
      const betCountPromises = Array.from({ length: 8 }, (_, i) =>
        getSpaceshipBetCount(account.value!, i).catch(() => 0)
      )
      const allBetCounts = await Promise.all(betCountPromises)

      // Load placement counts in parallel (for achievements that need them)
      const placementPromises: Promise<{ key: string; count: number }>[] = []
      const achievements =
        allAchievements.value.length > 0 ? allAchievements.value : defineAllAchievements()

      for (const achievement of achievements) {
        if (achievement.type === 'Placement' && achievement.shipId !== undefined) {
          const parts = achievement.id.split('-')
          const placement = parseInt(parts[2])
          placementPromises.push(
            spaceshipPlacementCount(account.value!, achievement.shipId!, placement)
              .then(count => ({ key: `${achievement.shipId}-${placement}`, count }))
              .catch(() => ({ key: `${achievement.shipId}-${placement}`, count: 0 }))
          )
        }
      }
      const placementResults = await Promise.all(placementPromises)
      const placementCounts: Record<string, number> = {}
      placementResults.forEach(({ key, count }) => {
        placementCounts[key] = count
      })

      // Update achievements with new data
      for (const achievement of achievements) {
        let progress = 0
        let unlocked = false

        switch (achievement.type) {
          case 'Betting':
            if (achievement.shipId !== undefined && achievement.shipId < allBetCounts.length) {
              progress = allBetCounts[achievement.shipId] || 0
            }
            break

          case 'Placement':
            if (achievement.shipId !== undefined) {
              const parts = achievement.id.split('-')
              const placement = parseInt(parts[2])
              const key = `${achievement.shipId}-${placement}`
              progress = placementCounts[key] || 0
            }
            break

          case 'Milestone':
            if (achievement.id.includes('races')) {
              progress = stats.totalRaces
            }
            break

          case 'Special':
            if (achievement.id.includes('winnings')) {
              progress = Math.floor(parseFloat(stats.totalWinnings))
            } else if (achievement.id.includes('jackpot')) {
              progress = stats.highestJackpotTier
            }
            break
        }

        unlocked = progress >= achievement.threshold
        achievement.progress = progress
        achievement.unlocked = unlocked
      }

      // Update the main achievements array if it was empty
      if (allAchievements.value.length === 0) {
        allAchievements.value = achievements
      }

      // Check if there are significant changes
      const newData = {
        playerStats: stats,
        betCounts: allBetCounts,
        placementCounts,
        achievements: allAchievements.value,
      }

      if (hasSignificantChanges(newData, achievementCache.value)) {
        // Update cache and UI
        updateCache(newData)
        unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
        recentUnlocks.value = unlockedAchievements.value.slice(-5)
      }
    } catch (error) {
      console.error('Background refresh failed:', error)
    } finally {
      refreshingInBackground.value = false
    }
  }

  // Invalidate cache (call this after game events)
  const invalidateCache = () => {
    achievementCache.value = null
  }

  // Get ship name by ID
  const getShipNameById = (shipId: number) => {
    return SHIPS_ROSTER[shipId]?.name || `Ship ${shipId}`
  }

  // Watch for connection changes
  watch([isConnected, account], ([connected, addr]) => {
    if (connected && addr) {
      loadAchievementsStaged()
    } else {
      allAchievements.value = []
      unlockedAchievements.value = []
      recentUnlocks.value = []
      achievementCache.value = null // Clear cache on disconnection
    }
  })

  return {
    // State
    loadingAchievements,
    refreshingInBackground,
    loadingStage,
    stageProgress,
    totalStages,
    allAchievements,
    unlockedAchievements,
    recentUnlocks,

    // Computed
    bettingAchievements,
    placementAchievements,
    milestoneAchievements,
    specialAchievements,
    achievementProgress,

    // Methods
    loadAchievementsStaged,
    refreshAchievementsInBackground,
    invalidateCache,
    getShipNameById,
  }
}
