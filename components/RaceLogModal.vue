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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      @click.self="emit('close')"
    >
      <div class="modal-container modal-container-sm flex flex-col">
        <!-- Modal Header -->
        <div class="modal-header flex-shrink-0">
          <div class="modal-header-container">
            <div class="modal-header-title">
              <Icon name="tdesign:system-log-filled" class="modal-header-icon" />
              <h2 class="modal-header-text">{{ t('results.race_log') }}</h2>
            </div>
            <button class="modal-close-btn" @click="emit('close')">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content custom-scrollbar flex-1">
          <div
            class="bg-gray-800/50 rounded-lg border border-gray-600 p-3 text-sm space-y-2"
          >
            <!-- Race Header Section -->
            <div
              v-if="hasRaceHeader"
              class="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600"
            >
              <div class="space-y-3">
                <!-- Race ID -->
                <div class="flex items-center gap-2">
                  <span class="text-cyan-400 font-bold text-lg">{{ t('racelog.race_title', { id: getRaceId() }) }}</span>
                </div>

                <!-- Total Bets -->
                <div class="flex items-center gap-2">
                  <span class="text-sky-400 font-semibold">{{ t('racelog.all_time') }}</span>
                  <SpiralToken
                    v-if="getTotalBetsAmount()"
                    :amount="getTotalBetsAmount() || '0'"
                    color="sky"
                    size="sm"
                    class="ml-1"
                  />
                </div>

                <!-- Bet Placed -->
                <div v-if="getBetPlacedInfo()" class="flex items-center gap-2">
                  <span class="text-emerald-400 font-semibold">{{ t('racelog.bet_placed') }}</span>
                  <img
                    v-if="getBetPlacedShipImage()"
                    :src="getBetPlacedShipImage() || ''"
                    :alt="getBetPlacedInfo() || ''"
                    class="w-6 h-6 object-contain"
                  />
                  <span class="text-white">{{ getBetPlacedInfo() }}</span>
                  <SpiralToken
                    v-if="getBetPlacedAmount()"
                    :amount="getBetPlacedAmount() || '0'"
                    color="emerald"
                    size="sm"
                    class="ml-1"
                  />
                </div>

                <!-- Your Bet -->
                <div v-if="getBetPlacedAmount()" class="flex items-center gap-2">
                  <span class="text-yellow-400 font-semibold">{{ t('racelog.your_bet') }}</span>
                  <SpiralToken
                    :amount="getBetPlacedAmount() || '0'"
                    color="yellow"
                    size="sm"
                    class="ml-1"
                  />
                </div>
              </div>
            </div>

            <!-- Race Log Entries -->
            <div
              v-for="(entry, index) in chronologicalRaceLog"
              v-show="!isHeaderEntry(entry)"
              :key="index"
              class="leading-relaxed"
              :class="getLogEntryClass(entry)"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="formatLogEntryWithoutSpiral(entry)" />
              <SpiralToken
                v-if="
                  extractSpiralAmount(entry) &&
                  !isBetPlacedEntry(entry.replace(/<[^>]*>/g, '')) &&
                  !(entry.includes('📊') && /#\d+/.test(entry))
                "
                :amount="extractSpiralAmount(entry) || '0'"
                color="default"
                size="sm"
                class="ml-2"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex-shrink-0">
          <div class="flex justify-center">
            <button
              class="btn btn-outline btn-sm"
              @click="emit('close')"
            >
              {{ t('profile.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SpiralToken from './SpiralToken.vue'
  import { useShips } from '~/composables/useShips'
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  // Props
  interface Props {
    show: boolean
    raceLog: string[]
  }

  const props = defineProps<Props>()

  // Use the unified ships composable
  const { getShipImageName, getAllShipNames } = useShips()

  // Emits
  const emit = defineEmits<{
    close: []
  }>()

  // Show race log in chronological order (first turns first)
  const chronologicalRaceLog = computed(() => {
    return [...props.raceLog]
  })

  // Helpers below match on emoji markers + structure (not language),
  // because log entries are rendered in the player's locale.
  const isSummaryEntry = (cleanEntry: string) => {
    return cleanEntry.includes('📊') && /#\d+/.test(cleanEntry)
  }
  const isBetPlacedEntry = (cleanEntry: string) => {
    return cleanEntry.includes('🎰')
  }

  // Format log entry without SPIRAL amounts (for HTML rendering)
  const formatLogEntryWithoutSpiral = (entry: string) => {
    // Remove HTML tags for processing, then re-add them
    const cleanEntry = entry.replace(/<[^>]*>/g, '')

    // Add timestamp-like formatting for turn headers
    if (cleanEntry.includes('🔄')) {
      return entry.replace(/<span[^>]*>/, '<span class="text-cyan-300 font-bold">')
    }
    if (cleanEntry.includes('✅') && /\d/.test(cleanEntry) && !cleanEntry.includes('🎰') && !cleanEntry.includes('🏆')) {
      return entry.replace(/<span[^>]*>/, '<span class="text-cyan-300 font-bold">')
    }

    // Format chaos events
    if (cleanEntry.includes('⚡')) {
      return entry.replace(/<span[^>]*>/, '<span class="text-purple-300 font-semibold">')
    }

    // Format ship movements (entries with a trailing "(...: N)" group, no emoji)
    if (/\(\s*[^)]*\d+[^)]*\)\s*$/.test(cleanEntry)) {
      return entry.replace(/<span[^>]*style="[^"]*"[^>]*>/, '<span class="text-gray-300">')
    }

    // Summary entries are hidden from the main log; strip the amounts row
    if (isSummaryEntry(cleanEntry)) {
      return entry.replace(/(\d+(?:\.\d+)?)\s*SPIRAL/g, '')
    }

    // Remove SPIRAL amounts from the HTML (they'll be handled by SpiralToken component)
    return entry.replace(/(\d+(?:\.\d+)?)\s*SPIRAL/g, '')
  }

  // Extract SPIRAL amount from log entry
  const extractSpiralAmount = (entry: string): string | null => {
    const cleanEntry = entry.replace(/<[^>]*>/g, '')
    const match = cleanEntry.match(/(\d+(?:\.\d+)?)\s*SPIRAL/)
    if (match && match[1]) {
      // Only convert Total Bets amount (which has 8 decimals from blockchain)
      if (isSummaryEntry(cleanEntry)) {
        const num = parseFloat(match[1])
        if (isNaN(num)) return null
        // Divide by 10^8 to convert from blockchain units to SPIRAL units
        const convertedAmount = num / 100000000

        // Format with K/M notation like BalanceDisplay
        if (convertedAmount >= 1000000) {
          return (convertedAmount / 1000000).toFixed(2) + 'M'
        } else if (convertedAmount >= 10000) {
          return (convertedAmount / 1000).toFixed(2) + 'K'
        } else {
          return (
            convertedAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || '0'
          )
        }
      }
      // For all other SPIRAL amounts (bet placed, etc.), return as-is
      return match[1]
    }
    return null
  }

  // Check if entry is a header entry (should be hidden from main log)
  const isHeaderEntry = (entry: string) => {
    const cleanEntry = entry.replace(/<[^>]*>/g, '')
    return isSummaryEntry(cleanEntry) || isBetPlacedEntry(cleanEntry)
  }

  // Check if we have header information to display
  const hasRaceHeader = computed(() => {
    return props.raceLog.some(entry => {
      const cleanEntry = entry.replace(/<[^>]*>/g, '')
      return isSummaryEntry(cleanEntry) || isBetPlacedEntry(cleanEntry)
    })
  })

  // Extract Race ID from log entries
  const getRaceId = () => {
    const raceEntry = props.raceLog.find(entry => {
      const cleanEntry = entry.replace(/<[^>]*>/g, '')
      return isSummaryEntry(cleanEntry)
    })
    if (raceEntry) {
      const match = raceEntry.replace(/<[^>]*>/g, '').match(/#(\d+)/)
      return match ? match[1] : t('backend.unknown')
    }
    return t('backend.unknown')
  }

  // Extract Total Bets amount
  const getTotalBetsAmount = () => {
    const totalBetsEntry = props.raceLog.find(entry => {
      const cleanEntry = entry.replace(/<[^>]*>/g, '')
      return isSummaryEntry(cleanEntry)
    })
    if (totalBetsEntry) {
      return extractSpiralAmount(totalBetsEntry)
    }
    return null
  }

  // Extract Bet Placed information (ship name, matched as a proper noun)
  const getBetPlacedInfo = () => {
    const betEntry = props.raceLog.find(entry => {
      const cleanEntry = entry.replace(/<[^>]*>/g, '')
      return isBetPlacedEntry(cleanEntry)
    })
    if (betEntry) {
      const cleanEntry = betEntry.replace(/<[^>]*>/g, '')
      const ship = getAllShipNames().find(name => cleanEntry.includes(name))
      return ship ?? null
    }
    return null
  }

  // Extract Bet Placed amount
  const getBetPlacedAmount = () => {
    const betEntry = props.raceLog.find(entry => {
      const cleanEntry = entry.replace(/<[^>]*>/g, '')
      return isBetPlacedEntry(cleanEntry)
    })
    if (betEntry) {
      return extractSpiralAmount(betEntry)
    }
    return null
  }

  // Get Bet Placed ship image
  const getBetPlacedShipImage = () => {
    const shipName = getBetPlacedInfo()
    if (shipName) {
      const imageName = getShipImageName(shipName)
      return imageName ? `/ships/${imageName}.webp` : null
    }
    return null
  }

  // Get CSS class for log entry
  const getLogEntryClass = (entry: string) => {
    const cleanEntry = entry.replace(/<[^>]*>/g, '')

    if (cleanEntry.includes('🔄')) {
      return 'text-sky-300 font-bold text-lg border-b border-gray-600 pb-1 mb-2'
    }

    if (cleanEntry.includes('✅') && /\d/.test(cleanEntry) && !cleanEntry.includes('🎰') && !cleanEntry.includes('🏆')) {
      return 'text-emerald-400 font-bold text-lg border-b border-gray-600 pb-1 mb-2'
    }

    if (cleanEntry.includes('⚡')) {
      return 'text-pink-300 font-semibold ml-2'
    }

    if (/\(\s*[^)]*\d+[^)]*\)\s*$/.test(cleanEntry)) {
      return 'text-gray-300 ml-4'
    }

    if (cleanEntry.includes('🎉')) {
      return 'text-emerald-400 font-bold'
    }

    if (cleanEntry.includes('📊') && !/#\d+/.test(cleanEntry)) {
      return 'text-white text-lg font-bold'
    }

    return 'text-gray-400'
  }
</script>
