<template>
  <div>
    <!-- Leaderboard Button -->
    <button
      class="cosmic-hover text-white font-bold hover:text-pink-400 transition-colors font-medium text-2xl"
      @click="openLeaderboards()"
    >
      Leaderboards
    </button>

    <!-- Leaderboards Modal -->
    <Transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      enter-to-class="modal-enter-to"
      leave-active-class="modal-leave-active"
      leave-from-class="modal-leave-from"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="showLeaderboardsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
        @click.self="closeLeaderboards"
      >
        <div class="modal-container modal-container-md flex flex-col">
          <!-- Modal Header -->
          <div class="modal-header flex-shrink-0">
            <div class="modal-header-container">
              <div class="modal-header-title">
                <Icon name="solar:cup-bold" class="modal-header-icon" />
                <h2 class="modal-header-text">Leaderboards</h2>
              </div>
              <button
                class="modal-close-btn"
                @click="closeLeaderboards"
              >
                ×
              </button>
            </div>
          </div>

          <!-- Total Bets Info -->
          <div class="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-cyan-500/20 flex-shrink-0">
            <div class="flex justify-center items-center gap-4">
              <div class="text-center">
                <div class="text-gray-400 text-xs">Total Bets</div>
                <div class="text-cyan-400 font-semibold">
                  <SpiralToken
                    :amount="
                      raceInfo?.totalBets ? ethers.utils.formatUnits(raceInfo.totalBets, 8) : '0'
                    "
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="modal-content custom-scrollbar flex-1">
            <div v-if="loadingLeaderboards" class="text-center py-6">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto" />
              <p class="text-gray-400 mt-1 text-sm">Loading leaderboards...</p>
            </div>

            <div v-else-if="leaderboardData.players.length === 0" class="text-center py-6">
              <p class="text-gray-400 text-sm">No leaderboard data available</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(player, index) in leaderboardData.players"
                :key="index"
                class="card card-md hover:bg-gray-750 cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
                @click="openUserProfile(player)"
              >
                <div class="flex items-center gap-4">
                  <!-- Position Badge -->
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2"
                      :class="getPositionClass(index + 1)"
                    >
                      #{{ index + 1 }}
                    </div>
                  </div>

                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div
                      class="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-purple-400/30 overflow-hidden"
                      :class="getAvatarClass(leaderboardData.avatars?.[index] || 255)"
                    >
                      <img
                        v-if="
                          leaderboardData.avatars?.[index] !== undefined &&
                          leaderboardData.avatars[index] < 255
                        "
                        :src="`/avatars/${leaderboardData.avatars[index]}.webp`"
                        :alt="`Avatar ${leaderboardData.avatars[index]}`"
                        class="w-full h-full rounded-full object-cover"
                        @error="handleAvatarError"
                      />
                      <img
                        v-else
                        src="/avatars/null.webp"
                        alt="No Avatar"
                        class="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col">
                      <!-- Username -->
                      <div
                        v-if="leaderboardData.usernames[index]"
                        class="text-purple-400 font-semibold text-2xl mb-1"
                      >
                        {{ leaderboardData.usernames[index] }}
                      </div>
                      <div v-else class="text-gray-500 font-semibold text-2xl mb-1">Anonymous</div>

                      <!-- Address -->
                      <div class="text-cyan-400 text-xs font-normal opacity-80">
                        {{ formatAddress(player) }}
                      </div>
                    </div>
                  </div>

                  <!-- Winnings -->
                  <div class="flex-shrink-0 text-right">
                    <div class="text-lg font-bold text-emerald-400 mb-1">
                      <SpiralToken
                        :amount="leaderboardData.winnings[index] || '0'"
                        color="emerald"
                        size="lg"
                      />
                    </div>
                    <div class="text-xs text-gray-400">Total Winnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer flex-shrink-0">
            <div class="flex justify-center">
              <button
                class="btn btn-primary btn-sm flex items-center space-x-2"
                @click="closeLeaderboards"
              >
                <Icon name="solar:cup-bold" class="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- User Profile Modal -->
    <UserProfile
      :show="showUserProfileModal"
      :target-address="targetUserAddress"
      @close="closeUserProfile"
    />
  </div>
</template>

<script setup lang="ts">
  import { useBetting } from '~/composables/useBetting'
  import { ethers } from 'ethers'
  import SpiralToken from './SpiralToken.vue'
  import UserProfile from './UserProfile.vue'

  // Define component name for ESLint
  defineOptions({
    name: 'GameLeaderboard',
  })

  // Use the betting composable for leaderboard functionality
  const {
    // State
    showLeaderboardsModal,
    leaderboardData,
    loadingLeaderboards,
    raceInfo,
    showUserProfileModal,
    targetUserAddress,

    // Methods
    openLeaderboards,
    closeLeaderboards,
    openUserProfile,
    closeUserProfile,
    formatAddress,
  } = useBetting()

  // Helper functions for styling
  const getPositionClass = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black border-yellow-300'
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black border-gray-200'
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white border-amber-500'
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800 text-white border-gray-500'
    }
  }

  const getAvatarClass = (avatarId: number) => {
    if (avatarId === 255) return 'bg-gray-600'
    return 'bg-gradient-to-br from-purple-400 to-blue-500'
  }

  const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
    img.nextElementSibling?.classList.remove('hidden')
  }
</script>
