<template>
  <Transition
    enter-active-class="modal-enter-active"
    enter-from-class="modal-enter-from"
    enter-to-class="modal-enter-to"
    leave-active-class="modal-leave-active"
    leave-from-class="modal-leave-from"
    leave-to-class="modal-leave-to"
  >
    <div
      v-if="show"
      :key="panelKey"
      class="modal-overlay"
      @click.self="$emit('close')"
    >
      <div class="modal-container modal-container-sm">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="layout-flex-between">
            <h2 class="text-responsive-lg font-bold text-white">
              🏁 Race #{{ raceResults?.raceId || 'Loading...' }}
            </h2>
            <!-- Transaction Explorer Button -->
            <button
              v-if="props.txHash"
              title="View transaction on explorer"
              class="btn btn-ghost btn-sm"
              @click="viewTransactionOnExplorer"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>TX</span>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content custom-scrollbar">
          <!-- Compact Player Result & Earnings -->
          <div v-if="raceResults" class="card card-md space-responsive-md">
            <div class="layout-flex-between space-responsive-sm">
              <div class="layout-flex-center space-responsive-sm">
                <img
                  :src="`/ships/${getShipImageName(getShipName(raceResults.playerShip))}.webp`"
                  :alt="getShipName(raceResults.playerShip)"
                  class="w-8 h-8 object-contain"
                />
                <div>
                  <h3 class="text-responsive-sm font-bold text-white">
                    {{ getShipName(raceResults.playerShip) }}
                  </h3>
                  <p class="text-responsive-xs text-gray-400">Your Ship</p>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="text-2xl font-bold"
                  :class="raceResults.placement === 1 ? 'text-yellow-400' : 'text-gray-300'"
                >
                  {{ getPlaceEmoji(raceResults.placement) }}
                </div>
              </div>
            </div>

            <!-- Compact Earnings -->
            <div class="space-responsive-sm text-responsive-xs">
              <div class="layout-grid grid-cols-2 gap-responsive-sm">
                <div>
                  <p class="text-gray-400">Bet</p>
                  <SpiralToken :amount="raceResults.betAmount || '0'" color="default" size="sm" />
                </div>
                <div class="text-right">
                  <p class="text-gray-400">Payout</p>
                  <SpiralToken :amount="raceResults.totalPayout || '0'" color="green" size="sm" />
                </div>
              </div>
              <div class="border-t border-gray-600 pt-responsive-sm">
                <div class="layout-flex-between">
                  <p class="text-gray-400">Net Earnings</p>
                  <SpiralToken
                    :amount="`${calculateTotalNetEarnings() > 0 ? '+' : ''}${calculateTotalNetEarnings().toFixed(4)}`"
                    :color="
                      calculateTotalNetEarnings() > 0
                        ? 'green'
                        : calculateTotalNetEarnings() < 0
                          ? 'red'
                          : 'default'
                    "
                    size="sm"
                  />
                </div>
                <!-- Achievement Rewards -->
                <div v-if="achievementsUnlocked.length > 0" class="border-t border-gray-600 pt-responsive-sm">
                  <div class="layout-flex-between">
                    <p class="text-gray-400">Achievement Rewards</p>
                    <SpiralToken
                      :amount="`+${achievementsUnlocked.reduce((total, achievement) => total + parseFloat(achievement.reward.toString()), 0).toFixed(4)}`"
                      color="purple"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Compact Jackpot Display -->
            <div
              v-if="raceResults?.jackpotTier > 0"
              class="mt-responsive-sm p-responsive-sm card card-sm bg-gradient-secondary border-gradient-secondary"
            >
              <div class="layout-flex-center space-responsive-sm">
                <img
                  :src="getJackpotImage(raceResults.jackpotTier)"
                  :alt="getJackpotName(raceResults.jackpotTier)"
                  class="w-12 h-12 object-contain flex-shrink-0"
                />
                <div class="text-center">
                  <p class="text-yellow-300 font-bold text-responsive-sm">JACKPOT!</p>
                  <p class="text-responsive-xs text-yellow-200 font-semibold">
                    {{ getJackpotName(raceResults.jackpotTier) }}
                  </p>
                  <SpiralToken
                    :amount="`+${raceResults.jackpotAmount || '0'}`"
                    color="yellow"
                    size="sm"
                  />
                </div>
                <img
                  :src="getJackpotImage(raceResults.jackpotTier)"
                  :alt="getJackpotName(raceResults.jackpotTier)"
                  class="w-12 h-12 object-contain flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <!-- Compact Achievements -->
          <div
            v-if="achievementsUnlocked.length > 0"
            class="card card-md bg-gradient-primary border-gradient-primary"
          >
            <h3 class="text-responsive-xs font-bold text-white space-responsive-sm layout-flex-center">
              🏅 Achievements Unlocked!
            </h3>

            <div class="space-responsive-sm">
              <div
                v-for="achievement in achievementsUnlocked"
                :key="achievement.id"
                class="layout-flex space-responsive-sm p-responsive-sm card card-sm"
              >
                <div class="text-sm">🏅</div>
                <div class="flex-1">
                  <p class="font-bold text-purple-300 text-responsive-xs">{{ achievement.name }}</p>
                  <p class="text-purple-200 text-responsive-xs">{{ achievement.description }}</p>
                  <div class="layout-flex space-responsive-sm mt-responsive-sm">
                    <p class="text-responsive-xs text-purple-100">You received NFT ID: {{ achievement.id }}</p>
                    <button
                      title="View NFT on explorer"
                      class="btn btn-ghost btn-sm"
                      @click="viewNFTOnExplorer(achievement.id)"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>View</span>
                    </button>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-green-400 font-bold text-responsive-xs">+{{ achievement.reward }} SPIRAL</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Final Standings -->
          <div class="card card-md">
            <h3 class="text-responsive-md font-bold text-white space-responsive-sm layout-flex-center">🏆 Final Standings</h3>
            <div class="space-responsive-sm">
              <div
                v-for="(shipId, index) in raceResults?.placements"
                :key="shipId"
                class="layout-flex-between p-responsive-sm card card-sm"
                :class="
                  shipId === raceResults?.playerShip
                    ? 'bg-gradient-primary border-gradient-primary'
                    : ''
                "
              >
                <div class="layout-flex space-responsive-sm">
                  <div class="text-responsive-xs">{{ getPlaceEmoji(index + 1) }}</div>
                  <img
                    :src="`/ships/${getShipImageName(getShipName(shipId))}.webp`"
                    :alt="getShipName(shipId)"
                    class="w-4 h-4 object-contain"
                  />
                  <span
                    class="font-bold text-responsive-sm"
                    :class="shipId === raceResults?.playerShip ? 'text-cyan-400' : 'text-white'"
                  >
                    {{ getShipName(shipId).replace('The ', '') }}
                    <span v-if="shipId === raceResults?.playerShip" class="text-cyan-300"
                      >(YOU)</span
                    >
                  </span>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-300 text-responsive-xs">{{ getPlaceText(index + 1) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="layout-flex-center space-responsive-sm">
            <button
              class="btn btn-primary btn-sm"
              @click="openRaceLog"
            >
              📊 Race Log
            </button>
            <button
              class="btn btn-outline btn-sm"
              @click="handleClose"
            >
              Continue Racing
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <RaceLogModal :show="showRaceLogModal" :race-log="raceLog" @close="closeRaceLog" />
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted } from 'vue'
  import { useGame } from '~/composables/useGame'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useShips } from '~/composables/useShips'
  import { useNotifications } from '~/composables/useNotifications'
  import RaceLogModal from './RaceLogModal.vue'
  import SpiralToken from './SpiralToken.vue'

  // Props
  interface Props {
    show: boolean
    raceResults?: {
      raceId: number
      playerShip: number
      placement: number
      betAmount: string
      totalPayout: string
      jackpotTier: number
      jackpotAmount: string
      winner: number
      placements: number[]
    } | null
    playerEarnings: string
    achievementsUnlocked: Array<{
      id: string
      name: string
      description: string
      reward: string | number
    }>
    nftRewards: Array<{
      tokenId: string
      name: string
      description: string
      image: string
    }>
    panelKey: number
    txHash?: string
  }

  const props = defineProps<Props>()

  // Emits
  const emit = defineEmits<{
    close: []
  }>()

  // Initialize notification system
  const { showJackpotNotification, showAchievementNotification, showNFTNotification } =
    useNotifications()

  // Race log functionality
  const gameStore = useGame()
  const { getShipName } = useWeb3()
  const { getShipImageName } = useShips()
  const showRaceLogModal = ref(false)
  const raceLog = computed(() => gameStore.raceLog.value)

  // Create a unique signature for race results to track if notifications were shown
  const createRaceSignature = (raceResults: {
    raceId?: string | number
    playerShip: number
    placement: number
    betAmount: string
    totalPayout: string
  }) => {
    if (!raceResults) return ''
    return `${raceResults.raceId || 'unknown'}-${raceResults.playerShip}-${raceResults.placement}-${raceResults.betAmount}-${raceResults.totalPayout}`
  }

  // Check if notifications have been shown for this race signature
  const hasNotificationsBeenShown = (signature: string): boolean => {
    try {
      const shownNotifications = localStorage.getItem('shown_race_notifications')
      if (shownNotifications) {
        const shown = JSON.parse(shownNotifications)
        return shown.includes(signature)
      }
    } catch (error) {
      console.error('Error checking shown notifications:', error)
    }
    return false
  }

  // Mark notifications as shown for this race signature
  const markNotificationsAsShown = (signature: string) => {
    try {
      const shownNotifications = localStorage.getItem('shown_race_notifications')
      let shown = shownNotifications ? JSON.parse(shownNotifications) : []

      // Add the signature if not already present
      if (!shown.includes(signature)) {
        shown.push(signature)
        // Keep only the last 50 signatures to prevent localStorage bloat
        if (shown.length > 50) {
          shown = shown.slice(-50)
        }
        localStorage.setItem('shown_race_notifications', JSON.stringify(shown))
        console.log('✅ Marked notifications as shown for signature:', signature)
      }
    } catch (error) {
      console.error('Error marking notifications as shown:', error)
    }
  }

  const openRaceLog = () => {
    showRaceLogModal.value = true
  }

  const closeRaceLog = () => {
    showRaceLogModal.value = false
  }

  const handleClose = () => {
    console.log('Continue Racing button clicked')
    emit('close')
  }

  // Show notifications when race results are displayed
  const showRaceNotifications = () => {
    console.log('🎯 showRaceNotifications called', {
      raceResults: props.raceResults,
      achievements: props.achievementsUnlocked.length,
      nfts: props.nftRewards.length,
    })

    if (!props.raceResults) {
      console.log('❌ No race results available')
      return
    }

    // Create a unique signature for this race result
    const currentSignature = createRaceSignature(props.raceResults)
    console.log('🔍 Checking signature:', currentSignature)

    // Check if notifications have already been shown for this race signature
    if (hasNotificationsBeenShown(currentSignature)) {
      console.log('⏭️ Notifications already shown for race signature:', currentSignature)
      return
    }

    // Mark notifications as shown for this race signature
    markNotificationsAsShown(currentSignature)

    const jackpotTier = props.raceResults.jackpotTier
    const jackpotAmount = props.raceResults.jackpotAmount

    console.log('🏁 Race completed, showing staged notifications')

    // Show jackpot notification if won (staged)
    if (jackpotTier > 0 && jackpotAmount && parseFloat(jackpotAmount) > 0) {
      console.log('🎰 Scheduling jackpot notification for tier:', jackpotTier)
      setTimeout(() => {
        showJackpotNotification(jackpotTier, jackpotAmount)
      }, 1000) // Show after race result notification
    }

    // Show achievement notifications if unlocked (staged)
    if (props.achievementsUnlocked.length > 0) {
      console.log('🏆 Scheduling achievement notifications:', props.achievementsUnlocked.length)
      props.achievementsUnlocked.forEach((achievement, index) => {
        setTimeout(
          () => {
            showAchievementNotification(achievement.name, achievement.reward.toString())
          },
          1000 + index * 1000
        ) // Show after jackpot notification
      })
    }

    // Show NFT minted notifications (staged after achievements)
    if (props.nftRewards.length > 0) {
      console.log('🏆 Scheduling NFT notifications:', props.nftRewards.length)
      props.nftRewards.forEach((nft, index) => {
        setTimeout(
          () => {
            showNFTNotification(nft.tokenId)
          },
          1000 + index * 1000
        ) // Show after achievement notifications
      })
    }
  }

  // Watch for new race results to detect when a new race is loaded
  watch(
    () => props.raceResults,
    newRaceResults => {
      if (newRaceResults) {
        const newSignature = createRaceSignature(newRaceResults)
        console.log('🔄 Race results updated, signature:', newSignature)
      }
    },
    { deep: true }
  )

  // Watch for when the panel becomes visible to show notifications
  watch(
    () => props.show,
    newShow => {
      console.log('👀 Panel show state changed:', newShow, 'Race results:', !!props.raceResults)
      if (newShow && props.raceResults) {
        console.log('✅ Panel is visible and has race results, scheduling notifications')
        // Small delay to ensure panel is rendered
        setTimeout(() => {
          showRaceNotifications()
        }, 500)
      }
    },
    { immediate: true }
  )

  // Also trigger notifications on mount if panel is already visible
  onMounted(() => {
    console.log(
      '🚀 Component mounted, panel show:',
      props.show,
      'Race results:',
      !!props.raceResults
    )
    if (props.show && props.raceResults) {
      console.log('✅ Component mounted with visible panel and race results')
      setTimeout(() => {
        showRaceNotifications()
      }, 1000) // Slightly longer delay for mount
    }
  })

  // Methods
  const getPlaceText = (place: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${place}${suffixes[Math.min(place - 1, 7)]}`
  }

  const getPlaceEmoji = (place: number) => {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
    return emojis[place - 1] || '🏁'
  }

  // Get jackpot image based on tier
  const getJackpotImage = (tier: number): string => {
    switch (tier) {
      case 1:
        return '/mini-jackpot.webp'
      case 2:
        return '/mega-jackpot.webp'
      case 3:
        return '/super-jackpot.webp'
      default:
        return '/mini-jackpot.webp'
    }
  }

  // Get jackpot name based on tier
  const getJackpotName = (tier: number): string => {
    switch (tier) {
      case 1:
        return 'Mini Jackpot'
      case 2:
        return 'Mega Jackpot'
      case 3:
        return 'Super Jackpot'
      default:
        return 'Unknown Jackpot'
    }
  }

  // Calculate total net earnings including race earnings, jackpot, and achievements
  const calculateTotalNetEarnings = (): number => {
    let total = parseFloat(props.playerEarnings)

    // Add jackpot amount if any
    if (props.raceResults?.jackpotTier && props.raceResults.jackpotTier > 0) {
      total += parseFloat(props.raceResults.jackpotAmount || '0')
    }

    // Add achievement rewards
    if (props.achievementsUnlocked.length > 0) {
      const achievementRewards = props.achievementsUnlocked.reduce(
        (total, achievement) => total + parseFloat(achievement.reward.toString()),
        0
      )
      total += achievementRewards
    }

    return total
  }

  // View transaction on explorer
  const viewTransactionOnExplorer = () => {
    if (!props.txHash) return

    const explorerUrl = `https://shannon-explorer.somnia.network/tx/${props.txHash}`
    window.open(explorerUrl, '_blank')
  }

  // View NFT on explorer
  const viewNFTOnExplorer = (tokenId: string) => {
    if (!tokenId) return

    const NFT_CONTRACT_ADDRESS = '0x36F7460daaC996639d8F445E29f3BD45C1760d1D'
    const explorerUrl = `https://shannon-explorer.somnia.network/token/${NFT_CONTRACT_ADDRESS}/instance/${tokenId}`
    window.open(explorerUrl, '_blank')
  }
</script>
