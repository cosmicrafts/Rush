<template>
  <div>
    <!-- Achievements Button -->
    <UButton
      @click="openAchievementTracker()"
      class="bg-gradient-to-r from-pink-400 to-cyan-500 hover:from-pink-500 hover:to-cyan-600 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium text-xs"
    >
      Achievements
    </UButton>

    <!-- Achievement Tracker Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showAchievementTrackerModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeAchievementTracker"
      >
        <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-purple-400">🏆 Achievement Tracker</h2>
            <button 
              @click="closeAchievementTracker" 
              class="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div v-if="loadingAchievements" class="text-center py-6">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
            <p class="text-gray-400 mt-1 text-sm">Loading achievements...</p>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Achievement Summary -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-bold text-purple-300">📊 Achievement Progress</h3>
                <div class="text-xs text-gray-400">
                  {{ unlockedAchievements.length }} / {{ allAchievements.length }} Unlocked
                </div>
              </div>
              <div class="mt-2 bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${achievementProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- Achievement Categories -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Betting Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-cyan-400 mb-2">🎲 Betting Achievements</h3>
                <div class="space-y-2">
                  <div 
                    v-for="achievement in bettingAchievements" 
                    :key="achievement.id"
                    class="flex items-center justify-between p-2 rounded"
                    :class="achievement.unlocked ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600/30'"
                  >
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                      <div>
                        <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                          {{ achievement.name }}
                        </div>
                        <div class="text-xs text-gray-400">{{ achievement.description }}</div>
                      </div>
                    </div>
                    <div v-if="achievement.unlocked" class="text-xs text-green-400 font-bold">
                      +{{ achievement.reward }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Milestone Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-yellow-400 mb-2">🎯 Milestone Achievements</h3>
                <div class="space-y-2">
                  <div 
                    v-for="achievement in milestoneAchievements" 
                    :key="achievement.id"
                    class="flex items-center justify-between p-2 rounded"
                    :class="achievement.unlocked ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600/30'"
                  >
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                      <div>
                        <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                          {{ achievement.name }}
                        </div>
                        <div class="text-xs text-gray-400">{{ achievement.description }}</div>
                      </div>
                    </div>
                    <div v-if="achievement.unlocked" class="text-xs text-green-400 font-bold">
                      +{{ achievement.reward }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Placement Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-pink-400 mb-2">🏁 Placement Achievements</h3>
                <div class="space-y-2">
                  <div 
                    v-for="achievement in placementAchievements" 
                    :key="achievement.id"
                    class="flex items-center justify-between p-2 rounded"
                    :class="achievement.unlocked ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600/30'"
                  >
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                      <div>
                        <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                          {{ achievement.name }}
                        </div>
                        <div class="text-xs text-gray-400">{{ achievement.description }}</div>
                      </div>
                    </div>
                    <div v-if="achievement.unlocked" class="text-xs text-green-400 font-bold">
                      +{{ achievement.reward }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Unlocks -->
            <div v-if="recentUnlocks.length > 0" class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-green-400 mb-2">🎉 Recent Unlocks</h3>
              <div class="space-y-2">
                <div 
                  v-for="unlock in recentUnlocks" 
                  :key="unlock.id"
                  class="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded"
                >
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">🎉</span>
                    <div>
                      <div class="text-xs font-medium text-green-300">{{ unlock.name }}</div>
                      <div class="text-xs text-gray-400">{{ unlock.description }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-green-400 font-bold">
                    +{{ unlock.reward }}
                  </div>
                </div>
              </div>
            </div>

            <!-- NFT Rewards Info -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-400 mb-2">🖼️ NFT Rewards</h3>
              <p class="text-xs text-gray-400">
                Unlocked achievements grant NFT rewards that are automatically sent to your wallet. 
                Each achievement has a unique NFT with special artwork and metadata.
              </p>
            </div>
          </div>
          
          <div class="flex justify-center mt-4">
            <button 
              @click="closeAchievementTracker" 
              class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBetting } from '~/composables/useBetting'

// Use the betting composable for achievement functionality
const {
  // State
  showAchievementTrackerModal,
  loadingAchievements,
  allAchievements,
  unlockedAchievements,
  bettingAchievements,
  milestoneAchievements,
  placementAchievements,
  recentUnlocks,
  achievementProgress,

  // Methods
  openAchievementTracker,
  closeAchievementTracker,

  // Web3 state
  isConnected
} = useBetting()

// Only show the button when connected
const showAchievementsButton = computed(() => isConnected.value)
</script>
