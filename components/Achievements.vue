<template>
  <div>
    <!-- Achievements Button -->
    <button
      @click="openAchievementTracker()"
      class="cosmic-hover text-white hover:text-pink-400 transition-colors font-medium text-sm"
    >
      Achievements
    </button>

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
            <p class="text-gray-400 mt-1 text-sm">
              {{ getLoadingStageText() }}
            </p>
            <div class="mt-2 bg-gray-700 rounded-full h-2 w-32 mx-auto">
              <div 
                class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(stageProgress / totalStages) * 100}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Stage {{ stageProgress }} of {{ totalStages }}</p>
          </div>
          
          <div v-else-if="refreshingInBackground" class="text-center py-2">
            <div class="flex items-center justify-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
              <p class="text-green-400 text-xs">Refreshing in background...</p>
            </div>
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
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Betting Achievements -->
                <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <h3 class="text-sm font-bold text-cyan-400 mb-2">🎲 Betting Achievements</h3>
                  <div v-if="loadingStage === 'definitions' || loadingStage === 'player-stats'" class="text-center py-4">
                    <div class="animate-pulse text-gray-400 text-sm">Loading betting achievements...</div>
                  </div>
                  <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                  <div 
                    v-for="achievement in bettingAchievements" 
                    :key="achievement.id"
                    class="p-2 rounded border"
                    :class="achievement.unlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-700/50 border-gray-600/30'"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                        <div>
                          <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                            {{ achievement.name }}
                          </div>
                          <div class="text-xs text-gray-400">{{ achievement.progressText }}</div>
                        </div>
                      </div>
                      <div class="text-xs text-green-400 font-bold">
                        +{{ achievement.reward }} SPIRAL
                      </div>
                    </div>
                    <!-- Progress Bar -->
                    <div class="mt-2">
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{{ achievement.progress }} / {{ achievement.maxProgress }}</span>
                      </div>
                      <div class="bg-gray-700 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-500"
                          :style="{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Placement Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-pink-400 mb-2">🏁 Placement Achievements</h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div 
                    v-for="achievement in placementAchievements" 
                    :key="achievement.id"
                    class="p-2 rounded border"
                    :class="achievement.unlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-700/50 border-gray-600/30'"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                        <div>
                          <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                            {{ achievement.name }}
                          </div>
                          <div class="text-xs text-gray-400">{{ achievement.progressText }}</div>
                        </div>
                      </div>
                      <div class="text-xs text-green-400 font-bold">
                        +{{ achievement.reward }} SPIRAL
                      </div>
                    </div>
                    <!-- Progress Bar -->
                    <div class="mt-2">
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{{ achievement.progress }} / {{ achievement.maxProgress }}</span>
                      </div>
                      <div class="bg-gray-700 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                          :style="{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Milestone & Special Achievements -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Milestone Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-yellow-400 mb-2">🎯 Milestone Achievements</h3>
                <div class="space-y-2">
                  <div 
                    v-for="achievement in milestoneAchievements" 
                    :key="achievement.id"
                    class="p-2 rounded border"
                    :class="achievement.unlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-700/50 border-gray-600/30'"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                        <div>
                          <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                            {{ achievement.name }}
                          </div>
                          <div class="text-xs text-gray-400">{{ achievement.progressText }}</div>
                        </div>
                      </div>
                      <div class="text-xs text-green-400 font-bold">
                        +{{ achievement.reward }} SPIRAL
                      </div>
                    </div>
                    <!-- Progress Bar -->
                    <div class="mt-2">
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{{ achievement.progress }} / {{ achievement.maxProgress }}</span>
                      </div>
                      <div class="bg-gray-700 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                          :style="{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Special Achievements -->
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h3 class="text-sm font-bold text-purple-400 mb-2">⭐ Special Achievements</h3>
                <div class="space-y-2">
                  <div 
                    v-for="achievement in specialAchievements" 
                    :key="achievement.id"
                    class="p-2 rounded border"
                    :class="achievement.unlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-700/50 border-gray-600/30'"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{{ achievement.unlocked ? '✅' : '🔒' }}</span>
                        <div>
                          <div class="text-xs font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
                            {{ achievement.name }}
                          </div>
                          <div class="text-xs text-gray-400">{{ achievement.progressText }}</div>
                        </div>
                      </div>
                      <div class="text-xs text-green-400 font-bold">
                        +{{ achievement.reward }} SPIRAL
                      </div>
                    </div>
                    <!-- Progress Bar -->
                    <div class="mt-2">
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{{ achievement.progress }} / {{ achievement.maxProgress }}</span>
                      </div>
                      <div class="bg-gray-700 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          :style="{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }"
                        ></div>
                      </div>
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
              <h3 class="text-sm font-bold text-purple-400 mb-2">🏅 Achievement Rewards</h3>
              <p class="text-xs text-gray-400 mb-3">
                Unlocked achievements grant SPIRAL token rewards. 
                Each achievement represents a milestone in your racing journey.
                <span class="text-green-400 font-bold">Achievements are automatically tracked and rewarded!</span>
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
import { useAchievements } from '~/composables/useAchievements'
import { useWeb3 } from '~/composables/useWeb3'

// Use the achievements composable
const {
  // State
  showAchievementTrackerModal,
  loadingAchievements,
  refreshingInBackground,
  loadingStage,
  stageProgress,
  totalStages,
  allAchievements,
  unlockedAchievements,
  bettingAchievements,
  milestoneAchievements,
  placementAchievements,
  specialAchievements,
  recentUnlocks,
  achievementProgress,

  // Methods
  openAchievementTracker,
  closeAchievementTracker,
  getShipNameById
} = useAchievements()

// Get loading stage text
const getLoadingStageText = () => {
  switch (loadingStage.value) {
    case 'definitions': return 'Loading achievement definitions...'
    case 'player-stats': return 'Loading player statistics...'
    case 'bet-counts': return 'Loading betting history...'
    case 'placement-counts': return 'Loading race results...'
    default: return 'Loading achievements...'
  }
}

// Use Web3 for connection state
const { isConnected } = useWeb3()



// Only show the button when connected
const showAchievementsButton = computed(() => isConnected.value)
</script>
