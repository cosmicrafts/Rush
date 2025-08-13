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
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showAchievementTrackerModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
        @click.self="closeAchievementTracker"
      >
        <!-- Enhanced animated background particles with COSMIC RUSH theme -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"></div>
          <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"></div>
          <div class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"></div>
          <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"></div>
          <div class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"></div>
          
          <!-- Circuit board lines -->
          <div class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
          <div class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"></div>
          <div class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"></div>
          <div class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"></div>
          
          <!-- Scattered plus signs -->
          <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
          <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
          <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
        </div>

        <div class="relative w-full max-w-6xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-purple-500/30 overflow-hidden backdrop-blur-sm">
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-2xl"></div>
          
          <!-- Header with COSMIC RUSH theme -->
          <div class="relative p-6 text-center border-b border-purple-500/20">
            <h2 class="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
              🏆 Achievement Tracker
            </h2>
            <button 
              @click="closeAchievementTracker" 
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>
          
          <!-- Content -->
          <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
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
        </div>
          
          <!-- Footer with COSMIC RUSH themed button -->
          <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-purple-500/20">
            <div class="flex justify-center">
              <button 
                @click="closeAchievementTracker" 
                class="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-purple-400/25 transition-all duration-200 transform hover:scale-102"
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

// Expose methods for external control
defineExpose({
  openAchievementTracker
})
</script>
