<template>
  <div>
    <!-- User Profile Modal -->
    <Transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click.self="$emit('close')"
      >
        <!-- Background particles -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60"
          />
          <div
            class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50"
          />
          <div
            class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60"
          />
        </div>

        <!-- Main Modal -->
        <div
          class="relative w-full max-w-4xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-purple-500/30 overflow-hidden backdrop-blur-sm"
        >
          <!-- Header -->
          <div class="relative p-6 text-center border-b border-purple-500/20">
            <h2
              class="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight"
            >
              👤 User Profile
            </h2>
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
              @click="handleClose"
            >
              ×
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="flex border-b border-purple-500/20 bg-gray-800/50">
            <button
              class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
              :class="
                showProfileTab
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              "
              @click="activeTab = 'profile'"
            >
              📊 Profile
            </button>
            <button
              class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
              :class="
                showMatchHistoryTab
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              "
              @click="activeTab = 'match-history'"
            >
              📈 Match History
            </button>
            <button
              class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
              :class="
                showAchievementsTab
                  ? 'text-pink-400 border-b-2 border-pink-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              "
              @click="activeTab = 'achievements'"
            >
              🏆 Achievements
            </button>
            <button
              class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
              :class="
                showStatisticsTab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              "
              @click="activeTab = 'statistics'"
            >
              📈 Statistics
            </button>
          </div>

          <!-- Content Area -->
          <div class="relative max-h-[70vh] overflow-y-auto">
            <!-- Tab Content with smooth transitions -->
            <Transition
              :key="activeTab"
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 transform translate-y-2"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform translate-y-2"
            >
              <div v-show="true" class="tab-content">
                <!-- Profile Tab -->
                <div v-if="showProfileTab" class="p-6 space-y-6">
                  <div v-if="loadingPlayerStatistics" class="text-center py-6">
                    <div
                      class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"
                    />
                    <p class="text-gray-400 mt-1 text-sm">Loading user profile...</p>
                  </div>

                  <div v-else-if="!playerStats" class="text-center py-6">
                    <p class="text-gray-400 text-sm">No user data available</p>
                  </div>

                  <div v-else class="space-y-6">
                    <!-- User Info Section -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">

                      <div class="flex items-center gap-4">
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                          <div
                            class="w-20 h-20 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-purple-400/30 overflow-hidden"
                            :class="getAvatarClass(localAvatarId)"
                          >
                            <img
                              v-if="localAvatarId !== undefined && localAvatarId < 255"
                              :src="`/avatars/${localAvatarId}.webp`"
                              :alt="`Avatar ${localAvatarId}`"
                              class="w-full h-full rounded-full object-cover"
                              @error="handleAvatarError"
                            >
                            <img
                              v-else
                              src="/avatars/null.webp"
                              alt="No Avatar"
                              class="w-full h-full rounded-full object-cover"
                            >
                          </div>
                        </div>

                        <!-- User Details -->
                        <div class="flex-1 min-w-0">
                          <div class="flex flex-col md:flex-row md:justify-between h-full">
                            <!-- Left Side: Username and Address (centered with avatar) -->
                            <div class="flex flex-col justify-center">
                              <!-- Username -->
                              <div v-if="hasUsername" class="text-purple-400 font-semibold text-xl mb-1">
                                {{ playerUsername }}
                              </div>
                              <div v-else class="text-gray-500 font-semibold text-xl mb-1">
                                Anonymous
                              </div>
                              
                              <!-- Address -->
                              <div class="flex items-center space-x-2">
                                <span class="text-cyan-400 font-mono text-sm opacity-80">
                                  {{ shortDisplayAddress }}
                                </span>
                                <button
                                  class="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                                  title="Copy full address"
                                  @click="copyAddress"
                                >
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <!-- Right Side: Balance, Explorer -->
                            <div class="flex flex-col justify-center">
                              <!-- Current Balance -->
                              <div class="text-lg font-bold text-green-400 mb-2">
                                <SpiralToken
                                  :amount="currentBalance"
                                  color="green"
                                  size="lg"
                                />
                              </div>

                              <!-- Explorer -->
                              <div class="text-sm">
                                <button
                                  class="flex items-center space-x-2 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors px-2 py-1 rounded"
                                  @click="viewOnExplorer"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                  <span>View on Explorer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>





                    <!-- Achievements Summary -->
                    <div
                      v-if="achievementCount > 0"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
                        🏆 Achievements
                        <span
                          class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded"
                        >
                          {{ achievementCount }} Total
                        </span>
                      </h3>
                      <p class="text-gray-400 text-xs">
                        You have unlocked {{ achievementCount }} achievements! Check your wallet for
                        NFT rewards.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Match History Tab -->
                <div v-if="showMatchHistoryTab" class="p-6 space-y-4 min-h-[400px]">
                  <div
                    v-if="
                      loadingMatchHistory ||
                      initialMatchHistoryLoading ||
                      (!matchHistoryLoaded && matchHistory.length === 0)
                    "
                    class="flex items-center justify-center min-h-[300px]"
                  >
                    <div class="text-center">
                      <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"
                      />
                      <p class="text-gray-400 mt-2 text-sm">Loading match history...</p>
                    </div>
                  </div>

                  <div
                    v-else-if="matchHistoryLoaded && matchHistory.length === 0"
                    class="text-center py-6"
                  >
                    <p class="text-gray-400 text-sm">No matches found</p>
                  </div>

                  <div v-else-if="matchHistoryLoaded && matchHistory.length > 0" class="space-y-4">
                    <div
                      v-for="(match, index) in matchHistory"
                      :key="index"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    >
                                            <!-- Header with Race ID and Date -->
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <span class="text-purple-400 font-semibold text-lg"
                            >Race #{{ match.raceId }}</span
                          >
                          <span class="text-gray-400 text-sm">{{
                            formatDate(new Date(match.timestamp))
                          }}</span>
                          <!-- Transaction Explorer Button (Note: Only works for recent matches) -->
                          <button
                            class="flex items-center space-x-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                            @click="viewTransactionOnExplorer(match.raceId)"
                            title="View race on explorer (transaction hash not available for historical matches)"
                          >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            <span>Race</span>
                          </button>
                        </div>
                        
                        <!-- Right side: Jackpot (if applicable) and Net P&L -->
                        <div class="flex items-center gap-4">
                          <!-- Jackpot Info (if applicable) -->
                          <div v-if="match.jackpotTier > 0" class="flex items-center space-x-2 bg-amber-900/30 border border-amber-500/30 rounded-lg px-3 py-2">
                            <img
                              :src="getJackpotImage(match.jackpotTier)"
                              :alt="getJackpotName(match.jackpotTier)"
                              class="w-12 h-12 object-contain flex-shrink-0"
                            >
                            <div class="flex flex-col">
                              <span class="text-amber-400 font-semibold text-sm">{{ getJackpotName(match.jackpotTier) }}</span>
                              <SpiralToken :amount="match.jackpotAmount" color="amber" size="sm" />
                            </div>
                          </div>
                          
                          <!-- Net P&L Display -->
                          <div class="text-right">
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-gray-400">Net P&L:</span>
                              <span
                                :class="
                                  (parseFloat(match.payout) + parseFloat(match.jackpotAmount)) > parseFloat(match.betAmount)
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                "
                                class="text-lg font-bold"
                              >
                                {{ (parseFloat(match.payout) + parseFloat(match.jackpotAmount)) > parseFloat(match.betAmount) ? '+' : ''
                                }}{{
                                  ((parseFloat(match.payout) + parseFloat(match.jackpotAmount)) - parseFloat(match.betAmount)).toFixed(4)
                                }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Main Content Row -->
                      <div class="flex items-center space-x-6">
                        <!-- Ship Section -->
                        <div class="flex items-center space-x-4">
                          <!-- Large Ship Image -->
                          <div>
                            <img
                              :src="`/ships/${getShipImageName(getShipNameById(match.shipBet))}.webp`"
                              :alt="getShipNameById(match.shipBet)"
                              class="w-20 h-20 object-contain"
                            >
                          </div>
                          
                          <!-- Ship Info -->
                          <div class="flex flex-col">
                            <div class="text-cyan-400 font-semibold text-lg">
                              {{ getShipNameById(match.shipBet) }}
                            </div>
                            <div class="text-gray-400 text-sm">
                              {{ getChaosFactorName(getShipNameById(match.shipBet)) }}
                            </div>
                          </div>
                        </div>

                        <!-- Betting Details -->
                        <div class="flex items-center space-x-6">
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Bet</span>
                            <SpiralToken :amount="match.betAmount" color="yellow" size="md" />
                          </div>
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Payout</span>
                            <SpiralToken
                              :amount="match.payout"
                              :color="match.payout > match.betAmount ? 'green' : 'red'"
                              size="md"
                            />
                          </div>
                        </div>

                        <!-- Race Results -->
                        <div class="flex items-center space-x-6">
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Position</span>
                            <span :class="getPlacementColor(match.placement)" class="font-bold text-lg">
                              {{ getPlacementText(match.placement) }}
                            </span>
                          </div>
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Total Winnings</span>
                            <SpiralToken
                              :amount="parseFloat(match.payout) + parseFloat(match.jackpotAmount)"
                              :color="(parseFloat(match.payout) + parseFloat(match.jackpotAmount)) > parseFloat(match.betAmount) ? 'green' : 'red'"
                              size="md"
                            />
                          </div>
                        </div>

                                                 <!-- Performance Metrics -->
                         <div class="flex items-center space-x-6">
                           <div class="flex flex-col items-center">
                             <span class="text-gray-400 text-xs mb-1">ROI</span>
                             <span
                               :class="
                                 (parseFloat(match.payout) + parseFloat(match.jackpotAmount)) > parseFloat(match.betAmount)
                                   ? 'text-green-400'
                                   : 'text-red-400'
                               "
                               class="font-bold text-sm"
                             >
                               {{ ((((parseFloat(match.payout) + parseFloat(match.jackpotAmount)) - parseFloat(match.betAmount)) / parseFloat(match.betAmount)) * 100).toFixed(1) }}%
                             </span>
                           </div>
                         </div>

                        
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Achievements Tab -->
                <div v-if="showAchievementsTab" class="p-6 space-y-4 min-h-[600px]">
                  <div
                    v-if="
                      loadingAchievements ||
                      initialAchievementsLoading ||
                      (!achievementsLoaded && allAchievements.length === 0)
                    "
                    class="flex items-center justify-center min-h-[500px]"
                  >
                    <div class="text-center">
                      <div
                        class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"
                      />
                      <p class="text-gray-400 mt-1 text-sm">
                        {{ getLoadingStageText() }}
                      </p>
                      <div class="mt-2 bg-gray-700 rounded-full h-2 w-32 mx-auto">
                        <div
                          class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${(stageProgress / totalStages) * 100}%` }"
                        />
                      </div>
                      <p class="text-xs text-gray-500 mt-1">
                        Stage {{ stageProgress }} of {{ totalStages }}
                      </p>
                    </div>
                  </div>

                  <div v-else-if="refreshingInBackground" class="text-center py-2">
                    <div class="flex items-center justify-center space-x-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400" />
                      <p class="text-green-400 text-xs">Refreshing in background...</p>
                    </div>
                  </div>

                  <div
                    v-else-if="achievementsLoaded && allAchievements.length > 0"
                    class="space-y-4"
                  >
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
                        />
                      </div>
                    </div>

                    <!-- Achievement Categories -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Betting Achievements -->
                      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <h3 class="text-sm font-bold text-cyan-400 mb-2">
                          🎲 Betting Achievements
                        </h3>
                        <div
                          v-if="loadingStage === 'definitions' || loadingStage === 'player-stats'"
                          class="text-center py-4"
                        >
                          <div class="animate-pulse text-gray-400 text-sm">
                            Loading betting achievements...
                          </div>
                        </div>
                        <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                          <div
                            v-for="achievement in bettingAchievements"
                            :key="achievement.id"
                            class="p-2 rounded border"
                            :class="
                              achievement.unlocked
                                ? 'bg-green-900/30 border-green-500/30'
                                : 'bg-gray-700/50 border-gray-600/30'
                            "
                          >
                            <div class="flex items-center justify-between mb-1">
                              <div class="flex items-center space-x-2">
                                <span class="text-lg">{{
                                  achievement.unlocked ? '✅' : '🔒'
                                }}</span>
                                <div>
                                  <div
                                    class="text-xs font-medium"
                                    :class="
                                      achievement.unlocked ? 'text-green-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-green-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{ achievement.unlocked ? achievement.maxProgress : Math.min(achievement.progress, achievement.maxProgress) }} / {{ achievement.maxProgress }}</span
                                >
                              </div>
                              <div class="bg-gray-700 rounded-full h-2">
                                <div
                                  class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-500"
                                  :style="{
                                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                                  }"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Placement Achievements -->
                      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <h3 class="text-sm font-bold text-pink-400 mb-2">
                          🏁 Placement Achievements
                        </h3>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                          <div
                            v-for="achievement in placementAchievements"
                            :key="achievement.id"
                            class="p-2 rounded border"
                            :class="
                              achievement.unlocked
                                ? 'bg-green-900/30 border-green-500/30'
                                : 'bg-gray-700/50 border-gray-600/30'
                            "
                          >
                            <div class="flex items-center justify-between mb-1">
                              <div class="flex items-center space-x-2">
                                <span class="text-lg">{{
                                  achievement.unlocked ? '✅' : '🔒'
                                }}</span>
                                <div>
                                  <div
                                    class="text-xs font-medium"
                                    :class="
                                      achievement.unlocked ? 'text-green-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-green-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{ achievement.unlocked ? achievement.maxProgress : Math.min(achievement.progress, achievement.maxProgress) }} / {{ achievement.maxProgress }}</span
                                >
                              </div>
                              <div class="bg-gray-700 rounded-full h-2">
                                <div
                                  class="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                                  :style="{
                                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                                  }"
                                />
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
                        <h3 class="text-sm font-bold text-yellow-400 mb-2">
                          🎯 Milestone Achievements
                        </h3>
                        <div class="space-y-2">
                          <div
                            v-for="achievement in milestoneAchievements"
                            :key="achievement.id"
                            class="p-2 rounded border"
                            :class="
                              achievement.unlocked
                                ? 'bg-green-900/30 border-green-500/30'
                                : 'bg-gray-700/50 border-gray-600/30'
                            "
                          >
                            <div class="flex items-center justify-between mb-1">
                              <div class="flex items-center space-x-2">
                                <span class="text-lg">{{
                                  achievement.unlocked ? '✅' : '🔒'
                                }}</span>
                                <div>
                                  <div
                                    class="text-xs font-medium"
                                    :class="
                                      achievement.unlocked ? 'text-green-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-green-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{ achievement.unlocked ? achievement.maxProgress : Math.min(achievement.progress, achievement.maxProgress) }} / {{ achievement.maxProgress }}</span
                                >
                              </div>
                              <div class="bg-gray-700 rounded-full h-2">
                                <div
                                  class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                                  :style="{
                                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                                  }"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Special Achievements -->
                      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <h3 class="text-sm font-bold text-purple-400 mb-2">
                          ⭐ Special Achievements
                        </h3>
                        <div class="space-y-2">
                          <div
                            v-for="achievement in specialAchievements"
                            :key="achievement.id"
                            class="p-2 rounded border"
                            :class="
                              achievement.unlocked
                                ? 'bg-green-900/30 border-green-500/30'
                                : 'bg-gray-700/50 border-gray-600/30'
                            "
                          >
                            <div class="flex items-center justify-between mb-1">
                              <div class="flex items-center space-x-2">
                                <span class="text-lg">{{
                                  achievement.unlocked ? '✅' : '🔒'
                                }}</span>
                                <div>
                                  <div
                                    class="text-xs font-medium"
                                    :class="
                                      achievement.unlocked ? 'text-green-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-green-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{ achievement.unlocked ? achievement.maxProgress : Math.min(achievement.progress, achievement.maxProgress) }} / {{ achievement.maxProgress }}</span
                                >
                              </div>
                              <div class="bg-gray-700 rounded-full h-2">
                                <div
                                  class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                  :style="{
                                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                                  }"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Recent Unlocks -->
                    <div
                      v-if="recentUnlocks.length > 0"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
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
                              <div class="text-xs font-medium text-green-300">
                                {{ unlock.name }}
                              </div>
                              <div class="text-xs text-gray-400">{{ unlock.description }}</div>
                            </div>
                          </div>
                          <div class="text-xs text-green-400 font-bold">+{{ unlock.reward }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- NFT Rewards Info -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-400 mb-2">🏅 Achievement Rewards</h3>
                      <p class="text-xs text-gray-400 mb-3">
                        Unlocked achievements grant SPIRAL token rewards. Each achievement
                        represents a milestone in your racing journey.
                        <span class="text-green-400 font-bold"
                          >Achievements are automatically tracked and rewarded!</span
                        >
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Statistics Tab -->
                <div v-if="showStatisticsTab" class="p-6 space-y-4">
                  <div v-if="loadingPlayerStatistics" class="text-center py-6">
                    <div
                      class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"
                    />
                    <p class="text-gray-400 mt-1 text-sm">Loading player statistics...</p>
                  </div>

                  <div v-else-if="!playerStats" class="text-center py-6">
                    <p class="text-gray-400 text-sm">No player statistics available</p>
                  </div>

                  <div v-else class="space-y-4">
                    <!-- Player Info -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <h3 class="text-sm font-bold text-purple-300 mb-3">👤 Player Information</h3>
                      <div class="flex items-center gap-4">
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                          <div
                            class="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-purple-400/30 overflow-hidden"
                            :class="getAvatarClass(localAvatarId)"
                          >
                            <img
                              v-if="localAvatarId !== undefined && localAvatarId < 255"
                              :src="`/avatars/${localAvatarId}.webp`"
                              :alt="`Avatar ${localAvatarId}`"
                              class="w-full h-full rounded-full object-cover"
                              @error="handleAvatarError"
                            >
                            <img
                              v-else
                              src="/avatars/null.webp"
                              alt="No Avatar"
                              class="w-full h-full rounded-full object-cover"
                            >
                          </div>
                        </div>

                        <!-- User Details -->
                        <div class="flex-1 min-w-0">
                          <div class="flex flex-col md:flex-row md:justify-between h-full">
                            <!-- Left Side: Username and Address (centered with avatar) -->
                            <div class="flex flex-col justify-center">
                              <!-- Username -->
                              <div v-if="hasUsername" class="text-purple-400 font-semibold text-lg mb-1">
                                {{ playerUsername }}
                              </div>
                              <div v-else class="text-gray-500 font-semibold text-lg mb-1">
                                Anonymous
                              </div>
                              
                              <!-- Address -->
                              <div class="flex items-center space-x-2">
                                <span class="text-cyan-400 font-mono text-sm opacity-80">
                                  {{ shortDisplayAddress }}
                                </span>
                                <button
                                  class="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                                  title="Copy full address"
                                  @click="copyAddress"
                                >
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <!-- Right Side: Balance, Explorer -->
                            <div class="flex flex-col justify-center">
                              <!-- Current Balance -->
                              <div class="text-lg font-bold text-green-400 mb-2">
                                <SpiralToken
                                  :amount="currentBalance"
                                  color="green"
                                  size="lg"
                                />
                              </div>

                              <!-- Explorer -->
                              <div class="text-sm">
                                <button
                                  class="flex items-center space-x-2 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors px-2 py-1 rounded"
                                  @click="viewOnExplorer"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                  <span>View on Explorer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Basic Statistics -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-300 mb-2">📊 Basic Statistics</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Races</div>
                          <div class="text-white font-bold text-lg">
                            {{ playerStats.totalRaces }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Winnings</div>
                          <div class="text-green-400 font-bold text-lg">
                            <SpiralToken
                              :amount="playerStats.totalWinnings"
                              color="green"
                              size="lg"
                            />
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Biggest Win</div>
                          <div class="text-yellow-400 font-bold text-lg">
                            <SpiralToken
                              :amount="playerStats.biggestWin"
                              color="yellow"
                              size="lg"
                            />
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Achievement Rewards</div>
                          <div class="text-purple-400 font-bold text-lg">
                            <SpiralToken
                              :amount="playerStats.achievementRewards"
                              color="purple"
                              size="lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Ship Performance -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-300 mb-2">🚀 Ship Performance</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div
                          v-for="(wins, shipId) in playerStats.spaceshipWins"
                          :key="shipId"
                          class="text-center p-2 bg-gray-700 rounded"
                        >
                          <img
                            :src="`/ships/${getShipImageName(getShipNameById(parseInt(shipId.toString())))}.webp`"
                            :alt="getShipNameById(parseInt(shipId.toString()))"
                            class="w-6 h-6 object-contain mx-auto mb-1"
                          >
                          <div class="text-gray-400 text-xs">
                            {{ getShipNameById(parseInt(shipId.toString())) }}
                          </div>
                          <div class="text-white font-bold text-sm">{{ wins }} wins</div>
                        </div>
                      </div>
                    </div>

                    <!-- Achievements -->
                    <div
                      v-if="achievementCount > 0"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
                        🏆 Achievements
                        <span
                          class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded"
                        >
                          {{ achievementCount }} Total
                        </span>
                      </h3>
                      <p class="text-gray-400 text-xs">
                        You have unlocked {{ achievementCount }} achievements! Check your wallet for
                        NFT rewards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Footer -->
          <div
            class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-purple-500/20"
          >
            <div class="flex justify-center">
              <button
                class="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-purple-400/25 transition-all duration-200 transform hover:scale-102"
                @click="$emit('close')"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>👤</span>
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
  import { computed, watch, ref } from 'vue'
  import { useBetting } from '~/composables/useBetting'
  import { useShips } from '~/composables/useShips'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useAchievements } from '~/composables/useAchievements'
  import SpiralToken from './SpiralToken.vue'
  import { CHAOS_FACTORS, SHIPS_ROSTER } from '~/composables/useShips'

  // Props
  interface Props {
    show: boolean
    targetAddress?: string // New prop to specify which user's profile to show
  }

  const props = defineProps<Props>()

  // Emits
  const emit = defineEmits<{
    close: []
    openUsernameRegistration: []
  }>()

  // Use the betting composable for statistics functionality
  const {
    // State
    loadingPlayerStatistics,
    playerStats,
    achievementCount,

    // Methods
    openPlayerStatistics,
    getShipNameById,

    // Web3 state
    isConnected,
    shortAddress,
    formattedSpiralBalance,

    // Match History state
    matchHistory,
    loadingMatchHistory,

    // Match History methods
    formatDate,
    getPlacementText,
    getPlacementColor,
  } = useBetting()

  // Get additional methods from useWeb3
  const {
    getPlayerStats,
    getSpaceshipBetCount,
    spaceshipPlacementCount,
    getPlayerMatchHistory,
    getSpiralBalance,
    account,
  } = useWeb3()

  // Use the unified ships composable
  const { getShipImageName, getShipIdByName } = useShips()

  // Use Web3 for additional user data
  const {
    walletType: web3WalletType,
    network,
    playerHasUsername,
    getUsername,
    getPlayerAvatar,
  } = useWeb3()

  // Use the achievements composable
  const {
    // State
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
  } = useAchievements()

  // Local state for user data (same as UserProfileHeader)
  const localUsername = ref('')
  const localAvatarId = ref(255)
  const hasUsername = ref(false)
  const isLoadingUsername = ref(false)
  const targetUserBalance = ref('0')

  // Tab state
  const activeTab = ref('profile')

  // Computed properties for tab visibility
  const showProfileTab = computed(() => activeTab.value === 'profile')
  const showMatchHistoryTab = computed(() => activeTab.value === 'match-history')
  const showAchievementsTab = computed(() => activeTab.value === 'achievements')
  const showStatisticsTab = computed(() => activeTab.value === 'statistics')

  // Computed property to determine which address to use
  const targetUserAddress = computed(() => {
    return props.targetAddress || account.value
  })

  // Computed property to check if we're viewing our own profile
  const isOwnProfile = computed(() => {
    return !props.targetAddress || props.targetAddress === account.value
  })

  // Load statistics when modal opens
  const loadStatistics = () => {
    console.log('Loading statistics for:', targetUserAddress.value, 'show:', props.show)
    if (props.show && isConnected.value && targetUserAddress.value) {
      // Load statistics for the target user
      loadPlayerStatisticsForTarget()
      loadUserData()

      // Load MatchHistory and Achievements in background
      loadMatchHistoryInBackground()
      loadAchievementsInBackground()
    }
  }

  // Watch for show prop changes to load data
  watch(
    () => props.show,
    newShow => {
      if (newShow) {
        loadStatistics()
      } else {
        // Reset cache flags when modal closes
        matchHistoryLoaded.value = false
        achievementsLoaded.value = false
        // Clear data when modal closes
        matchHistory.value = []
        allAchievements.value = []
        unlockedAchievements.value = []
        recentUnlocks.value = []
        localUsername.value = ''
        localAvatarId.value = 255
        hasUsername.value = false
        // Reset tab to profile
        activeTab.value = 'profile'
      }
    }
  )

  // Watch for targetAddress changes to reload data
  watch(
    () => props.targetAddress,
    (newAddress) => {
      console.log('Target address changed to:', newAddress)
      if (props.show && isConnected.value) {
        // Reset cache flags when target changes
        matchHistoryLoaded.value = false
        achievementsLoaded.value = false
        loadStatistics()
      }
    }
  )

  // Cache flags to prevent unnecessary re-loading
  const matchHistoryLoaded = ref(false)
  const achievementsLoaded = ref(false)

  // Initial loading states to prevent flash
  const initialMatchHistoryLoading = ref(false)
  const initialAchievementsLoading = ref(false)

  // Watch for tab changes to trigger component loading (only if not already loaded)
  watch(activeTab, newTab => {
    if (newTab === 'match-history' && !matchHistoryLoaded.value) {
      // Set initial loading state to prevent flash
      initialMatchHistoryLoading.value = true
      // Trigger MatchHistory loading only if not already loaded
      loadMatchHistory()
      matchHistoryLoaded.value = true
    }
    if (newTab === 'achievements' && !achievementsLoaded.value) {
      // Set initial loading state to prevent flash
      initialAchievementsLoading.value = true
      // Trigger Achievements loading only if not already loaded
      loadAchievements()
      achievementsLoaded.value = true
    }
  })

  // Watch for connection state changes
  watch(
    () => isConnected.value,
    connected => {
      if (connected && props.show) {
        loadUserData()
      }
    }
  )

  // Load user data when connected (same logic as UserProfileHeader)
  const loadUserData = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    isLoadingUsername.value = true
    try {
      // Check if user has username
      const hasUsernameCheck = await playerHasUsername(targetUserAddress.value)
      hasUsername.value = hasUsernameCheck

      if (hasUsernameCheck) {
        localUsername.value = await getUsername(targetUserAddress.value) || ''
        localAvatarId.value = await getPlayerAvatar(targetUserAddress.value) || 255
      }

      // Load target user's balance
      if (!isOwnProfile.value) {
        const balance = await getSpiralBalance(targetUserAddress.value)
        targetUserBalance.value = balance
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      hasUsername.value = false
    } finally {
      isLoadingUsername.value = false
    }
  }

  // Load player statistics for target user
  const loadPlayerStatisticsForTarget = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    try {
      loadingPlayerStatistics.value = true
      const stats = await getPlayerStats(targetUserAddress.value)
      if (stats) {
        // Update the playerStats in the betting composable
        playerStats.value = {
          totalRaces: parseInt(stats.totalRaces),
          totalWinnings: stats.totalWinnings,
          biggestWin: stats.biggestWin,
          highestJackpotTier: parseInt(stats.highestJackpotTier),
          achievementRewards: stats.achievementRewards,
          spaceshipWins: stats.spaceshipWins,
        }
      }
    } catch (error) {
      console.error('Failed to load player statistics for target:', error)
    } finally {
      loadingPlayerStatistics.value = false
    }
  }

  // Computed properties
  const networkDisplay = computed(() => {
    // All users are on Somnia network
    return 'Network: Somnia'
  })

  const playerAvatar = computed(() => {
    return localAvatarId.value !== 255 ? localAvatarId.value : 0
  })

  const playerUsername = computed(() => {
    return localUsername.value || 'Anon'
  })

  // Computed property for the address to display
  const displayAddress = computed(() => {
    return targetUserAddress.value || ''
  })

  // Computed property for short address
  const shortDisplayAddress = computed(() => {
    const addr = displayAddress.value
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  })

  // Computed property for current balance (show for all users)
  const currentBalance = computed(() => {
    // Use target user's balance if available, otherwise use current user's balance
    const amount = isOwnProfile.value 
      ? formattedSpiralBalance.value.replace(' SPIRAL', '')
      : targetUserBalance.value

    const num = parseFloat(amount)
    if (isNaN(num)) return '0'

    // Use K/M notation for numbers >= 10,000
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 10000) {
      return (num / 1000).toFixed(2) + 'K'
    } else {
      // For smaller numbers, use regular formatting with 2 decimal places
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  })

  // Methods
  const getAvatarClass = (avatarId: number) => {
    if (avatarId === 255) return 'bg-gray-600'
    return 'bg-gradient-to-br from-purple-400 to-blue-500'
  }

  const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
    img.nextElementSibling?.classList.remove('hidden')
  }

  const openUsernameRegistration = () => {
    emit('openUsernameRegistration')
  }

  const viewOnExplorer = () => {
    const address = displayAddress.value
    if (!address) return

    // Always use Somnia explorer
    const explorerUrl = `https://shannon-explorer.somnia.network/address/${address}`
    window.open(explorerUrl, '_blank')
  }

  const copyAddress = async () => {
    const address = displayAddress.value
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      // You could add a toast notification here if you have one
      console.log('Address copied to clipboard')
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const handleClose = () => {
    // Clear data when closing
    matchHistory.value = []
    allAchievements.value = []
    unlockedAchievements.value = []
    recentUnlocks.value = []
    localUsername.value = ''
    localAvatarId.value = 255
    hasUsername.value = false
    activeTab.value = 'profile'
    emit('close')
  }

  // Get loading stage text for achievements
  const getLoadingStageText = () => {
    switch (loadingStage.value) {
      case 'definitions':
        return 'Loading achievement definitions...'
      case 'player-stats':
        return 'Loading player statistics...'
      case 'bet-counts':
        return 'Loading betting history...'
      case 'placement-counts':
        return 'Loading race results...'
      default:
        return 'Loading achievements...'
    }
  }

  // Get chaos factor name for a ship
  const getChaosFactorName = (shipName: string): string => {
    const shipId = getShipIdByName(shipName)
    if (shipId === -1) return 'Unknown'
    
    const ship = SHIPS_ROSTER.find(s => s.id === shipId)
    return ship?.chaosFactor || 'Unknown'
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
        return 'Jackpot'
    }
  }

  // View race on explorer
  const viewTransactionOnExplorer = (raceId: number) => {
    if (!raceId) return
    
    // Since we don't have transaction hashes for historical matches,
    // we'll link to the contract address on the explorer
    const explorerUrl = `https://shannon-explorer.somnia.network/address/0xBcCceA0458563b7eCB4532547A19074a9b1A255E`
    window.open(explorerUrl, '_blank')
  }

  // Load MatchHistory data
  const loadMatchHistory = async (forceRefresh = false) => {
    if (!isConnected.value || !targetUserAddress.value) return

    // If not forcing refresh and already loaded, skip
    if (!forceRefresh && matchHistoryLoaded.value) return

    try {
      loadingMatchHistory.value = true
      const { matches } = await getPlayerMatchHistory(targetUserAddress.value, 0, 20)
      matchHistory.value = matches
      matchHistoryLoaded.value = true
    } catch (error) {
      console.error('Failed to load match history:', error)
      matchHistory.value = []
    } finally {
      loadingMatchHistory.value = false
      initialMatchHistoryLoading.value = false
    }
  }

  // Load Achievements data
  const loadAchievements = async (forceRefresh = false) => {
    if (!isConnected.value || !account.value) return

    // If not forcing refresh and already loaded, skip
    if (!forceRefresh && achievementsLoaded.value) return

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
      const stats = await getPlayerStats(targetUserAddress.value)
      if (!stats) return

      // Update milestone and special achievements immediately
      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Milestone' && achievement.id.includes('races')) {
          achievement.progress = parseInt(stats.totalRaces)
          achievement.unlocked = parseInt(stats.totalRaces) >= achievement.threshold
        } else if (achievement.type === 'Special') {
          if (achievement.id.includes('winnings')) {
            achievement.progress = Math.floor(parseFloat(stats.totalWinnings))
            achievement.unlocked =
              Math.floor(parseFloat(stats.totalWinnings)) >= achievement.threshold
          } else if (achievement.id.includes('jackpot')) {
            achievement.progress = parseInt(stats.highestJackpotTier)
            achievement.unlocked = parseInt(stats.highestJackpotTier) >= achievement.threshold
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
        getSpaceshipBetCount(targetUserAddress.value, i).catch(() => 0)
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
          const shipId = achievement.shipId
          if (shipId !== undefined) {
            placementPromises.push(
              spaceshipPlacementCount(account.value!, shipId, placement)
                .then(count => ({ key: `${shipId}-${placement}`, count }))
                .catch(() => ({ key: `${shipId}-${placement}`, count: 0 }))
            )
          }
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
          const shipId = achievement.shipId
          if (shipId !== undefined) {
            const key = `${shipId}-${placement}`
            achievement.progress = placementCounts[key] || 0
            achievement.unlocked = (placementCounts[key] || 0) >= achievement.threshold
          }
        }
      }

      // Final UI update
      unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
      recentUnlocks.value = unlockedAchievements.value.slice(-5)

      console.log('✅ All stages completed')
      loadingStage.value = 'none'
      stageProgress.value = 0
      achievementsLoaded.value = true
    } catch (error) {
      console.error('Failed to load achievements staged:', error)
    } finally {
      loadingAchievements.value = false
      initialAchievementsLoading.value = false
    }
  }

  // Define all available achievements based on contract logic
  const defineAllAchievements = (): Array<{
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
  }> => {
    const achievements: Array<{
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
    }> = []
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
        name: `Resilient Challenger of ${shipName}`,
        description: `Show your determination with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 5,
        reward: 100,
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        progressText: `Win 2nd place with ${shipName} 5 times`,
      })

      achievements.push({
        id: `placement-${shipId}-3-3`,
        name: `Steady Competitor of ${shipName}`,
        description: `Prove your consistency with ${shipName}`,
        type: 'Placement',
        shipId,
        threshold: 3,
        reward: 75,
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        progressText: `Win 3rd place with ${shipName} 3 times`,
      })
    })

    // Milestone achievements
    achievements.push({
      id: 'milestone-races-10',
      name: 'Novice Racer',
      description: 'Begin your cosmic journey',
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

  // Background loading functions (no loading states, silent loading)
  const loadMatchHistoryInBackground = async () => {
    if (!isConnected.value || !targetUserAddress.value || matchHistoryLoaded.value) return

    try {
      const { matches } = await getPlayerMatchHistory(targetUserAddress.value, 0, 20)
      matchHistory.value = matches
      matchHistoryLoaded.value = true
    } catch (error) {
      console.error('Failed to load match history in background:', error)
      matchHistory.value = []
    }
  }

  const loadAchievementsInBackground = async () => {
    if (!isConnected.value || !targetUserAddress.value || achievementsLoaded.value) return

    try {
      // Stage 1: Load achievement definitions (instant)
      allAchievements.value = defineAllAchievements()

      // Stage 2: Load player stats (1 call)
      const stats = await getPlayerStats(targetUserAddress.value)
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

      // Stage 3: Load bet counts in parallel (8 calls)
      const betCountPromises = Array.from({ length: 8 }, (_, i) =>
        getSpaceshipBetCount(targetUserAddress.value, i).catch(() => 0)
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

      // Stage 4: Load placement counts in parallel
      const placementPromises: Promise<{ key: string; count: number }>[] = []

      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Placement' && achievement.shipId !== undefined) {
          const parts = achievement.id.split('-')
          const placement = parseInt(parts[2])
          const shipId = achievement.shipId
          if (shipId !== undefined) {
            placementPromises.push(
              spaceshipPlacementCount(targetUserAddress.value, shipId, placement)
                .then(count => ({ key: `${shipId}-${placement}`, count }))
                .catch(() => ({ key: `${shipId}-${placement}`, count: 0 }))
            )
          }
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
          const shipId = achievement.shipId
          if (shipId !== undefined) {
            const key = `${shipId}-${placement}`
            achievement.progress = placementCounts[key] || 0
            achievement.unlocked = (placementCounts[key] || 0) >= achievement.threshold
          }
        }
      }

      // Final UI update
      unlockedAchievements.value = allAchievements.value.filter(a => a.unlocked)
      recentUnlocks.value = unlockedAchievements.value.slice(-5)
      achievementsLoaded.value = true
    } catch (error) {
      console.error('Failed to load achievements in background:', error)
    }
  }
</script>
