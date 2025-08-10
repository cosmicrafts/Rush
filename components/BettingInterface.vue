<template>
  <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
    <!-- Wallet Connection -->
    <div v-if="!isConnected" class="text-center">
      <div v-if="!showWalletOptions">
        <UButton
          @click="showWalletOptions = true"
          class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg"
        >
          Connect Wallet
        </UButton>
        <p class="text-sm text-gray-400 mt-2">Choose your wallet to start betting</p>
      </div>
      
      <div v-else class="space-y-3">
        <UButton
          @click="connectMetaMaskHandler"
          :loading="connecting"
          class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg"
        >
          {{ connecting ? 'Connecting...' : 'MetaMask' }}
        </UButton>
        
        <UButton
          @click="connectCoinbaseHandler"
          :loading="connecting"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg"
        >
          {{ connecting ? 'Connecting...' : 'Coinbase Wallet' }}
        </UButton>
        
        <UButton
          @click="showWalletOptions = false"
          variant="outline"
          class="w-full text-gray-400 border-gray-600 hover:bg-gray-700"
        >
          Cancel
        </UButton>
      </div>
    </div>

    <!-- Connected User Interface -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Player Info -->
      <div class="space-y-4">
        <!-- Connection Status -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-gray-200 mb-3">👤 Player Info</h3>
          <div class="space-y-2 text-sm">
            <p class="text-gray-300">
              Connected: <span class="text-cyan-400 font-mono">{{ shortAddress }}</span>
              <span class="text-gray-500 ml-2">({{ walletType }})</span>
            </p>
            <p v-if="hasUsername" class="text-gray-400">
              Username: <span class="text-purple-400 font-semibold">{{ playerUsername }}</span>
            </p>
            <p v-else class="text-gray-400">
              <span class="text-orange-400">No username</span> - 
              <button @click="showUsernameModal = true" class="text-purple-400 hover:text-purple-300 underline">
                Register username
              </button>
            </p>
            <p class="text-gray-400">ETH: <span class="text-blue-400">{{ formattedBalance }}</span></p>
            <p class="text-gray-400">SPIRAL: <span class="text-green-400">{{ formattedSpiralBalance }}</span></p>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex gap-2 mt-3">
            <button 
              @click="openMatchHistory()" 
              class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
            >
              📊 History
            </button>
            <button 
              @click="openLeaderboards()" 
              class="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
            >
              🏆 Leaderboard
            </button>
            <button 
              @click="openPlayerStatistics()" 
              class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
            >
              📈 Statistics
            </button>
            <UButton
              @click="claimFaucetHandler"
              :loading="claiming"
              :disabled="hasClaimed"
              size="xs"
              class="bg-green-500 hover:bg-green-600 text-white"
            >
              {{ hasClaimed ? 'Claimed' : claiming ? 'Claiming...' : 'Claim 1000 SPIRAL' }}
            </UButton>
            <UButton
              @click="disconnect"
              variant="outline"
              size="xs"
              class="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              Disconnect
            </UButton>
          </div>
        </div>

        <!-- Race Information -->
        <div v-if="raceInfo" class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-gray-200 mb-3 flex items-center">
            <span class="mr-2">🏁</span>
            Current Race
          </h3>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="text-center">
              <div class="text-gray-400 text-xs">Race ID</div>
              <div class="text-white font-semibold">#{{ currentRaceId }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400 text-xs">Total Bets</div>
              <div class="text-cyan-400 font-semibold">{{ raceInfo.totalBets ? ethers.utils.formatUnits(raceInfo.totalBets, 8) : '0' }} SPIRAL</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400 text-xs">Prize Pool</div>
              <div class="text-green-400 font-semibold">{{ raceInfo.prizePool ? ethers.utils.formatUnits(raceInfo.prizePool, 8) : '0' }} SPIRAL</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400 text-xs">Min/Max Bet</div>
              <div class="text-gray-300 font-semibold">{{ minBet }}/{{ maxBet }} SPIRAL</div>
            </div>
          </div>
        </div>

        <!-- Jackpot Pools -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-gray-200 mb-3 flex items-center">
            <span class="mr-2">🎰</span>
            Jackpot Pools
          </h3>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="text-center">
              <div class="text-amber-400 font-semibold">🥉 Mini</div>
              <div class="text-amber-300">{{ jackpotAmounts.mini }} SPIRAL</div>
            </div>
            <div class="text-center">
              <div class="text-amber-400 font-semibold">🥈 Mega</div>
              <div class="text-amber-200">{{ jackpotAmounts.mega }} SPIRAL</div>
            </div>
            <div class="text-center">
              <div class="text-amber-400 font-semibold">🥇 Super</div>
              <div class="text-amber-100">{{ jackpotAmounts.super }} SPIRAL</div>
            </div>
          </div>
        </div>

        <!-- Network Status -->
        <div v-if="!isCorrectNetwork" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p class="text-red-400 text-sm">
            ⚠️ Wrong network detected. Please switch to Somnia Testnet.
          </p>
          <div class="flex space-x-2 mt-2">
            <UButton
              @click="handleSwitchNetwork"
              size="sm"
              class="bg-red-500 hover:bg-red-600 text-white"
            >
              Auto Switch
            </UButton>
            <UButton
              @click="openSomniaNetwork"
              size="sm"
              variant="outline"
              class="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Manual Add
            </UButton>
          </div>
        </div>
      </div>

      <!-- Right Column: Betting Interface -->
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-xl font-bold text-gray-200 mb-2">Place Your Bets</h3>
          <p class="text-sm text-gray-400">
            Race #{{ currentRaceId }} | Min: {{ minBet }} SPIRAL | Max: {{ maxBet }} SPIRAL
          </p>
        </div>

        <!-- Ship Selection Grid -->
        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="ship in ships"
            :key="ship.id"
            class="relative p-3 rounded-lg border-2 transition-all cursor-pointer"
            :class="[
              selectedShip?.id === ship.id 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-gray-600 hover:border-gray-500'
            ]"
            @click="selectShip(ship)"
          >
            <div class="flex flex-col items-center space-y-2">
              <div 
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: ship.color }"
              ></div>
              <div class="text-center">
                <h4 class="font-semibold text-gray-200 text-xs">{{ ship.name }}</h4>
                <p class="text-xs text-gray-400">{{ ship.chaosFactor }}</p>
              </div>
            </div>
            
            <!-- Bet Amount Display -->
            <div v-if="shipBets[ship.id]" class="mt-1 text-xs text-center">
              <p class="text-gray-400">Total: <span class="text-green-400">{{ shipBets[ship.id] }} SPIRAL</span></p>
            </div>
          </div>
        </div>

        <!-- Bet Amount Input -->
        <div v-if="selectedShip" class="space-y-3">
          <div class="flex items-center space-x-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-1">Bet Amount (SPIRAL)</label>
              <UInput
                v-model="betAmount"
                type="number"
                :min="minBet"
                :max="maxBet"
                step="0.001"
                placeholder="Enter bet amount"
                class="w-full"
              />
            </div>
            <div class="flex space-x-1">
              <UButton
                @click="setBetAmount(minBet)"
                variant="outline"
                size="sm"
              >
                Min
              </UButton>
              <UButton
                @click="setBetAmount(maxBet)"
                variant="outline"
                size="sm"
              >
                Max
              </UButton>
            </div>
          </div>

          <!-- Bet Preview -->
          <div class="bg-gray-700 p-3 rounded-lg">
            <h4 class="font-semibold text-gray-200 mb-2 text-sm">Bet Preview</h4>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-400">Ship:</span>
                <span class="text-gray-200">{{ selectedShip.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-gray-200">{{ betAmount }} SPIRAL</span>
              </div>
              <div class="flex justify-between border-t border-gray-600 pt-1">
                <span class="text-gray-400">Total Cost:</span>
                <span class="text-cyan-400 font-semibold">{{ totalCost }} SPIRAL</span>
              </div>
            </div>
          </div>

          <!-- Place Bet Button -->
          <UButton
            @click="placeBet"
            :loading="placingBet || approving"
            :disabled="!canPlaceBet"
            :class="[
              'w-full font-bold py-3 rounded-lg',
              needsApproval && !approvalPending 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            ]"
          >
            {{ getButtonText() }}
          </UButton>

          <p v-if="!canPlaceBet" class="text-sm text-red-400 text-center">
            {{ betError }}
          </p>
          
          <p v-if="needsApproval && !approvalPending && canPlaceBet" class="text-sm text-orange-400 text-center">
            ⚠️ First time betting? You need to allow the contract to spend your SPIRAL tokens.
          </p>
          
          <p v-if="approvalPending && canPlaceBet" class="text-sm text-green-400 text-center">
            ✅ Tokens approved! Click the button above to place your bet.
          </p>
        </div>

        <!-- Current Bets -->
        <div v-if="playerBets.length > 0" class="mt-4">
          <h4 class="font-semibold text-gray-200 mb-2 text-sm">Your Current Bets</h4>
          <div class="space-y-1">
            <div
              v-for="(bet, index) in playerBets"
              :key="index"
              class="flex justify-between items-center p-2 bg-gray-700 rounded-lg text-sm"
            >
              <div>
                <span class="text-gray-300">{{ getShipName(index + 1) }}</span>
                <span class="text-gray-400 ml-2">{{ bet }} SPIRAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
      <p class="text-red-400">{{ error }}</p>
    </div>
  </div>

  <!-- Username Registration Modal -->
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="showUsernameModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="skipUsernameRegistration"
    >
      <div class="w-full max-w-md mx-4 bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
          <h2 class="text-2xl font-bold text-white mb-2">🎮 Register Username</h2>
          <p class="text-purple-100 text-sm">Choose a unique username to identify yourself in the game!</p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <UInput
              v-model="usernameInput"
              type="text"
              placeholder="Enter your username (1-20 characters)"
              maxlength="20"
              class="w-full"
              :disabled="registeringUsername"
              @keyup.enter="handleRegisterUsername"
            />
            <p v-if="usernameError" class="text-red-400 text-sm mt-2">{{ usernameError }}</p>
            <p class="text-gray-400 text-xs mt-2">
              • Must be 1-20 characters<br>
              • Username must be unique<br>
              • Cannot be changed once registered
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-purple-800/50 p-4 flex space-x-3">
          <UButton
            @click="handleRegisterUsername"
            :loading="registeringUsername"
            :disabled="!usernameInput.trim() || registeringUsername"
            class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg"
          >
            {{ registeringUsername ? 'Registering...' : 'Register Username' }}
          </UButton>
          <UButton
            @click="skipUsernameRegistration"
            variant="outline"
            :disabled="registeringUsername"
            class="flex-1 text-gray-300 border-gray-500 hover:bg-gray-700"
          >
            Skip for now
          </UButton>
        </div>
      </div>
    </div>
  </Transition>

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
      <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-purple-400">
            📊 Match History 
            <span v-if="selectedPlayerForHistory" class="text-cyan-400">
              - {{ selectedPlayerForHistory }}
            </span>
          </h2>
          <button 
            @click="closeMatchHistory" 
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingMatchHistory" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p class="text-gray-400 mt-2">Loading match history...</p>
        </div>
        
        <div v-else-if="matchHistory.length === 0" class="text-center py-8">
          <p class="text-gray-400">No matches found</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="(match, index) in matchHistory" 
            :key="index"
            class="bg-gray-800 border border-gray-700 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-2">
                  <span class="text-purple-400 font-semibold">Race #{{ match.raceId }}</span>
                  <span class="text-gray-400 text-sm">{{ formatDate(match.timestamp) }}</span>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Ship:</span>
                    <span class="text-cyan-400 ml-1">{{ getShipName(match.shipBet) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Bet:</span>
                    <span class="text-yellow-400 ml-1">{{ match.betAmount }} SPIRAL</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Position:</span>
                    <span :class="getPlacementColor(match.placement)" class="ml-1">
                      {{ getPlacementText(match.placement) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Payout:</span>
                    <span :class="match.payout > match.betAmount ? 'text-green-400' : 'text-red-400'" class="ml-1">
                      {{ match.payout }} SPIRAL
                    </span>
                  </div>
                </div>
                
                <div v-if="match.jackpotTier > 0" class="mt-2 text-sm">
                  <span class="text-amber-400">🎰 Jackpot Hit!</span>
                  <span class="text-gray-400">Tier {{ match.jackpotTier }}:</span>
                  <span class="text-amber-300 ml-1">{{ match.jackpotAmount }} SPIRAL</span>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-lg font-semibold">
                  <span :class="(match.payout + match.jackpotAmount) > match.betAmount ? 'text-green-400' : 'text-red-400'">
                    {{ (match.payout + match.jackpotAmount) > match.betAmount ? '+' : '' }}{{ ((match.payout + match.jackpotAmount) - match.betAmount).toFixed(4) }}
                  </span>
                </div>
                <div class="text-sm text-gray-400">Net P&L</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <button 
            @click="closeMatchHistory" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
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
      <div class="bg-gray-900 border border-yellow-500/30 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-yellow-400">🏆 Leaderboards</h2>
          <button 
            @click="closeLeaderboards" 
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingLeaderboards" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p class="text-gray-400 mt-2">Loading leaderboards...</p>
        </div>
        
        <div v-else-if="leaderboardData.players.length === 0" class="text-center py-8">
          <p class="text-gray-400">No leaderboard data available</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="(player, index) in leaderboardData.players" 
            :key="index"
            class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
            @click="openPlayerHistory(player, leaderboardData.usernames[index])"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-yellow-400">
                  #{{ index + 1 }}
                </div>
                <div>
                  <div class="font-semibold text-cyan-400">
                    <span class="font-mono text-sm">{{ formatAddress(player) }}</span>
                  </div>
                  <div v-if="leaderboardData.usernames[index]" class="text-purple-400 text-sm">
                    👤 {{ leaderboardData.usernames[index] }}
                  </div>
                  <div v-else class="text-gray-500 text-sm">
                    No username registered
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-lg font-semibold text-green-400">
                  {{ leaderboardData.winnings[index] }} SPIRAL
                </div>
                <div class="text-sm text-gray-400">Total Winnings</div>
              </div>
            </div>
            
            <div class="text-xs text-gray-500 mt-2">
              Click to view match history
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <button 
            @click="closeLeaderboards" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
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
      <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-purple-400">📈 Player Statistics</h2>
          <button 
            @click="closePlayerStatistics" 
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="loadingPlayerStatistics" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p class="text-gray-400 mt-2">Loading player statistics...</p>
        </div>
        
        <div v-else-if="!playerStats" class="text-center py-8">
          <p class="text-gray-400">No player statistics available</p>
        </div>
        
        <div v-else class="space-y-6">
          <!-- Player Info -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-bold text-purple-300 mb-3">👤 Player Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-400">Address:</span>
                <span class="text-cyan-400 font-mono ml-2">{{ shortAddress }}</span>
              </div>
              <div v-if="hasUsername">
                <span class="text-gray-400">Username:</span>
                <span class="text-purple-400 font-semibold ml-2">{{ playerUsername }}</span>
              </div>
              <div v-else>
                <span class="text-gray-400">Username:</span>
                <span class="text-orange-400 ml-2">Not registered</span>
              </div>
              <div>
                <span class="text-gray-400">Current Balance:</span>
                <span class="text-green-400 font-semibold ml-2">{{ formattedSpiralBalance }} SPIRAL</span>
              </div>
            </div>
          </div>

          <!-- Basic Statistics -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-bold text-purple-300 mb-3">📊 Basic Statistics</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-gray-400 text-sm">Total Races</div>
                <div class="text-white font-bold text-xl">{{ playerStats.totalRaces }}</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-sm">Total Winnings</div>
                <div class="text-green-400 font-bold text-xl">{{ playerStats.totalWinnings }} SPIRAL</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-sm">Biggest Win</div>
                <div class="text-yellow-400 font-bold text-xl">{{ playerStats.biggestWin }} SPIRAL</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-sm">Achievement Rewards</div>
                <div class="text-purple-400 font-bold text-xl">{{ playerStats.achievementRewards }} SPIRAL</div>
              </div>
            </div>
          </div>

          <!-- Ship Performance -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-bold text-purple-300 mb-3">🚀 Ship Performance</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                v-for="(wins, shipId) in playerStats.spaceshipWins" 
                :key="shipId"
                class="text-center p-3 bg-gray-700 rounded-lg"
              >
                <div class="text-gray-400 text-xs">{{ getShipName(parseInt(shipId.toString())) }}</div>
                <div class="text-white font-bold">{{ wins }} wins</div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="achievementCount > 0" class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-bold text-purple-300 mb-3 flex items-center">
              🏆 Achievements
              <span class="ml-auto text-sm bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                {{ achievementCount }} Total
              </span>
            </h3>
            <p class="text-gray-400 text-sm">
              You have unlocked {{ achievementCount }} achievements! Check your wallet for NFT rewards.
            </p>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <button 
            @click="closePlayerStatistics" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'
import { SHIPS_ROSTER } from '~/data/ships'
import type { Ship } from '~/types/game'
import { ethers } from 'ethers'

// Define emits
const emit = defineEmits<{
  raceCompleted: [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }]
}>()

const {
  isConnected,
  shortAddress,
  formattedBalance,
  formattedSpiralBalance,
  spiralBalance,
  walletType,
  isCorrectNetwork,
  currentRaceId,
  contractInfo,
  connectMetaMask,
  connectCoinbaseWallet,
  disconnect,
  placeBet: web3PlaceBet,
  getCurrentRaceInfo,
  getShipBets,
  getPlayerBets,
  getPlayerStats,
  getPlayerAchievementCount,
  updateBalance,
  switchToSomniaTestnet,
  claimFaucet,
  hasClaimedFaucet,
  approveSpiralTokens,
  checkApprovalNeeded,
  getJackpotAmounts,
  // Username functions
  registerUsername,
  getUsername,
  playerHasUsername,
  // Match history functions
  getPlayerMatchHistory,
  getRecentMatches,
  // Leaderboard functions
  getTopPlayersByWinnings,
  getPlayerLeaderboardStats
} = useWeb3()

// Game constants - now from contract
const minBet = computed(() => contractInfo.value.minBet)
const maxBet = computed(() => contractInfo.value.maxBet)
// houseFee removed - not available in current contract

const betError = ref('')
const showWalletOptions = ref(false)

const connecting = ref(false)
const placingBet = ref(false)
const error = ref('')
const selectedShip = ref<Ship | null>(null)
const betAmount = ref('')
const shipBets = ref<{ [key: number]: string }>({})
const playerBets = ref<string[]>([])
const jackpotAmounts = ref({ mini: '0', mega: '0', super: '0' })

// Faucet state
const claiming = ref(false)
const hasClaimed = ref(false)

// Approval state
const approving = ref(false)
const needsApproval = ref(false)
const approvalPending = ref(false)
const allowanceChecked = ref(false)

// Player statistics
const playerStats = ref<any>(null)
const achievementCount = ref(0)
const raceInfo = ref<any>(null)

// Username state
const showUsernameModal = ref(false)
const playerUsername = ref('')
const hasUsername = ref(false)
const usernameInput = ref('')
const registeringUsername = ref(false)
const usernameError = ref('')

// Match History state
interface MatchRecord {
  raceId: string
  timestamp: Date
  shipBet: number
  betAmount: number
  placement: number
  payout: number
  jackpotTier: number
  jackpotAmount: number
}

const showMatchHistoryModal = ref(false)
const matchHistory = ref<MatchRecord[]>([])
const loadingMatchHistory = ref(false)
const selectedPlayerForHistory = ref('')

// Leaderboards state
const showLeaderboardsModal = ref(false)
const leaderboardData = ref({
  players: [],
  usernames: [],
  winnings: []
})
const loadingLeaderboards = ref(false)

// Player Statistics state
const showPlayerStatisticsModal = ref(false)
const loadingPlayerStatistics = ref(false)

const ships = SHIPS_ROSTER

// Computed properties
// houseFeeAmount removed - not available in current contract

const totalCost = computed(() => {
  if (!betAmount.value) return '0'
  const amount = parseFloat(betAmount.value)
  // No house fee in current contract
  return amount.toFixed(4)
})

const canPlaceBet = computed(() => {
  if (!selectedShip.value || !betAmount.value) return false
  
  const amount = parseFloat(betAmount.value)
  const min = parseFloat(minBet.value)
  const max = parseFloat(maxBet.value)
  // Use SPIRAL balance for betting validation
  const spiralBalanceNum = spiralBalance.value ? parseFloat(spiralBalance.value) : 0
  const total = parseFloat(totalCost.value)
  
  if (amount < min) {
    betError.value = `Bet must be at least ${minBet.value} SPIRAL`
    return false
  }
  if (amount > max) {
    betError.value = `Bet cannot exceed ${maxBet.value} SPIRAL`
    return false
  }
  if (total > spiralBalanceNum) {
    betError.value = `Insufficient SPIRAL balance (have ${spiralBalanceNum.toFixed(4)} SPIRAL)`
    return false
  }
  
  betError.value = ''
  return true
})

const getButtonText = () => {
  if (approving.value) return 'Approving Tokens...'
  if (placingBet.value) return 'Placing Bet...'
  if (needsApproval.value && !approvalPending.value) return 'Allow SPIRAL Tokens'
  if (approvalPending.value) return `Click Again to Bet on ${selectedShip.value?.name || 'Ship'}`
  return `Place Bet on ${selectedShip.value?.name || 'Ship'}`
}

// Methods
const selectShip = (ship: Ship) => {
  selectedShip.value = ship
  checkAllowanceIfReady()
}

const setBetAmount = (amount: string) => {
  betAmount.value = amount
  checkAllowanceIfReady()
}

// Check allowance when ship and amount are selected
const checkAllowanceIfReady = async () => {
  console.log('🔍 checkAllowanceIfReady called:', {
    selectedShip: selectedShip.value?.name,
    betAmount: betAmount.value,
    isConnected: isConnected.value
  })
  
  if (!selectedShip.value || !betAmount.value || !isConnected.value) {
    console.log('❌ checkAllowanceIfReady: Missing required data')
    needsApproval.value = false
    return
  }
  
  try {
    allowanceChecked.value = true
    console.log('🔍 Checking allowance for amount:', betAmount.value)
    const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
    needsApproval.value = needsApprovalCheck
    console.log('🔍 Allowance check result:', needsApprovalCheck)
  } catch (err) {
    console.error('Failed to check allowance:', err)
    needsApproval.value = false
  }
}

// Convert frontend ship ID to contract ship ID (0-based)
const frontendToContractShipId = (frontendId: number) => {
  // Map frontend ship IDs to contract IDs (0-based)
  // Frontend: Comet=1, Juggernaut=2, Shadow=3, Phantom=4, Phoenix=5, Vanguard=6, Wildcard=7, Apex=8
  // Contract: Comet=0, Juggernaut=1, Shadow=2, Phantom=3, Phoenix=4, Vanguard=5, Wildcard=6, Apex=7
  const mapping: { [key: number]: number } = {
    1: 0, // Comet: frontend ID 1 -> contract ID 0
    2: 1, // Juggernaut: frontend ID 2 -> contract ID 1
    3: 2, // Shadow: frontend ID 3 -> contract ID 2
    4: 3, // Phantom: frontend ID 4 -> contract ID 3
    5: 4, // Phoenix: frontend ID 5 -> contract ID 4
    6: 5, // Vanguard: frontend ID 6 -> contract ID 5
    7: 6, // Wildcard: frontend ID 7 -> contract ID 6
    8: 7  // Apex: frontend ID 8 -> contract ID 7
  }
  return mapping[frontendId] ?? frontendId
}

const getShipName = (shipId: number) => {
  // For match history, shipId comes from contract (0-based), convert to frontend (1-based)
  const frontendId = shipId + 1
  const ship = ships.find(s => s.id === frontendId)
  return ship?.name || `Ship ${shipId}`
}

const connectMetaMaskHandler = async () => {
  connecting.value = true
  error.value = ''
  
  try {
    await connectMetaMask()
    await loadBettingData()
    await checkUsernameStatus() // Check username after connection
    showWalletOptions.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to connect MetaMask'
  } finally {
    connecting.value = false
  }
}

const connectCoinbaseHandler = async () => {
  connecting.value = true
  error.value = ''
  
  try {
    await connectCoinbaseWallet()
    await loadBettingData()
    await checkUsernameStatus() // Check username after connection
    showWalletOptions.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to connect Coinbase Wallet'
  } finally {
    connecting.value = false
  }
}

const placeBet = async () => {
  if (!selectedShip.value || !betAmount.value) return
  
  error.value = ''
  
  // If we need approval and haven't started the approval process yet
  if (needsApproval.value && !approvalPending.value) {
    // Start approval process
    needsApproval.value = true
    approving.value = true
    
    try {
      await approveSpiralTokens()
      
      // Wait a moment for the blockchain to confirm the approval
      console.log('🔄 Waiting for approval confirmation...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verify the approval went through by checking again
      const verifyApproval = await checkApprovalNeeded(betAmount.value)
      if (verifyApproval) {
        throw new Error('Approval transaction may not have been confirmed yet. Please try again in a few seconds.')
      }
      
      approvalPending.value = true
      needsApproval.value = false
      console.log('✅ Approval confirmed! Click Place Bet again to proceed.')
    } catch (approveErr: any) {
      error.value = approveErr.message || 'Failed to approve tokens'
      needsApproval.value = false
    } finally {
      approving.value = false
    }
    return
  }
  
  try {
    // Check if we need approval first (for the case where approvalPending is true)
    console.log('🔍 Checking approval for amount:', betAmount.value)
    const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
    console.log('🔍 Needs approval:', needsApprovalCheck, 'Approval pending:', approvalPending.value)
    
    if (needsApprovalCheck && !approvalPending.value) {
      // Need to approve first
      needsApproval.value = true
      approving.value = true
      
      try {
        await approveSpiralTokens()
        
        // Wait a moment for the blockchain to confirm the approval
        console.log('🔄 Waiting for approval confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Verify the approval went through by checking again
        const verifyApproval = await checkApprovalNeeded(betAmount.value)
        if (verifyApproval) {
          throw new Error('Approval transaction may not have been confirmed yet. Please try again in a few seconds.')
        }
        
        approvalPending.value = true
        needsApproval.value = false
        console.log('✅ Approval confirmed! Click Place Bet again to proceed.')
      } catch (approveErr: any) {
        error.value = approveErr.message || 'Failed to approve tokens'
        needsApproval.value = false
      } finally {
        approving.value = false
      }
      return
    }
    
    // Place the bet
    placingBet.value = true
    const contractShipId = frontendToContractShipId(selectedShip.value.id)
    console.log('🚀 Betting on ship:', selectedShip.value.name, 'Frontend ID:', selectedShip.value.id, '-> Contract ID:', contractShipId)
    const betResult = await web3PlaceBet(contractShipId, betAmount.value)
    
    // Store bet info for race emission (use contract ship ID for consistency)
    const playerShipId = contractShipId
    const playerBetAmount = betAmount.value
    
    // Reset form and states
    selectedShip.value = null
    betAmount.value = ''
    needsApproval.value = false
    approvalPending.value = false
    
    // Reload data
    await Promise.all([
      updateBalance(),
      loadBettingData(),
      loadPlayerData(),
      loadJackpotData()
    ])
    
    // Emit race result for parent to trigger animation
    console.log('🎬 Bet result received:', betResult)
    if (betResult && betResult.raceResult) {
      console.log('🎬 Emitting race result for animation:', betResult.raceResult)
      emit('raceCompleted', {
        raceResult: betResult.raceResult,
        playerShip: playerShipId,
        betAmount: playerBetAmount,
        actualPayout: betResult.actualPayout,
        jackpotTier: betResult.jackpotTier,
        jackpotAmount: betResult.jackpotAmount
      })
    } else {
      console.log('❌ No race result in bet result:', betResult)
    }
    
  } catch (err: any) {
    error.value = err.message || 'Failed to place bet'
  } finally {
    placingBet.value = false
  }
}

const handleSwitchNetwork = async () => {
  try {
    await switchToSomniaTestnet()
  } catch (err: any) {
    error.value = err.message || 'Failed to switch network'
  }
}

const openSomniaNetwork = () => {
  window.open('https://testnet.somnia.network/', '_blank')
}

const loadBettingData = async () => {
  if (!isConnected.value) return
  
  try {
    // Load current race info
    const currentRaceInfo = await getCurrentRaceInfo()
    if (currentRaceInfo) {
      console.log('Current race info:', currentRaceInfo)
      raceInfo.value = currentRaceInfo
    }
    
    // Load ship bets for current race
    const shipBetsData = await getShipBets(currentRaceId.value)
    if (shipBetsData && Array.isArray(shipBetsData)) {
      for (let i = 0; i < 8; i++) {
        shipBets.value[i + 1] = shipBetsData[i] || '0'
      }
    }
    
    // Load player bets
    const playerBetsData = await getPlayerBets(currentRaceId.value)
    if (playerBetsData) {
      playerBets.value = [playerBetsData.amount]
    } else {
      playerBets.value = []
    }
    
    console.log('Betting data loaded:', { shipBets: shipBets.value, playerBets: playerBets.value })
  } catch (err) {
    console.error('Failed to load betting data:', err)
  }
}

const loadPlayerData = async () => {
  if (!isConnected.value) return
  
  try {
    const [stats, achievements] = await Promise.all([
      getPlayerStats(),
      getPlayerAchievementCount()
    ])
    
    playerStats.value = stats
    achievementCount.value = achievements
    
    console.log('Player data loaded:', { stats, achievements })
  } catch (err) {
    console.error('Failed to load player data:', err)
  }
}

const loadJackpotData = async () => {
  if (!isConnected.value) return
  
  try {
    const jackpots = await getJackpotAmounts()
    jackpotAmounts.value = jackpots
    console.log('Jackpot amounts loaded:', jackpots)
  } catch (err) {
    console.error('Failed to load jackpot data:', err)
  }
}

// Faucet handler
const claimFaucetHandler = async () => {
  claiming.value = true
  error.value = ''
  
  try {
    await claimFaucet()
    hasClaimed.value = true
    // Refresh balances after claiming
    setTimeout(async () => {
      if (isConnected.value) {
        await updateBalance()
        await loadBettingData()
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to claim faucet'
  } finally {
    claiming.value = false
  }
}

// Approval handler
const approveTokensHandler = async () => {
  approving.value = true
  error.value = ''
  
  try {
    await approveSpiralTokens() // Approve unlimited tokens
    // Refresh balance after approval
    setTimeout(() => {
      if (isConnected.value) {
        loadBettingData()
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to approve tokens'
  } finally {
    approving.value = false
  }
}

// Check faucet status
const checkFaucetStatus = async () => {
  if (isConnected.value) {
    try {
      hasClaimed.value = await hasClaimedFaucet()
    } catch (err) {
      console.error('Failed to check faucet status:', err)
    }
  }
}

// Check username status
const checkUsernameStatus = async () => {
  if (isConnected.value) {
    try {
      hasUsername.value = await playerHasUsername()
      console.log('🔍 Username check result - hasUsername:', hasUsername.value)
      
      if (hasUsername.value) {
        playerUsername.value = await getUsername()
        console.log('✅ Player username found:', playerUsername.value)
        showUsernameModal.value = false // Ensure modal is hidden
      } else {
        console.log('❌ Player has no username - showing registration modal')
        showUsernameModal.value = true
      }
    } catch (err) {
      console.error('Failed to check username status:', err)
    }
  }
}

// Register username handler
const handleRegisterUsername = async () => {
  if (!usernameInput.value.trim()) {
    usernameError.value = 'Username cannot be empty'
    return
  }
  
  if (usernameInput.value.length > 20) {
    usernameError.value = 'Username must be 20 characters or less'
    return
  }
  
  registeringUsername.value = true
  usernameError.value = ''
  
  try {
    await registerUsername(usernameInput.value.trim())
    
    // Update state
    hasUsername.value = true
    playerUsername.value = usernameInput.value.trim()
    showUsernameModal.value = false
    usernameInput.value = ''
    
    console.log('Username registered successfully:', playerUsername.value)
  } catch (err: any) {
    usernameError.value = err.message || 'Failed to register username'
    console.error('Username registration failed:', err)
  } finally {
    registeringUsername.value = false
  }
}

// Skip username registration
const skipUsernameRegistration = () => {
  showUsernameModal.value = false
  console.log('Username registration skipped')
  // Mark as if user has username to prevent re-prompting
  hasUsername.value = true
}

// ==================== MATCH HISTORY FUNCTIONS ====================

const openMatchHistory = async (playerAddress?: string, displayName?: string) => {
  selectedPlayerForHistory.value = displayName || (playerAddress ? formatAddress(playerAddress) : 'Your History')
  showMatchHistoryModal.value = true
  loadingMatchHistory.value = true
  
  try {
    const { matches } = await getPlayerMatchHistory(playerAddress, 0, 20)
    matchHistory.value = matches
  } catch (error) {
    console.error('Failed to load match history:', error)
    matchHistory.value = []
  } finally {
    loadingMatchHistory.value = false
  }
}

const closeMatchHistory = () => {
  showMatchHistoryModal.value = false
  matchHistory.value = []
  selectedPlayerForHistory.value = ''
}

// ==================== LEADERBOARDS FUNCTIONS ====================

const openLeaderboards = async () => {
  showLeaderboardsModal.value = true
  loadingLeaderboards.value = true
  
  try {
    const data = await getTopPlayersByWinnings(20)
    leaderboardData.value = data
  } catch (error) {
    console.error('Failed to load leaderboards:', error)
    leaderboardData.value = { players: [], usernames: [], winnings: [] }
  } finally {
    loadingLeaderboards.value = false
  }
}

const closeLeaderboards = () => {
  showLeaderboardsModal.value = false
  leaderboardData.value = { players: [], usernames: [], winnings: [] }
}

const openPlayerHistory = (playerAddress: string, username?: string) => {
  closeLeaderboards()
  const displayName = username || formatAddress(playerAddress)
  openMatchHistory(playerAddress, displayName)
}

// ==================== PLAYER STATISTICS FUNCTIONS ====================

const openPlayerStatistics = async () => {
  showPlayerStatisticsModal.value = true
  loadingPlayerStatistics.value = true
  
  try {
    // Player stats are already loaded in loadPlayerData()
    // Just ensure they're up to date
    await loadPlayerData()
  } catch (error) {
    console.error('Failed to load player statistics:', error)
  } finally {
    loadingPlayerStatistics.value = false
  }
}

const closePlayerStatistics = () => {
  showPlayerStatisticsModal.value = false
}

// ==================== HELPER FUNCTIONS ====================

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const getPlacementText = (placement: number) => {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  return ordinals[placement] || `${placement}th`
}

const getPlacementColor = (placement: number) => {
  switch (placement) {
    case 1: return 'text-yellow-400'
    case 2: return 'text-gray-300'
    case 3: return 'text-amber-600'
    case 4: return 'text-blue-400'
    default: return 'text-gray-400'
  }
}



// Initialize
onMounted(() => {
  if (isConnected.value) {
    loadBettingData()
    loadPlayerData()
    loadJackpotData()
    checkFaucetStatus()
    checkUsernameStatus() // Check username on mount if already connected
    // Reset allowance state when connecting
    needsApproval.value = false
    approvalPending.value = false
    allowanceChecked.value = false
    // Check allowance if ship and amount are already selected
    if (selectedShip.value && betAmount.value) {
      checkAllowanceIfReady()
    }
  }
})

// Watch for connection changes to reload all data
watch(isConnected, () => {
  if (isConnected.value) {
    loadBettingData()
    loadPlayerData()
    loadJackpotData()
    checkFaucetStatus()
    checkUsernameStatus() // Check username when connection changes
    // Reset allowance state when connecting
    needsApproval.value = false
    approvalPending.value = false
    allowanceChecked.value = false
    // Check allowance if ship and amount are already selected
    if (selectedShip.value && betAmount.value) {
      checkAllowanceIfReady()
    }
  }
})

// Watch for race ID changes to reload betting data
watch(currentRaceId, () => {
  if (isConnected.value) {
    loadBettingData()
  }
})

// Watch for bet amount changes to reset allowance state
watch(betAmount, () => {
  if (allowanceChecked.value) {
    // Reset allowance state when bet amount changes
    needsApproval.value = false
    approvalPending.value = false
    allowanceChecked.value = false
  }
})

// Watch for both ship and bet amount to check allowance
watch([selectedShip, betAmount], () => {
  if (isConnected.value && selectedShip.value && betAmount.value) {
    // Small delay to ensure the values are set
    setTimeout(() => {
      checkAllowanceIfReady()
    }, 100)
  }
})
</script> 