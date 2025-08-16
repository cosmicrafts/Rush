<template>
  <div>
    <!-- User Profile Modal -->
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
        <div class="modal-container modal-container-xl flex flex-col">
          <!-- Modal Header -->
          <div class="modal-header flex-shrink-0">
            <div class="modal-header-container">
              <div class="modal-header-title">
                <Icon name="tdesign:user-1-filled" class="modal-header-icon" />
                <h2 class="modal-header-text-gradient">User Profile</h2>
              </div>
              <button class="modal-close-btn" @click="handleClose">
                ×
              </button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="flex border-b border-purple-500/20 bg-gray-800/50 flex-shrink-0">
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
                showNFTsTab
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              "
              @click="activeTab = 'nfts'"
            >
              🏆 NFTs
            </button>
          </div>

          <!-- Content Area -->
          <div class="modal-content custom-scrollbar flex-1">
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
                            />
                            <img
                              v-else
                              src="/avatars/null.webp"
                              alt="No Avatar"
                              class="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </div>

                        <!-- User Details -->
                        <div class="flex-1 min-w-0">
                          <div class="flex flex-col md:flex-row md:justify-between h-full">
                            <!-- Left Side: Username and Address (centered with avatar) -->
                            <div class="flex flex-col justify-center">
                              <!-- Username -->
                              <div
                                v-if="hasUsername"
                                class="text-purple-400 font-semibold text-xl mb-1"
                              >
                                {{ playerUsername }}
                              </div>
                              <div v-else class="text-gray-500 font-semibold text-xl mb-1">
                                Anonymous
                              </div>

                              <!-- Address -->
                              <div class="flex items-center space-x-2">
                                <span class="text-cyan-400 text-sm opacity-80">
                                  {{ shortDisplayAddress }}
                                </span>
                                <button
                                  class="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                                  title="Copy full address"
                                  @click="copyAddress"
                                >
                                  <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
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
                              <div class="text-lg font-bold text-emerald-400 mb-2">
                                <SpiralToken :amount="currentBalance" color="emerald" size="lg" />
                              </div>

                              <!-- Explorer -->
                              <div class="text-sm">
                                <button
                                  class="flex items-center space-x-2 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors px-2 py-1 rounded"
                                  @click="viewOnExplorer"
                                >
                                  <Icon name="akar-icons:link-out" class="w-4 h-4" />
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
                          <div class="text-emerald-400 font-bold text-lg">
                            <SpiralToken
                              :amount="playerStats.totalWinnings"
                              color="emerald"
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

                    <!-- Jackpot & Performance Stats -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-300 mb-2">
                        🎰 Jackpot & Performance
                      </h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Highest Jackpot</div>
                          <div class="text-amber-400 font-bold text-lg">
                            {{ getJackpotName(playerStats.highestJackpotTier) }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Jackpots Won</div>
                          <div class="text-yellow-400 font-bold text-lg">
                            <SpiralToken
                              :amount="leaderboardStats?.totalJackpots || '0'"
                              color="yellow"
                              size="lg"
                            />
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">1st Place Wins</div>
                          <div class="text-emerald-400 font-bold text-lg">
                            {{ getTotalWins() }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Win Rate</div>
                          <div class="text-cyan-400 font-bold text-lg">{{ getWinRate() }}%</div>
                        </div>
                      </div>
                    </div>

                    <!-- Betting Summary -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-300 mb-2">🎲 Betting Summary</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Bets</div>
                          <div class="text-white font-bold text-lg">
                            {{ getTotalBets() }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Win Rate</div>
                          <div class="text-emerald-400 font-bold text-lg">{{ getWinRate() }}%</div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Avg Win</div>
                          <div class="text-sky-400 font-bold text-lg">
                            <SpiralToken :amount="getAverageWin()" color="sky" size="lg" />
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">ROI</div>
                          <div class="text-purple-400 font-bold text-lg">{{ getROI() }}%</div>
                        </div>
                      </div>
                    </div>

                    <!-- Comprehensive Stats -->
                    <div
                      v-if="comprehensiveStats"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2">📊 Comprehensive Stats</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">1st Place</div>
                          <div class="text-yellow-400 font-bold text-lg">
                            {{ comprehensiveStats.firstPlaceCount }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">2nd Place</div>
                          <div class="text-gray-300 font-bold text-lg">
                            {{ comprehensiveStats.secondPlaceCount }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">3rd Place</div>
                          <div class="text-amber-600 font-bold text-lg">
                            {{ comprehensiveStats.thirdPlaceCount }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">4th Place</div>
                          <div class="text-gray-400 font-bold text-lg">
                            {{ comprehensiveStats.fourthPlaceCount }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Leaderboard Stats -->
                    <div
                      v-if="leaderboardStats"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2">🏆 Leaderboard Stats</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Rank</div>
                          <div class="text-cyan-400 font-bold text-lg">
                            {{
                              leaderboardStats.totalWinningsRank > 0
                                ? `#${leaderboardStats.totalWinningsRank}`
                                : 'Unranked'
                            }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Jackpots</div>
                          <div class="text-yellow-400 font-bold text-lg">
                            <SpiralToken
                              :amount="leaderboardStats.totalJackpots"
                              color="yellow"
                              size="lg"
                            />
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Achievements</div>
                          <div class="text-purple-400 font-bold text-lg">
                            {{ leaderboardStats.totalAchievements }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Finishes</div>
                          <div class="text-emerald-400 font-bold text-lg">
                            {{
                              leaderboardStats.firstPlaceCount +
                              leaderboardStats.secondPlaceCount +
                              leaderboardStats.thirdPlaceCount +
                              leaderboardStats.fourthPlaceCount
                            }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Betting History -->
                    <div
                      v-if="bettingHistory"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2">📈 Betting History</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Total Bets</div>
                          <div class="text-white font-bold text-lg">
                            {{ bettingHistory.totalBets }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">1st Place Wins</div>
                          <div class="text-emerald-400 font-bold text-lg">
                            {{ bettingHistory.totalWins }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Last Race</div>
                          <div class="text-gray-300 font-bold text-sm">
                            {{
                              bettingHistory.lastRaceTime
                                ? formatDate(new Date(bettingHistory.lastRaceTime * 1000))
                                : 'Never'
                            }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-gray-400 text-xs">Jackpots Won</div>
                          <div class="text-yellow-400 font-bold text-lg">
                            <SpiralToken
                              :amount="bettingHistory.totalJackpotsWon"
                              color="yellow"
                              size="lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Ship Performance -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-300 mb-2">🚀 Ship Performance</h3>

                      <!-- Loading State -->
                      <div v-if="loadingShipPlacements" class="text-center py-4">
                        <div
                          class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"
                        />
                        <p class="text-gray-400 mt-2 text-sm">Loading ship performance data...</p>
                      </div>

                      <!-- Ship Performance Data -->
                      <div v-else class="space-y-3">
                        <div
                          v-for="(wins, shipId) in playerStats.spaceshipWins"
                          :key="shipId"
                          class="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg"
                        >
                          <!-- Ship Image and Name -->
                          <div class="flex items-center space-x-3 flex-shrink-0 w-48">
                            <img
                              :src="`/ships/${getShipImageName(getShipNameById(parseInt(shipId.toString())))}.webp`"
                              :alt="getShipNameById(parseInt(shipId.toString()))"
                              class="w-12 h-12 object-contain"
                            />
                            <div class="flex-1 min-w-0">
                              <div class="text-white font-semibold text-sm truncate">
                                {{ getShipNameById(parseInt(shipId.toString())) }}
                              </div>
                              <div class="text-gray-400 text-xs">
                                {{
                                  getShipPlacementCount(parseInt(shipId.toString()), 1) +
                                  getShipPlacementCount(parseInt(shipId.toString()), 2) +
                                  getShipPlacementCount(parseInt(shipId.toString()), 3)
                                }}
                                total finishes
                              </div>
                            </div>
                          </div>

                          <!-- Placement Stats -->
                          <div class="flex-1 grid grid-cols-3 gap-4">
                            <!-- 1st Place -->
                            <div class="text-center">
                              <div class="text-yellow-400 font-bold text-lg">
                                {{ getShipPlacementCount(parseInt(shipId.toString()), 1) }}
                              </div>
                              <div class="text-gray-400 text-xs">1st Place</div>
                            </div>
                            <!-- 2nd Place -->
                            <div class="text-center">
                              <div class="text-gray-300 font-bold text-lg">
                                {{ getShipPlacementCount(parseInt(shipId.toString()), 2) }}
                              </div>
                              <div class="text-gray-400 text-xs">2nd Place</div>
                            </div>
                            <!-- 3rd Place -->
                            <div class="text-center">
                              <div class="text-amber-600 font-bold text-lg">
                                {{ getShipPlacementCount(parseInt(shipId.toString()), 3) }}
                              </div>
                              <div class="text-gray-400 text-xs">3rd Place</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Achievements Summary -->
                    <div
                      v-if="targetUserAchievementCount > 0 || loadingTargetUserAchievements"
                      class="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    >
                      <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
                        🏆 Achievements
                        <span
                          v-if="!loadingTargetUserAchievements"
                          class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded"
                        >
                          {{ targetUserAchievementCount }} Total
                        </span>
                        <span
                          v-else
                          class="ml-auto text-xs bg-gray-600 text-gray-100 px-2 py-1 rounded"
                        >
                          Loading...
                        </span>
                      </h3>
                      <p class="text-gray-400 text-xs">
                        {{ isOwnProfile ? 'You have' : 'This user has' }} unlocked
                        {{ targetUserAchievementCount }} achievements! Check
                        {{ isOwnProfile ? 'your' : 'their' }} wallet for NFT rewards.
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
                        </div>

                        <!-- Right side: Jackpot (if applicable) and Net P&L -->
                        <div class="flex items-center gap-4">
                          <!-- Jackpot Info (if applicable) -->
                          <div
                            v-if="match.jackpotTier > 0"
                            class="flex items-center space-x-2 bg-amber-900/30 border border-amber-500/30 rounded-lg px-3 py-2"
                          >
                            <img
                              :src="getJackpotImage(match.jackpotTier)"
                              :alt="getJackpotName(match.jackpotTier)"
                              class="w-12 h-12 object-contain flex-shrink-0"
                            />
                            <div class="flex flex-col">
                              <span class="text-amber-400 font-semibold text-sm">{{
                                getJackpotName(match.jackpotTier)
                              }}</span>
                              <SpiralToken :amount="match.jackpotAmount" color="amber" size="sm" />
                            </div>
                          </div>

                          <!-- Net P&L Display -->
                          <div class="text-right">
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-gray-400">Net P&L:</span>
                              <span
                                :class="
                                  parseFloat(match.payout) + parseFloat(match.jackpotAmount) >
                                  parseFloat(match.betAmount)
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                "
                                class="text-lg font-bold"
                              >
                                {{
                                  parseFloat(match.payout) + parseFloat(match.jackpotAmount) >
                                  parseFloat(match.betAmount)
                                    ? '+'
                                    : ''
                                }}{{
                                  (
                                    parseFloat(match.payout) +
                                    parseFloat(match.jackpotAmount) -
                                    parseFloat(match.betAmount)
                                  ).toFixed(4)
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
                            />
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
                              :color="match.payout > match.betAmount ? 'emerald' : 'red'"
                              size="md"
                            />
                          </div>
                        </div>

                        <!-- Race Results -->
                        <div class="flex items-center space-x-6">
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Position</span>
                            <span
                              :class="getPlacementColor(match.placement)"
                              class="font-bold text-lg"
                            >
                              {{ getPlacementText(match.placement) }}
                            </span>
                          </div>
                          <div class="flex flex-col items-center">
                            <span class="text-gray-400 text-xs mb-1">Total Winnings</span>
                            <SpiralToken
                              :amount="parseFloat(match.payout) + parseFloat(match.jackpotAmount)"
                              :color="
                                parseFloat(match.payout) + parseFloat(match.jackpotAmount) >
                                parseFloat(match.betAmount)
                                  ? 'emerald'
                                  : 'red'
                              "
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
                                parseFloat(match.payout) + parseFloat(match.jackpotAmount) >
                                parseFloat(match.betAmount)
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              "
                              class="font-bold text-sm"
                            >
                              {{
                                (
                                  ((parseFloat(match.payout) +
                                    parseFloat(match.jackpotAmount) -
                                    parseFloat(match.betAmount)) /
                                    parseFloat(match.betAmount)) *
                                  100
                                ).toFixed(1)
                              }}%
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
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400" />
                      <p class="text-emerald-400 text-xs">Refreshing in background...</p>
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
                                ? 'bg-emerald-900/30 border-emerald-500/30'
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
                                      achievement.unlocked ? 'text-emerald-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-emerald-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{
                                    achievement.unlocked
                                      ? achievement.maxProgress
                                      : Math.min(achievement.progress, achievement.maxProgress)
                                  }}
                                  / {{ achievement.maxProgress }}</span
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
                                ? 'bg-emerald-900/30 border-emerald-500/30'
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
                                      achievement.unlocked ? 'text-emerald-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-emerald-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{
                                    achievement.unlocked
                                      ? achievement.maxProgress
                                      : Math.min(achievement.progress, achievement.maxProgress)
                                  }}
                                  / {{ achievement.maxProgress }}</span
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
                                ? 'bg-emerald-900/30 border-emerald-500/30'
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
                                      achievement.unlocked ? 'text-emerald-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-emerald-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{
                                    achievement.unlocked
                                      ? achievement.maxProgress
                                      : Math.min(achievement.progress, achievement.maxProgress)
                                  }}
                                  / {{ achievement.maxProgress }}</span
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
                                ? 'bg-emerald-900/30 border-emerald-500/30'
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
                                      achievement.unlocked ? 'text-emerald-300' : 'text-gray-300'
                                    "
                                  >
                                    {{ achievement.name }}
                                  </div>
                                  <div class="text-xs text-gray-400">
                                    {{ achievement.progressText }}
                                  </div>
                                </div>
                              </div>
                              <div class="text-xs text-emerald-400 font-bold">
                                +{{ achievement.reward }} SPIRAL
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="mt-2">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{{ achievement.unlocked ? 'Complete' : 'Progress' }}</span>
                                <span
                                  >{{
                                    achievement.unlocked
                                      ? achievement.maxProgress
                                      : Math.min(achievement.progress, achievement.maxProgress)
                                  }}
                                  / {{ achievement.maxProgress }}</span
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
                      <h3 class="text-sm font-bold text-emerald-400 mb-2">🎉 Recent Unlocks</h3>
                      <div class="space-y-2">
                        <div
                          v-for="unlock in recentUnlocks"
                          :key="unlock.id"
                          class="flex items-center justify-between p-2 bg-emerald-900/20 border border-emerald-500/30 rounded"
                        >
                          <div class="flex items-center space-x-2">
                            <span class="text-lg">🎉</span>
                            <div>
                              <div class="text-xs font-medium text-emerald-300">
                                {{ unlock.name }}
                              </div>
                              <div class="text-xs text-gray-400">{{ unlock.description }}</div>
                            </div>
                          </div>
                          <div class="text-xs text-emerald-400 font-bold">+{{ unlock.reward }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- NFT Rewards Info -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <h3 class="text-sm font-bold text-purple-400 mb-2">🏅 Achievement Rewards</h3>
                      <p class="text-xs text-gray-400 mb-3">
                        Unlocked achievements grant SPIRAL token rewards. Each achievement
                        represents a milestone in your racing journey.
                        <span class="text-emerald-400 font-bold"
                          >Achievements are automatically tracked and rewarded!</span
                        >
                      </p>
                    </div>
                  </div>
                </div>

                <!-- NFTs Tab -->
                <div v-if="showNFTsTab" class="p-6 space-y-4 min-h-[400px]">
                  <div
                    v-if="
                      loadingNFTs || initialNFTsLoading || (!nftsLoaded && userNFTs.length === 0)
                    "
                    class="flex items-center justify-center min-h-[300px]"
                  >
                    <div class="text-center">
                      <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"
                      />
                      <p class="text-gray-400 mt-2 text-sm">Loading NFTs...</p>
                    </div>
                  </div>

                  <div v-else-if="nftsLoaded && userNFTs.length === 0" class="text-center py-6">
                    <div class="text-6xl mb-4">🏆</div>
                    <p class="text-gray-400 text-lg mb-2">No NFTs Found</p>
                    <p class="text-gray-500 text-sm">
                      This user hasn't unlocked any achievement NFTs yet.
                    </p>
                  </div>

                  <div v-else-if="nftsLoaded && userNFTs.length > 0" class="space-y-4">
                    <!-- NFT Summary -->
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div class="flex justify-between items-center">
                        <h3 class="text-sm font-bold text-emerald-300">🏆 Achievement NFTs</h3>
                        <div class="text-xs text-gray-400">
                          {{ userNFTs.length }} NFT{{ userNFTs.length !== 1 ? 's' : '' }}
                        </div>
                      </div>
                    </div>

                    <!-- NFT Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div
                        v-for="nft in userNFTs"
                        :key="nft.tokenId"
                        class="relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        :class="getNFTCardClass(nft.achievementType)"
                      >
                        <!-- Background Gradient -->
                        <div
                          class="absolute inset-0 opacity-20"
                          :class="getNFTBackgroundClass(nft.achievementType)"
                        />

                        <!-- Card Content -->
                        <div class="relative p-6">
                          <!-- Header with Token ID and Explorer -->
                          <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-2">
                              <span class="text-2xl">🏆</span>
                              <span class="text-sm font-bold text-white">#{{ nft.tokenId }}</span>
                            </div>
                            <button
                              title="View NFT on explorer"
                              class="flex items-center space-x-1 text-xs text-gray-300 hover:text-cyan-400 transition-colors bg-black/20 px-2 py-1 rounded"
                              @click="viewNFTOnExplorer(nft.tokenId)"
                            >
                              <svg
                                class="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
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

                          <!-- Main Visual Element -->
                          <div class="flex justify-center mb-4">
                            <div class="relative">
                              <!-- Ship Image (for betting/placement achievements) -->
                              <img
                                v-if="
                                  nft.spaceshipId !== '255' &&
                                  (nft.achievementType === 'Betting' ||
                                    nft.achievementType === 'Placement')
                                "
                                :src="`/ships/${getShipImageName(getShipNameById(parseInt(nft.spaceshipId)))}.webp`"
                                :alt="getShipNameById(parseInt(nft.spaceshipId))"
                                class="w-24 h-24 object-contain drop-shadow-lg"
                              />
                              <!-- Jackpot Image (for special jackpot achievements) -->
                              <img
                                v-else-if="
                                  nft.achievementType === 'Special' &&
                                  nft.name.toLowerCase().includes('jackpot')
                                "
                                src="/super-jackpot.webp"
                                alt="Super Jackpot"
                                class="w-24 h-24 object-contain drop-shadow-lg"
                              />
                              <!-- Default Achievement Icon -->
                              <div
                                v-else
                                class="w-24 h-24 flex items-center justify-center text-4xl"
                              >
                                {{ getAchievementIcon(nft.achievementType) }}
                              </div>

                              <!-- Achievement Type Badge -->
                              <div class="absolute -top-2 -right-2">
                                <span
                                  class="text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                                  :class="getAchievementTypeClass(nft.achievementType)"
                                >
                                  {{ nft.achievementType }}
                                </span>
                              </div>
                            </div>
                          </div>

                          <!-- Achievement Info -->
                          <div class="text-center space-y-3">
                            <!-- Name -->
                            <h4 class="text-lg font-bold text-white leading-tight">
                              {{ nft.name }}
                            </h4>

                            <!-- Description -->
                            <p class="text-sm text-gray-300 leading-relaxed">
                              {{ nft.description }}
                            </p>

                            <!-- Threshold (Parsed) -->
                            <div class="bg-black/30 rounded-lg p-3">
                              <div class="text-xs text-gray-400 mb-1">Requirement</div>
                              <div
                                class="text-sm font-bold"
                                :class="getThresholdTextClass(nft.achievementType)"
                              >
                                {{ parseThreshold(nft) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Footer -->
          <div class="modal-footer flex-shrink-0">
            <div class="flex justify-center">
              <button
                class="btn btn-primary"
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
  import { useShips, SHIPS_ROSTER } from '~/composables/useShips'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useAchievements } from '~/composables/useAchievements'
  import { useNotifications } from '~/composables/useNotifications'
  import SpiralToken from './SpiralToken.vue'

  // Props
  interface Props {
    show: boolean
    targetAddress?: string // New prop to specify which user's profile to show
    initialTab?: string // New prop to specify which tab to open initially
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

    // Methods
    getShipNameById,

    // Web3 state
    isConnected,
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
    fetchUserNFTs,
    getPlayerLeaderboardStats,
    getPlayerComprehensiveStats,
    getPlayerLastRaceTime,
  } = useWeb3()

  // Use the unified ships composable
  const { getShipImageName, getShipIdByName } = useShips()

  // Use Web3 for additional user data
  const { playerHasUsername, getUsername, getPlayerAvatar } = useWeb3()

  // Initialize notification system
  const { showSuccess } = useNotifications()

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

  // Achievement count for target user
  const targetUserAchievementCount = ref(0)
  const loadingTargetUserAchievements = ref(false)

  // Local state for user data (same as UserProfileHeader)
  const localUsername = ref('')
  const localAvatarId = ref(255)
  const hasUsername = ref(false)
  const isLoadingUsername = ref(false)
  const targetUserBalance = ref('0')

  // Tab state - respect initialTab immediately
  const activeTab = ref(props.initialTab || 'profile')

  // Computed properties for tab visibility
  const showProfileTab = computed(() => activeTab.value === 'profile')
  const showMatchHistoryTab = computed(() => activeTab.value === 'match-history')
  const showAchievementsTab = computed(() => activeTab.value === 'achievements')
  const showNFTsTab = computed(() => activeTab.value === 'nfts')

  // Computed property to determine which address to use
  const targetUserAddress = computed(() => {
    return props.targetAddress || account.value
  })

  // Computed property to check if we're viewing our own profile
  const isOwnProfile = computed(() => {
    return !props.targetAddress || props.targetAddress === account.value
  })

  // Load statistics when modal opens
  const loadStatistics = async () => {
    if (props.show && isConnected.value && targetUserAddress.value) {
      // Load statistics for the target user
      loadPlayerStatisticsForTarget()
      loadUserData()

      // Load MatchHistory, Achievements, NFTs, Ship Placement Counts, and additional stats in background
      loadMatchHistoryInBackground()
      loadAchievementsInBackground()
      loadNFTsInBackground()
      loadShipPlacementCounts()
      loadComprehensiveStats()
      loadLeaderboardStats()
      loadBettingHistory()

      // Calculate achievement count for target user
      targetUserAchievementCount.value = await calculateUserAchievementCount(
        targetUserAddress.value
      )
    }
  }

  // Watch for show prop changes to load data
  watch(
    () => props.show,
    async newShow => {
      if (newShow) {
        await loadStatistics()
      } else {
        // Reset cache flags when modal closes
        matchHistoryLoaded.value = false
        achievementsLoaded.value = false
        nftsLoaded.value = false
        // Clear data when modal closes
        matchHistory.value = []
        allAchievements.value = []
        unlockedAchievements.value = []
        recentUnlocks.value = []
        userNFTs.value = []
        localUsername.value = ''
        localAvatarId.value = 255
        hasUsername.value = false
        targetUserAchievementCount.value = 0
        // Don't reset tab - let the notification system control it
      }
    }
  )

  // Watch for initialTab prop changes to update active tab
  watch(
    () => props.initialTab,
    newTab => {
      if (newTab) {
        activeTab.value = newTab
      }
    },
    { immediate: true } // Add immediate: true to handle initial value
  )

  // Watch for targetAddress changes to reload data
  watch(
    () => props.targetAddress,
    async _newAddress => {
      if (props.show && isConnected.value) {
        // Reset cache flags when target changes
        matchHistoryLoaded.value = false
        achievementsLoaded.value = false
        nftsLoaded.value = false
        targetUserAchievementCount.value = 0
        await loadStatistics()
      }
    }
  )

  // Watch for initialTab changes to update active tab
  watch(
    () => props.initialTab,
    newTab => {
      if (newTab) {
        activeTab.value = newTab
      }
    },
    { immediate: true } // Add immediate: true to handle initial value
  )

  // Cache flags to prevent unnecessary re-loading
  const matchHistoryLoaded = ref(false)
  const achievementsLoaded = ref(false)
  const nftsLoaded = ref(false)

  // Initial loading states to prevent flash
  const initialMatchHistoryLoading = ref(false)
  const initialAchievementsLoading = ref(false)
  const initialNFTsLoading = ref(false)

  // NFT state
  const userNFTs = ref<
    Array<{
      tokenId: string
      name: string
      description: string
      achievementType: string
      spaceshipId: string
      threshold: string
    }>
  >([])
  const loadingNFTs = ref(false)

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
    if (newTab === 'nfts' && !nftsLoaded.value) {
      // Set initial loading state to prevent flash
      initialNFTsLoading.value = true
      // Trigger NFTs loading only if not already loaded
      loadNFTs()
      nftsLoaded.value = true
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
        localUsername.value = (await getUsername(targetUserAddress.value)) || ''
        localAvatarId.value = (await getPlayerAvatar(targetUserAddress.value)) || 255
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

    // Return the raw number value for SpiralToken component to handle formatting
    return num.toString()
  })

  // Methods
  const getAvatarClass = (avatarId: number) => {
    if (avatarId === 255) return 'bg-gray-600'
    return 'bg-gradient-to-br from-purple-400 to-sky-500'
  }

  const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
    img.nextElementSibling?.classList.remove('hidden')
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
      showSuccess('Address copied!', 'Wallet address copied to clipboard 📋')
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
    userNFTs.value = []
    localUsername.value = ''
    localAvatarId.value = 255
    hasUsername.value = false
    // Don't reset tab - let the notification system control it
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
      allAchievements.value = defineAllAchievements()
      loadingStage.value = 'player-stats'
      stageProgress.value = 2

      // Stage 2: Load player stats (1 call)
      const stats = await getPlayerStats(targetUserAddress.value || '')
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
      const betCountPromises = Array.from({ length: 8 }, (_, i) =>
        getSpaceshipBetCount(targetUserAddress.value || '', i).catch(() => 0)
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
      const placementPromises: Promise<{ key: string; count: number }>[] = []

      for (const achievement of allAchievements.value) {
        if (achievement.type === 'Placement' && achievement.shipId !== undefined) {
          const parts = achievement.id.split('-')
          const placement = parseInt(parts[2] || '0')
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
          const placement = parseInt(parts[2] || '0')
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
        getSpaceshipBetCount(targetUserAddress.value || '', i).catch(() => 0)
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
          const placement = parseInt(parts[2] || '0')
          const shipId = achievement.shipId
          if (shipId !== undefined) {
            placementPromises.push(
              spaceshipPlacementCount(targetUserAddress.value || '', shipId, placement)
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
          const placement = parseInt(parts[2] || '0')
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

  // Load NFTs data
  const loadNFTs = async (forceRefresh = false) => {
    if (!isConnected.value || !targetUserAddress.value) return

    // If not forcing refresh and already loaded, skip
    if (!forceRefresh && nftsLoaded.value) return

    try {
      loadingNFTs.value = true
      const nfts = await fetchUserNFTs(targetUserAddress.value)
      userNFTs.value = nfts
      nftsLoaded.value = true
    } catch (error) {
      console.error('Failed to load NFTs:', error)
      userNFTs.value = []
    } finally {
      loadingNFTs.value = false
      initialNFTsLoading.value = false
    }
  }

  // Load NFTs in background
  const loadNFTsInBackground = async () => {
    if (!isConnected.value || !targetUserAddress.value || nftsLoaded.value) return

    try {
      const nfts = await fetchUserNFTs(targetUserAddress.value)
      userNFTs.value = nfts
      nftsLoaded.value = true
    } catch (error) {
      console.error('Failed to load NFTs in background:', error)
      userNFTs.value = []
    }
  }

  // View NFT on explorer
  const viewNFTOnExplorer = (tokenId: string) => {
    if (!tokenId) return

    const NFT_CONTRACT_ADDRESS = '0x36F7460daaC996639d8F445E29f3BD45C1760d1D'
    const explorerUrl = `https://shannon-explorer.somnia.network/token/${NFT_CONTRACT_ADDRESS}/instance/${tokenId}`
    window.open(explorerUrl, '_blank')
  }

  // Get achievement type class for styling
  const getAchievementTypeClass = (type: string) => {
    switch (type) {
      case 'Betting':
        return 'bg-cyan-600 text-cyan-100'
      case 'Placement':
        return 'bg-pink-600 text-pink-100'
      case 'Milestone':
        return 'bg-yellow-600 text-yellow-100'
      case 'Special':
        return 'bg-purple-600 text-purple-100'
      default:
        return 'bg-gray-600 text-gray-100'
    }
  }

  // Get NFT card styling class
  const getNFTCardClass = (type: string) => {
    switch (type) {
      case 'Betting':
        return 'bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-500/30'
      case 'Placement':
        return 'bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/30'
      case 'Milestone':
        return 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30'
      case 'Special':
        return 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30'
      default:
        return 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-500/30'
    }
  }

  // Get NFT background gradient class
  const getNFTBackgroundClass = (type: string) => {
    switch (type) {
      case 'Betting':
        return 'bg-gradient-to-br from-cyan-500 to-sky-600'
      case 'Placement':
        return 'bg-gradient-to-br from-pink-500 to-red-600'
      case 'Milestone':
        return 'bg-gradient-to-br from-yellow-500 to-orange-600'
      case 'Special':
        return 'bg-gradient-to-br from-purple-500 to-indigo-600'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  // Get achievement icon
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'Betting':
        return '🎲'
      case 'Placement':
        return '🏁'
      case 'Milestone':
        return '🎯'
      case 'Special':
        return '⭐'
      default:
        return '🏆'
    }
  }

  // Parse threshold into readable text
  const parseThreshold = (nft: {
    threshold: string
    spaceshipId: string
    achievementType: string
    name: string
  }) => {
    const threshold = parseInt(nft.threshold) || 0
    const shipName =
      nft.spaceshipId !== '255' && nft.spaceshipId !== '0'
        ? getShipNameById(parseInt(nft.spaceshipId))
        : null

    switch (nft.achievementType) {
      case 'Betting':
        return shipName ? `Bet ${shipName} ${threshold} times` : `Bet ${threshold} times`
      case 'Placement':
        if (nft.name.includes('1st')) {
          return shipName
            ? `Win 1st place with ${shipName} ${threshold} times`
            : `Win 1st place ${threshold} times`
        } else if (nft.name.includes('2nd')) {
          return shipName
            ? `Win 2nd place with ${shipName} ${threshold} times`
            : `Win 2nd place ${threshold} times`
        } else if (nft.name.includes('3rd')) {
          return shipName
            ? `Win 3rd place with ${shipName} ${threshold} times`
            : `Win 3rd place ${threshold} times`
        }
        return shipName ? `Win with ${shipName} ${threshold} times` : `Win ${threshold} times`
      case 'Milestone':
        return `Complete ${threshold} races`
      case 'Special':
        if (nft.name.toLowerCase().includes('jackpot')) {
          return `Hit Super Jackpot ${threshold} times`
        } else if (nft.name.toLowerCase().includes('winnings')) {
          return `Earn ${threshold.toLocaleString()} SPIRAL in winnings`
        }
        return `Reach ${threshold}`
      default:
        return `Reach ${threshold}`
    }
  }

  // Get threshold text color class
  const getThresholdTextClass = (type: string) => {
    switch (type) {
      case 'Betting':
        return 'text-cyan-300'
      case 'Placement':
        return 'text-pink-300'
      case 'Milestone':
        return 'text-yellow-300'
      case 'Special':
        return 'text-purple-300'
      default:
        return 'text-gray-300'
    }
  }

  // Reactive ship placement counts
  const shipPlacementCounts = ref<Record<string, Record<number, number>>>({})
  const loadingShipPlacements = ref(false)

  // Reactive comprehensive stats
  const comprehensiveStats = ref<{
    username: string
    avatarId: number
    totalRaces: number
    totalWinnings: string
    biggestWin: string
    firstPlaceCount: number
    secondPlaceCount: number
    thirdPlaceCount: number
    fourthPlaceCount: number
  } | null>(null)
  const loadingComprehensiveStats = ref(false)

  // Reactive leaderboard stats
  const leaderboardStats = ref<{
    totalWinningsRank: number
    firstPlaceCount: number
    secondPlaceCount: number
    thirdPlaceCount: number
    fourthPlaceCount: number
    totalJackpots: string
    totalAchievements: number
  } | null>(null)
  const loadingLeaderboardStats = ref(false)

  // Reactive betting history
  const bettingHistory = ref<{
    totalBets: number
    totalWins: number
    winRate: number
    averageBet: string
    lastRaceTime: number
    totalJackpotsWon: string
  } | null>(null)
  const loadingBettingHistory = ref(false)

  // Get ship placement count for a specific ship and placement
  const getShipPlacementCount = (shipId: number, placement: number) => {
    const shipKey = shipId.toString()

    if (!shipPlacementCounts.value[shipKey]) {
      return 0
    }

    return shipPlacementCounts.value[shipKey][placement] || 0
  }

  // Load ship placement counts
  const loadShipPlacementCounts = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    try {
      loadingShipPlacements.value = true
      const counts: Record<string, Record<number, number>> = {}
      const address = targetUserAddress.value
      if (!address) return

      // Load placement counts for all ships (0-7) and placements (1-3)
      for (let shipId = 0; shipId < 8; shipId++) {
        counts[shipId.toString()] = {}
        for (let placement = 1; placement <= 3; placement++) {
          const count = await spaceshipPlacementCount(address, shipId, placement)
          const countNum = parseInt(count.toString())
          counts[shipId.toString()][placement] = countNum
        }
      }

      shipPlacementCounts.value = counts
    } catch (error) {
      console.error('Failed to load ship placement counts:', error)
    } finally {
      loadingShipPlacements.value = false
    }
  }

  // Helper functions for betting statistics
  const getTotalBets = () => {
    if (!playerStats.value) return 0
    return playerStats.value.totalRaces || 0
  }

  const getTotalWins = () => {
    if (!playerStats.value) return 0
    // spaceshipWins only tracks 1st place finishes, so sum them up
    return playerStats.value.spaceshipWins.reduce((sum, wins) => sum + parseInt(wins.toString()), 0)
  }

  const getWinRate = () => {
    if (!playerStats.value || !playerStats.value.totalRaces) return 0
    const totalWins = getTotalWins()
    return Math.round((totalWins / playerStats.value.totalRaces) * 100)
  }

  const getAverageWin = () => {
    if (!playerStats.value || !playerStats.value.totalRaces) return '0'
    const totalWins = getTotalWins()
    if (totalWins === 0) return '0'
    const avgWin = parseFloat(playerStats.value.totalWinnings) / totalWins
    return avgWin.toFixed(2)
  }

  const getROI = () => {
    if (!playerStats.value || !playerStats.value.totalRaces) return 0
    // This would need total amount bet to calculate ROI properly
    // For now, return a placeholder
    return 0
  }

  // Load comprehensive stats
  const loadComprehensiveStats = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    try {
      loadingComprehensiveStats.value = true
      const stats = await getPlayerComprehensiveStats(targetUserAddress.value)
      if (stats) {
        comprehensiveStats.value = {
          username: stats.username || '',
          avatarId: parseInt(stats.avatarId?.toString() || '255'),
          totalRaces: parseInt(stats.totalRaces?.toString() || '0'),
          totalWinnings: stats.totalWinnings || '0',
          biggestWin: stats.biggestWin || '0',
          firstPlaceCount: parseInt(stats.firstPlace?.toString() || '0'),
          secondPlaceCount: parseInt(stats.secondPlace?.toString() || '0'),
          thirdPlaceCount: parseInt(stats.thirdPlace?.toString() || '0'),
          fourthPlaceCount: parseInt(stats.fourthPlace?.toString() || '0'),
        }
      }
    } catch (error) {
      console.error('Failed to load comprehensive stats:', error)
    } finally {
      loadingComprehensiveStats.value = false
    }
  }

  // Load leaderboard stats
  const loadLeaderboardStats = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    try {
      loadingLeaderboardStats.value = true
      const stats = await getPlayerLeaderboardStats(targetUserAddress.value)
      leaderboardStats.value = stats
    } catch (error) {
      console.error('Failed to load leaderboard stats:', error)
    } finally {
      loadingLeaderboardStats.value = false
    }
  }

  // Calculate achievement count for any user
  const calculateUserAchievementCount = async (userAddress: string) => {
    if (!isConnected.value || !userAddress) return 0

    try {
      loadingTargetUserAchievements.value = true
      let count = 0

      // Get player stats
      const stats = await getPlayerStats(userAddress)
      if (!stats) return 0

      // Get ship bet counts for all ships
      const betCounts = await Promise.all(
        Array.from({ length: 8 }, (_, i) => getSpaceshipBetCount(userAddress, i))
      )

      // Count betting achievements
      for (let i = 0; i < 8; i++) {
        const betCount = betCounts[i] || 0
        if (betCount >= 5) count++ // The Rising Star
        if (betCount >= 25) count++ // Bearer of the Crest
        if (betCount >= 100) count++ // Eternal Overseer
      }

      // Get placement counts for all ships and placements
      const placementPromises = []
      for (let shipId = 0; shipId < 8; shipId++) {
        for (let placement = 1; placement <= 4; placement++) {
          placementPromises.push(spaceshipPlacementCount(userAddress, shipId, placement))
        }
      }
      const placementCounts = await Promise.all(placementPromises)

      // Count placement achievements
      for (let shipId = 0; shipId < 8; shipId++) {
        const firstPlace = placementCounts[shipId * 4 + 0] || 0
        const secondPlace = placementCounts[shipId * 4 + 1] || 0
        const thirdPlace = placementCounts[shipId * 4 + 2] || 0
        const fourthPlace = placementCounts[shipId * 4 + 3] || 0

        // 1st place achievements
        if (firstPlace >= 3) count++ // Triumphant Warrior
        if (firstPlace >= 10) count++ // Dominant Force

        // 2nd place achievements
        if (secondPlace >= 5) count++ // Guardian-in-Training
        if (secondPlace >= 20) count++ // Keeper of the Code

        // 3rd place achievements
        if (thirdPlace >= 10) count++ // Pathfinder of Peace
        if (thirdPlace >= 50) count++ // Sentinel of Stability

        // 4th place achievements
        if (fourthPlace >= 15) count++ // Harbinger of Harmony
        if (fourthPlace >= 75) count++ // Wielder of the Will
      }

      // Count milestone achievements
      const totalRaces = parseInt(stats.totalRaces)
      if (totalRaces >= 10) count++ // Initiate of the Cosmos
      if (totalRaces >= 50) count++ // Strategist in Training
      if (totalRaces >= 100) count++ // Guardian of the Galaxy

      // Count special achievements
      const totalWinnings = Math.floor(parseFloat(stats.totalWinnings))
      const highestJackpotTier = parseInt(stats.highestJackpotTier)

      if (totalWinnings >= 10000) count++ // Cosmic Conqueror
      if (highestJackpotTier >= 3) count++ // Super Jackpot Hunter

      return count
    } catch (error) {
      console.error('Failed to calculate achievement count:', error)
      return 0
    } finally {
      loadingTargetUserAchievements.value = false
    }
  }

  // Load betting history
  const loadBettingHistory = async () => {
    if (!isConnected.value || !targetUserAddress.value) return

    try {
      loadingBettingHistory.value = true

      // Get ship bet counts for all ships
      const betCounts = await Promise.all(
        Array.from({ length: 8 }, (_, i) => getSpaceshipBetCount(targetUserAddress.value || '', i))
      )
      const totalBets = betCounts.reduce((sum, count) => sum + parseInt(count.toString()), 0)

      // Calculate total wins from comprehensive stats (1st place finishes)
      // If comprehensive stats not loaded yet, fall back to playerStats
      const totalWins =
        comprehensiveStats.value?.firstPlaceCount ||
        playerStats.value?.spaceshipWins.reduce(
          (sum, wins) => sum + parseInt(wins.toString()),
          0
        ) ||
        0

      // Calculate win rate
      const winRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0

      // Get actual jackpot data from leaderboard stats
      const leaderboardData = await getPlayerLeaderboardStats(targetUserAddress.value)
      const totalJackpotsWon = leaderboardData?.totalJackpots || '0'

      // Get last race time from contract
      const lastRaceTime =
        (await getPlayerLastRaceTime(targetUserAddress.value)) || Date.now() / 1000

      // Calculate average bet (placeholder for now - would need total amount bet)
      const averageBet =
        totalBets > 0
          ? (parseFloat(playerStats.value?.totalWinnings || '0') / totalBets).toFixed(2)
          : '0'

      bettingHistory.value = {
        totalBets,
        totalWins,
        winRate,
        averageBet,
        lastRaceTime,
        totalJackpotsWon,
      }
    } catch (error) {
      console.error('Failed to load betting history:', error)
    } finally {
      loadingBettingHistory.value = false
    }
  }
</script>
