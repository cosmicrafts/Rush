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
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showLeaderboardsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
        @click.self="closeLeaderboards"
      >
        <!-- Enhanced animated background particles with COSMIC RUSH theme -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"
          />
          <div
            class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"
          />
          <div
            class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"
          />
          <div
            class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"
          />
          <div
            class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"
          />

          <!-- Circuit board lines -->
          <div
            class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
          />
          <div
            class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"
          />
          <div
            class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"
          />
          <div
            class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"
          />

          <!-- Scattered plus signs -->
          <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
          <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
          <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
        </div>

        <div
          class="relative w-full max-w-4xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-yellow-500/30 overflow-hidden backdrop-blur-sm"
        >
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-yellow-500/20 blur-2xl"
          />

          <!-- Header with COSMIC RUSH theme -->
          <div class="relative p-6 text-center border-b border-yellow-500/20">
            <h2
              class="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent tracking-tight"
            >
              🏆 Leaderboards
            </h2>
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
              @click="closeLeaderboards"
            >
              ×
            </button>
          </div>

          <!-- Total Bets Info -->
          <div
            class="relative p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-yellow-500/20"
          >
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

          <!-- Content -->
          <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div v-if="loadingLeaderboards" class="text-center py-6">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto" />
              <p class="text-gray-400 mt-1 text-sm">Loading leaderboards...</p>
            </div>

            <div v-else-if="leaderboardData.players.length === 0" class="text-center py-6">
              <p class="text-gray-400 text-sm">No leaderboard data available</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(player, index) in leaderboardData.players"
                :key="index"
                class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-all duration-200 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
                @click="openUserProfile(player)"
              >
                <div class="flex items-center gap-4">
                  <!-- Position Badge -->
                  <div class="flex-shrink-0">
                    <div
                      class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
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
                        class="text-purple-400 font-semibold text-lg mb-1"
                      >
                        {{ leaderboardData.usernames[index] }}
                      </div>
                      <div v-else class="text-gray-500 font-semibold text-lg mb-1">Anonymous</div>

                      <!-- Address -->
                      <div class="text-cyan-400 font-mono text-sm opacity-80">
                        {{ formatAddress(player) }}
                      </div>
                    </div>
                  </div>

                  <!-- Winnings -->
                  <div class="flex-shrink-0 text-right">
                    <div class="text-lg font-bold text-green-400 mb-1">
                      <SpiralToken
                        :amount="leaderboardData.winnings[index] || '0'"
                        color="green"
                        size="lg"
                      />
                    </div>
                    <div class="text-xs text-gray-400">Total Winnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer with COSMIC RUSH themed button -->
          <div
            class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-yellow-500/20"
          >
            <div class="flex justify-center">
              <button
                class="bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-yellow-400/25 transition-all duration-200 transform hover:scale-102"
                @click="closeLeaderboards"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>🏆</span>
                  <span>Close</span>
                </span>
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
