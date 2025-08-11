<template>
  <div class="bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 p-4 rounded-sm border border-cyan-500/30 shadow-lg">
    
    <!-- Not Connected Message -->
    <div v-if="!web3IsConnected" class="text-center py-8">
      <div class="text-cyan-400 text-lg mb-2 font-bold">Welcome to RUSH!</div>
    </div>
    
    <!-- Connected User Interface -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Column: Player Info -->
      <div class="space-y-3">
        <!-- Balances -->
        <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-3 rounded-sm border border-cyan-500/20">
          <div class="flex justify-between items-center text-xs">
            <div class="text-center">
              <div class="text-gray-400 text-xs">ETH</div>
              <div class="text-cyan-400 font-semibold">{{ formattedBalance }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400 text-xs">SPIRAL</div>
              <div class="text-pink-400 font-semibold">
                <SpiralToken :amount="formattedSpiralBalance.replace(' SPIRAL', '')" color="purple" size="sm" />
              </div>
            </div>
          </div>
            
          <!-- Quick Actions -->
          <div class="flex gap-1 mt-2">
            <button 
              @click="openMatchHistory()" 
              class="text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium"
            >
              History
            </button>
            <button 
              @click="openLeaderboards()" 
              class="text-xs bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Leaderboard
            </button>
            <button 
              @click="openPlayerStatistics()" 
              class="text-xs bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Statistics
            </button>
            <button 
              @click="openAchievementTracker()" 
              class="text-xs bg-gradient-to-r from-pink-400 to-cyan-500 hover:from-pink-500 hover:to-cyan-600 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Achievements
            </button>
            <!-- Faucet Button - Shows different states -->
            <div v-if="!hasClaimed" class="flex-shrink-0">
              <UButton
                @click="claimFaucetHandler"
                :loading="claiming"
                size="xs"
                class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs rounded-sm transition-all duration-200 transform hover:scale-105 font-medium px-3 py-1.5"
              >
                {{ claiming ? 'Claiming...' : 'Claim 1000 SPIRAL' }}
              </UButton>
            </div>
            
            <!-- Social Engagement - Shows when already claimed -->
            <div v-else class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <UButton
                  @click="openTwitterRequest"
                  size="xs"
                  class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs rounded-sm transition-all duration-200 transform hover:scale-105 font-medium px-3 py-1.5"
                  title="Request more tokens on X"
                >
                  Request
                </UButton>
                <UButton
                  @click="openDiscord"
                  size="xs"
                  class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs rounded-sm transition-all duration-200 transform hover:scale-105 font-medium px-3 py-1.5"
                  title="Join our Discord"
                >
                  Discord
                </UButton>
              </div>
              <div class="text-xs text-gray-400">
                Need more tokens? Request on X or join our community!
              </div>
            </div>
          </div>
      </div>

      <!-- Race Information -->
      <div v-if="raceInfo" class="bg-gradient-to-r from-gray-700 to-gray-800 p-3 rounded-sm border border-pink-500/20">
        
        <div class="flex justify-between items-center text-xs">
          <div class="text-center">
            <div class="text-gray-400 text-xs">Race ID</div>
            <div class="text-white font-semibold">#{{ currentRaceId }}</div>
          </div>
          <div class="text-center">
            <div class="text-gray-400 text-xs">Total Bets</div>
            <div class="text-cyan-400 font-semibold">
              <SpiralToken :amount="raceInfo.totalBets ? ethers.utils.formatUnits(raceInfo.totalBets, 8) : '0'" color="cyan" size="sm" />
            </div>
          </div>

          <div class="text-center">
            <div class="text-gray-400 text-xs">Min/Max Bet</div>
            <div class="text-gray-300 font-semibold">
              <SpiralToken :amount="`${minBet}/${maxBet}`" color="default" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- Jackpot Pools -->
      <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-3 rounded-sm border border-cyan-500/20">
        
        <div class="flex justify-between items-center text-xs">
          <div class="text-center">
            <div class="text-amber-400 font-semibold">🥉 Mini</div>
            <div class="text-amber-300">
              <SpiralToken :amount="jackpotAmounts.mini" color="amber" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="text-amber-400 font-semibold">🥈 Mega</div>
            <div class="text-amber-200">
              <SpiralToken :amount="jackpotAmounts.mega" color="amber" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="text-amber-400 font-semibold">🥇 Super</div>
            <div class="text-amber-100">
              <SpiralToken :amount="jackpotAmounts.super" color="amber" size="sm" />
            </div>
          </div>
        </div>
      </div>
  </div>

      <!-- Right Column: Betting Interface -->
      <div class="space-y-3">
        <!-- Betting Interface Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Left: Ship Selection -->
          <div class="space-y-2">
            <h4 class="font-semibold text-cyan-400 text-xs mb-2">Select Ship</h4>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="ship in ships"
                :key="ship.id"
                class="relative p-2 rounded-sm border-2 transition-all duration-200 cursor-pointer transform hover:scale-105"
                :class="[
                  selectedShip?.id === ship.id 
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 shadow-lg shadow-cyan-400/50' 
                    : 'border-gray-600 hover:border-pink-500 hover:bg-pink-500/10'
                ]"
                @click="selectShip(ship)"
              >
                <div class="flex flex-col items-center space-y-1">
                  <div 
                    class="w-2 h-2 rounded-sm"
                    :style="{ backgroundColor: ship.color }"
                  ></div>
                  <div class="text-center">
                    <h4 class="font-semibold text-gray-200 text-xs">{{ ship.name }}</h4>
                    <p class="text-xs text-gray-400">{{ ship.chaosFactor }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bet Amount & Actions -->
          <div class="space-y-2">
            <h4 class="font-semibold text-pink-400 text-xs mb-2">Place Bet</h4>

            <!-- Bet Amount Input -->
            <div v-if="selectedShip" class="space-y-2">
              <div class="flex items-center space-x-2">
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-300 mb-1">Bet Amount (SPIRAL)</label>
                  <UInput
                    v-model="betAmount"
                    type="number"
                    :min="minBet"
                    :max="maxBet"
                    step="0.001"
                    placeholder="Enter bet amount"
                    class="w-full text-sm bg-gray-800 border border-gray-600 rounded-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>
                <div class="flex space-x-1">
                  <UButton
                    @click="setBetAmount(minBet)"
                    variant="outline"
                    size="sm"
                    class="text-xs border-gray-600 hover:border-cyan-400 hover:text-cyan-400 rounded-sm transition-all duration-200"
                  >
                    Min
                  </UButton>
                  <UButton
                    @click="setBetAmount(maxBet)"
                    variant="outline"
                    size="sm"
                    class="text-xs border-gray-600 hover:border-pink-400 hover:text-pink-400 rounded-sm transition-all duration-200"
                  >
                    Max
                  </UButton>
                </div>
              </div>

              <!-- Bet Preview -->
              <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-2 rounded-sm border border-cyan-500/20">
                <h4 class="font-semibold text-cyan-400 mb-1 text-xs">Bet Preview</h4>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Ship:</span>
                    <span class="text-gray-200">{{ selectedShip.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Amount:</span>
                    <SpiralToken :amount="betAmount" color="default" size="sm" />
                  </div>
                </div>
              </div>

              <!-- Place Bet Button -->
              <UButton
                @click="handlePlaceBet"
                :loading="placingBet || approving"
                :disabled="!canPlaceBet"
                :class="[
                  'w-full font-bold py-2 rounded-sm text-sm transition-all duration-200 transform hover:scale-105',
                  needsApproval && !approvalPending 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                    : 'bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white shadow-lg shadow-cyan-400/25'
                ]"
              >
                {{ getButtonText() }}
              </UButton>

              <p v-if="!canPlaceBet" class="text-xs text-red-400 text-center">
                {{ betError }}
              </p>
              
              <p v-if="needsApproval && !approvalPending && canPlaceBet" class="text-xs text-orange-400 text-center">
                ⚠️ First time betting? You need to allow the contract to spend your SPIRAL tokens.
              </p>
              
              <p v-if="approvalPending && canPlaceBet" class="text-xs text-green-400 text-center">
                ✅ Tokens approved! Click the button above to place your bet.
              </p>

              <!-- Error Display -->
              <div v-if="error" class="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-sm text-xs">
                <p class="text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Bets -->
        <div v-if="playerBets.length > 0" class="mt-3">
          <h4 class="font-semibold text-pink-400 mb-1 text-xs">Your Current Bets</h4>
          <div class="space-y-1">
            <div
              v-for="(bet, index) in playerBets"
              :key="index"
              class="flex justify-between items-center p-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-sm text-xs border border-cyan-500/20"
            >
              <div>
                <span class="text-gray-300">{{ getShipNameById(index) }}</span>
                <span class="text-gray-400 ml-1">{{ bet }} SPIRAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Username Registration Modal -->
  <UsernameRegistrationModal
    :show="showUsernameModal"
    @register="handleRegisterUsername"
    @skip="skipUsernameRegistration"
    @close="showUsernameModal = false"
  />

  <!-- Match History Modal -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showMatchHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="closeMatchHistory"
    >
      <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-purple-400">
            📊 Match History 
            <span v-if="selectedPlayerForHistory" class="text-cyan-400">
              - {{ selectedPlayerForHistory }}
            </span>
          </h2>
          <button 
            @click="closeMatchHistory" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingMatchHistory" class="text-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
          <p class="text-gray-400 mt-1 text-sm">Loading match history...</p>
        </div>
        
        <div v-else-if="matchHistory.length === 0" class="text-center py-6">
          <p class="text-gray-400 text-sm">No matches found</p>
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(match, index) in matchHistory" 
            :key="index"
            class="bg-gray-800 border border-gray-700 rounded-lg p-3"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <span class="text-purple-400 font-semibold text-sm">Race #{{ match.raceId }}</span>
                  <span class="text-gray-400 text-xs">{{ formatDate(match.timestamp) }}</span>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span class="text-gray-400">Ship:</span>
                    <span class="text-cyan-400 ml-1">{{ getShipNameById(match.shipBet) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Bet:</span>
                    <SpiralToken :amount="match.betAmount" color="yellow" size="sm" />
                  </div>
                  <div>
                    <span class="text-gray-400">Position:</span>
                    <span :class="getPlacementColor(match.placement)" class="ml-1">
                      {{ getPlacementText(match.placement) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Payout:</span>
                    <SpiralToken :amount="match.payout" :color="match.payout > match.betAmount ? 'green' : 'red'" size="sm" />
                  </div>
                </div>
                
                <div v-if="match.jackpotTier > 0" class="mt-1 text-xs">
                  <span class="text-amber-400">🎰 Jackpot Hit!</span>
                  <span class="text-gray-400">Tier {{ match.jackpotTier }}:</span>
                  <SpiralToken :amount="match.jackpotAmount" color="amber" size="sm" />
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-sm font-semibold">
                  <span :class="(match.payout + match.jackpotAmount) > match.betAmount ? 'text-green-400' : 'text-red-400'">
                    {{ (match.payout + match.jackpotAmount) > match.betAmount ? '+' : '' }}{{ ((match.payout + match.jackpotAmount) - match.betAmount).toFixed(4) }}
                  </span>
                </div>
                <div class="text-xs text-gray-400">Net P&L</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-4">
          <button 
            @click="closeMatchHistory" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Leaderboards Modal -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showLeaderboardsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="closeLeaderboards"
    >
      <div class="bg-gray-900 border border-yellow-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-yellow-400">🏆 Leaderboards</h2>
          <button 
            @click="closeLeaderboards" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingLeaderboards" class="text-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
          <p class="text-gray-400 mt-1 text-sm">Loading leaderboards...</p>
        </div>
        
        <div v-else-if="leaderboardData.players.length === 0" class="text-center py-6">
          <p class="text-gray-400 text-sm">No leaderboard data available</p>
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(player, index) in leaderboardData.players" 
            :key="index"
            class="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 cursor-pointer transition-colors"
            @click="openPlayerHistory(player, leaderboardData.usernames[index])"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="text-lg font-bold text-yellow-400">
                  #{{ index + 1 }}
                </div>
                <div>
                  <div class="font-semibold text-cyan-400">
                    <span class="font-mono text-xs">{{ formatAddress(player) }}</span>
                  </div>
                  <div v-if="leaderboardData.usernames[index]" class="text-purple-400 text-xs">
                    👤 {{ leaderboardData.usernames[index] }}
                  </div>
                  <div v-else class="text-gray-500 text-xs">
                    Anon
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-sm font-semibold text-green-400">
                  <SpiralToken :amount="leaderboardData.winnings[index] || '0'" color="green" size="sm" />
                </div>
                <div class="text-xs text-gray-400">Total Winnings</div>
              </div>
            </div>
            
            <div class="text-xs text-gray-500 mt-1">
              Click to view match history
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-4">
          <button 
            @click="closeLeaderboards" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Player Statistics Modal -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showPlayerStatisticsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="closePlayerStatistics"
    >
      <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-purple-400">📈 Player Statistics</h2>
          <button 
            @click="closePlayerStatistics" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingPlayerStatistics" class="text-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
          <p class="text-gray-400 mt-1 text-sm">Loading player statistics...</p>
        </div>
        
        <div v-else-if="!playerStats" class="text-center py-6">
          <p class="text-gray-400 text-sm">No player statistics available</p>
        </div>
        
        <div v-else class="space-y-4">
          <!-- Player Info -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <h3 class="text-sm font-bold text-purple-300 mb-2">👤 Player Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-gray-400">Address:</span>
                <span class="text-cyan-400 font-mono ml-1">{{ shortAddress }}</span>
              </div>
              <div v-if="hasUsername">
                <span class="text-gray-400">Username:</span>
                <span class="text-purple-400 font-semibold ml-1">{{ playerUsername }}</span>
              </div>
              <div v-else>
                <span class="text-gray-400">Username:</span>
                <span class="text-orange-400 ml-1">Not registered</span>
              </div>
              <div>
                <span class="text-gray-400">Current Balance:</span>
                <SpiralToken :amount="formattedSpiralBalance.replace(' SPIRAL', '')" color="green" size="sm" />
              </div>
            </div>
          </div>

          <!-- Basic Statistics -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <h3 class="text-sm font-bold text-purple-300 mb-2">📊 Basic Statistics</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="text-center">
                <div class="text-gray-400 text-xs">Total Races</div>
                <div class="text-white font-bold text-lg">{{ playerStats.totalRaces }}</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-xs">Total Winnings</div>
                <div class="text-green-400 font-bold text-lg">
                  <SpiralToken :amount="playerStats.totalWinnings" color="green" size="lg" />
                </div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-xs">Biggest Win</div>
                <div class="text-yellow-400 font-bold text-lg">
                  <SpiralToken :amount="playerStats.biggestWin" color="yellow" size="lg" />
                </div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-xs">Achievement Rewards</div>
                <div class="text-purple-400 font-bold text-lg">
                  <SpiralToken :amount="playerStats.achievementRewards" color="purple" size="lg" />
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
                <div class="text-gray-400 text-xs">{{ getShipNameById(parseInt(shipId.toString())) }}</div>
                <div class="text-white font-bold text-sm">{{ wins }} wins</div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="achievementCount > 0" class="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
              🏆 Achievements
              <span class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                {{ achievementCount }} Total
              </span>
            </h3>
            <p class="text-gray-400 text-xs">
              You have unlocked {{ achievementCount }} achievements! Check your wallet for NFT rewards.
            </p>
          </div>
        </div>
        
        <div class="flex justify-center mt-4">
          <button 
            @click="closePlayerStatistics" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>

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
      <div class="bg-gray-900 border border-yellow-500/30 rounded-lg p-4 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-yellow-400">🏆 Achievement Tracker</h2>
          <button 
            @click="closeAchievementTracker" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <AchievementTracker />
        
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
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useBetting } from '~/composables/useBetting'
import { ethers } from 'ethers'
import UsernameRegistrationModal from './UsernameRegistrationModal.vue'
import AchievementTracker from './AchievementTracker.vue'
import SpiralToken from './SpiralToken.vue'

// Define emits
const emit = defineEmits<{
  raceCompleted: [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }]
}>()

// Use the betting composable
const {
  // State
  betError,
  placingBet,
  error,
  selectedShip,
  betAmount,
  shipBets,
  playerBets,
  jackpotAmounts,
  claiming,
  hasClaimed,
  approving,
  needsApproval,
  approvalPending,
  allowanceChecked,
  playerStats,
  achievementCount,
  raceInfo,
  showUsernameModal,
  playerUsername,
  hasUsername,
  playerAvatarId,
  usernameInput,
  registeringUsername,
  usernameError,
  showMatchHistoryModal,
  matchHistory,
  loadingMatchHistory,
  selectedPlayerForHistory,
  showLeaderboardsModal,
  leaderboardData,
  loadingLeaderboards,
  showPlayerStatisticsModal,
  loadingPlayerStatistics,
  showAchievementTrackerModal,
  ships,
  loadingStates,

  // Computed
  minBet,
  maxBet,
  totalCost,
  canPlaceBet,
  getButtonText,

  // Methods
  selectShip,
  setBetAmount,
  checkAllowanceIfReady,
  getShipNameById,
  approveTokens,
  placeBet,
  initializeBettingData,
  loadBettingData,
  loadPlayerData,
  loadJackpotData,
  claimFaucetHandler,
  checkFaucetStatus,
  openTwitterRequest,
  openDiscord,
  openTwitterProfile,
  checkUsernameStatus,
  handleRegisterUsername,
  skipUsernameRegistration,
  openMatchHistory,
  closeMatchHistory,
  openLeaderboards,
  closeLeaderboards,
  openPlayerHistory,
  openPlayerStatistics,
  closePlayerStatistics,
  openAchievementTracker,
  closeAchievementTracker,
  formatAddress,
  formatDate,
  getPlacementText,
  getPlacementColor,

  // Web3 state
  isConnected,
  shortAddress,
  formattedBalance,
  formattedSpiralBalance,
  walletType,
  isCorrectNetwork,
  currentRaceId
} = useBetting()

// Get the singleton useWeb3 instance
const web3 = useWeb3()
const web3IsConnected = computed(() => web3.isConnected.value)
const web3ShortAddress = computed(() => web3.shortAddress.value)
const web3WalletType = computed(() => web3.walletType.value)
const web3ConnectionState = computed(() => web3.connectionState.value)

// Handle place bet and emit race result
const handlePlaceBet = async () => {
  // If approval is needed, handle it first
  if (needsApproval.value && !approvalPending.value) {
    const approved = await approveTokens()
    if (!approved) {
      return
    }
    // After successful approval, wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Place the bet
  const result = await placeBet()
  if (result) {
    emit('raceCompleted', result)
  }
}

// Performance: Optimized initialization with proper timing
onMounted(() => {
  // Wait for next tick to ensure reactive state is ready
  nextTick(() => {
    if (web3ConnectionState.value === 'ready') {
      initializeBettingData()
    }
  })
})

// Performance: Single optimized watcher for connection state changes
watch(web3ConnectionState, (newState, oldState) => {
  if (newState === 'ready' && oldState !== 'ready') {
    // Add a small delay to ensure everything is properly initialized
    setTimeout(() => {
      initializeBettingData()
    }, 500)
  }
}, { immediate: true })

// Performance: Optimized race ID watcher
watch(currentRaceId, () => {
  if (isConnected.value) {
    loadBettingData()
  }
})

// Performance: Optimized bet amount watcher
watch(betAmount, () => {
  if (allowanceChecked.value) {
    needsApproval.value = false
    approvalPending.value = false
    allowanceChecked.value = false
  }
})

// Performance: Optimized ship and bet amount watcher
watch([selectedShip, betAmount], () => {
  if (isConnected.value && selectedShip.value && betAmount.value) {
    // Small delay to ensure the values are set
    setTimeout(() => {
      checkAllowanceIfReady()
    }, 100)
  }
})
</script> 