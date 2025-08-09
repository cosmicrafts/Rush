# Race Reconstruction Interface Guide

This guide explains how to use the race reconstruction interface to connect the blockchain contracts with the frontend animation.

## 🏗️ Architecture Overview

The race reconstruction interface bridges the gap between:
- **Smart Contract**: Returns `RaceResult` with `turnEvents[]` array containing turn-by-turn data
- **Frontend**: Expects `RaceState[]` and `RaceEvent[]` for animation in `RaceTrack.vue`

## 🔧 Setup Instructions

### 1. Deploy Contracts Locally

Start a local Hardhat node in one terminal:
```bash
npx hardhat node
```

Deploy the modular contracts in another terminal:
```bash
npx hardhat run scripts/deploy-modular.js --network localhost
```

### 2. Update Frontend Configuration

Update the contract address in `composables/useWeb3.ts`:
```typescript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

## 🎮 How It Works

### Contract Data Format
The smart contract returns race data in this format:
```solidity
struct RaceResult {
    uint8 winner;                    // Winning ship ID (0-7)
    uint8[8] placements;            // Ship IDs in finish order
    RaceTurnEvent[] turnEvents;     // Turn-by-turn movement data
    uint256 totalEvents;            // Number of events
}

struct RaceTurnEvent {
    uint8 turn;                     // Turn number (1-10)
    uint8 shipId;                   // Ship that moved (0-7)
    uint256 moveAmount;             // Distance moved this turn
    uint256 distance;               // Total distance after move
    uint8 chaosEventType;          // Chaos factor triggered (0 = none)
    uint8 targetShipId;            // Target of chaos effect (for Graviton Brake)
}
```

### Frontend Integration

#### 1. Place Bet and Get Race Data
```typescript
// In your Vue component
const { placeBetAndGetRace, reconstructRaceFromBlockchain } = useWeb3()

const runBlockchainRace = async (shipId: number, amount: string) => {
  try {
    // Place bet and get transaction receipt
    const receipt = await placeBetAndGetRace(shipId, amount)
    
    // Extract race result from receipt events or call debugRaceSimulation
    const contractResult = await getDebugRaceSimulation()
    
    // Convert to frontend format
    const raceData = reconstructRaceFromBlockchain(contractResult)
    
    // Animate the race
    await animateRaceProgression(raceData, (turn, states, events) => {
      // Update your RaceTrack component with current turn data
      updateRaceTrack(turn, states, events)
    })
    
  } catch (error) {
    console.error('Race failed:', error)
  }
}
```

#### 2. Race Reconstruction Function
The `reconstructRaceFromBlockchain()` function converts contract data into frontend format:

```typescript
const raceData = reconstructRaceFromBlockchain(contractResult)
// Returns:
{
  raceStates: RaceState[],     // 8 ships with current positions
  winner: RaceState,           // Winning ship details
  replayLog: RaceEvent[],      // Turn-by-turn events for animation
  chaosEvents: ChaosEvent[],   // Chaos factors that triggered
  placements: number[]         // Final finish order
}
```

#### 3. Animation Integration
```typescript
// Update your race track component
const updateRaceTrack = (turn: number, states: RaceState[], events: ChaosEvent[]) => {
  // Update ship positions
  ships.value = states
  
  // Show chaos events
  chaosEvents.value = events
  
  // Update turn indicator
  currentTurn.value = turn
  
  // Update place indicators
  placeIndicators.value = states
    .filter(ship => ship.distance >= 1000)
    .sort((a, b) => a.finalTurn - b.finalTurn)
}
```

## 🧪 Testing

### Run Race Reconstruction Test
```bash
npx hardhat run scripts/test-race-reconstruction.js --network hardhat
```

This test demonstrates:
- ✅ Contract deployment and setup
- ✅ Debug race simulation
- ✅ Betting with race result extraction
- ✅ Turn-by-turn race reconstruction
- ✅ Progress visualization with chaos events

### Expected Output
```
🎮 Testing Race Reconstruction Interface
=======================================
👤 Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🎮 Player: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

📦 Deploying modular contracts...
✅ SpiralToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
...

🧪 Test 1: Debug Race Simulation
================================
🏁 Winner: Ship 3
📊 Total Events: 80
🏆 Placements: [3, 1, 0, 2, 4, 5, 6, 7]

🎲 Test 2: Place Bet and Get Race Result
========================================
💰 Placing bet of 100 SPIRAL on Ship 3 (Phantom)
✅ Bet placed successfully!
🎉 Player WON the race!

🔄 Test 3: Race Reconstruction Demo
===================================
🏁 Reconstructing race with winner: Phantom

🎬 Turn-by-Turn Race Progression:
================================

⏰ Turn 1:
   Comet: moves 67 → 67 [██████░░░░░░░░░░░░░░] 6%
   Juggernaut: moves 58 → 58 [█████░░░░░░░░░░░░░░░] 5%
   Shadow: moves 72 → 72 🔥 Overdrive! [███████░░░░░░░░░░░░░] 7%
   ...

🏆 Final Standings:
==================
🥇 1st: Phantom
🥈 2nd: Juggernaut
🥉 3rd: Comet
...
```

## 🎯 Key Features

### ✅ Complete Race Data
- Turn-by-turn ship movements
- Chaos factor triggers and effects
- Exact finish times and placements
- Winner determination

### ✅ Frontend-Ready Format
- Converts contract data to `RaceState[]` format
- Provides `ChaosEvent[]` for visual effects
- Maintains ship colors, names, and stats
- Compatible with existing `RaceTrack.vue` component

### ✅ Animation Support
- `animateRaceProgression()` provides turn-by-turn callbacks
- Customizable timing (currently 1 second per turn)
- Real-time state updates for smooth animation
- Chaos event synchronization

### ✅ Chaos Factor Integration
- 9 different chaos effects properly mapped
- Visual indicators for each chaos type
- Target ship tracking (for Graviton Brake)
- Event timing synchronized with movements

## 🚀 Deployment Options

### Option 1: Local Hardhat Node (Recommended for Development)
- Free testing with unlimited tokens
- Fast transaction confirmations
- Full debugging capabilities
- No real ETH required

### Option 2: Sepolia Testnet (Recommended for Demo)
- Real blockchain environment
- Requires Sepolia ETH for gas
- Shareable with others
- More realistic testing conditions

### Option 3: Mainnet (Production)
- Real value transactions
- High gas costs
- Production-ready environment
- Requires real ETH and SPIRAL tokens

## 🎮 Frontend Usage Example

```vue
<template>
  <div class="race-container">
    <RaceTrack 
      :ships="currentRaceState" 
      :chaosEvents="currentChaosEvents"
      :placeIndicators="placeIndicators" 
    />
    
    <BettingInterface 
      @place-bet="handleBet"
      :loading="raceInProgress"
    />
  </div>
</template>

<script setup lang="ts">
const { 
  placeBetAndGetRace, 
  reconstructRaceFromBlockchain, 
  animateRaceProgression,
  getDebugRaceSimulation 
} = useWeb3()

const currentRaceState = ref<RaceState[]>([])
const currentChaosEvents = ref<ChaosEvent[]>([])
const raceInProgress = ref(false)

const handleBet = async (shipId: number, amount: string) => {
  raceInProgress.value = true
  
  try {
    // Place bet and get race result
    const receipt = await placeBetAndGetRace(shipId, amount)
    
    // Get full race data
    const contractResult = await getDebugRaceSimulation()
    const raceData = reconstructRaceFromBlockchain(contractResult)
    
    // Animate the race
    await animateRaceProgression(raceData, (turn, states, events) => {
      currentRaceState.value = states
      currentChaosEvents.value = events
    })
    
    // Show final results
    showRaceResults(raceData.winner, raceData.placements)
    
  } catch (error) {
    console.error('Race failed:', error)
  } finally {
    raceInProgress.value = false
  }
}
</script>
```

## 🔧 Troubleshooting

### Common Issues

**Contract Address Mismatch**
- Ensure `CONTRACT_ADDRESS` in `useWeb3.ts` matches deployed contract
- Check network (localhost vs Sepolia)

**Transaction Reverts**
- Ensure sufficient SPIRAL token balance
- Check token approval for contract spending
- Verify bet amount is within MIN_BET and MAX_BET limits

**Animation Issues**
- Adjust timing in `animateRaceProgression()`
- Ensure turn data is properly filtered
- Check ship state updates in callback

**Missing Chaos Events**
- Verify chaos event mapping in `getChaosEventText()`
- Check event filtering in race reconstruction
- Ensure target ship handling for Graviton Brake

The race reconstruction interface is now ready for seamless blockchain-to-frontend integration! 🎉
