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
            @click="handlePlaceBet"
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
import { onMounted, watch } from 'vue'
import { useBetting } from '~/composables/useBetting'
import { ethers } from 'ethers'

// Define emits
const emit = defineEmits<{
  raceCompleted: [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }]
}>()

// Use the betting composable
const {
  // State
  betError,
  showWalletOptions,
  connecting,
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
  ships,

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
  frontendToContractShipId,
  getShipName,
  connectMetaMaskHandler,
  connectCoinbaseHandler,
  placeBet,
  handleSwitchNetwork,
  openSomniaNetwork,
  loadBettingData,
  loadPlayerData,
  loadJackpotData,
  claimFaucetHandler,
  checkFaucetStatus,
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
  currentRaceId,
  disconnect
} = useBetting()

// Handle place bet and emit race result
const handlePlaceBet = async () => {
  const result = await placeBet()
  if (result) {
    emit('raceCompleted', result)
  }
}

// Initialize
onMounted(() => {
  if (isConnected.value) {
    loadBettingData()
    loadPlayerData()
    loadJackpotData()
    checkFaucetStatus()
    checkUsernameStatus()
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
    checkUsernameStatus()
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