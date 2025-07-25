# RaceTrack Smart Contract Guide 🚀

## Overview

The `RaceTrack.sol` contract implements a decentralized betting system for spaceship races on the Somnia Testnet. Players bet on 8 unique spaceships, and winners receive proportional payouts from the prize pool.

## Contract Address

**Somnia Testnet**: `0x28c91484b55b6991d8f5e4fe2ff313024532537e`

## How It Works

### 1. **Race Structure**
- Each race has a unique `raceId` (starts at 0)
- Players place bets on ships (1-8) during the betting phase
- Owner starts a new race when ready
- Race simulation happens off-chain
- Owner sets the winner
- Winners claim their proportional winnings

### 2. **Betting System**
- **Min Bet**: 0.001 STT
- **Max Bet**: 1.0 STT
- **House Fee**: 5% (taken from total bets)
- Players can bet on multiple ships in the same race
- All bets are locked until race completion

### 3. **Prize Distribution**
- Total Prize = Total Bets - House Fee (5%)
- Winners get proportional share based on their bet amount
- Formula: `(Player Bet / Ship Total Bets) * Total Prize`

## Contract Functions

### **Player Functions**

#### `placeBet(uint8 shipId)`
- **Purpose**: Place a bet on a specific ship
- **Parameters**: `shipId` (1-8)
- **Value**: Bet amount in STT (0.001-1.0)
- **Requirements**: 
  - Valid ship ID (1-8)
  - Bet amount within limits
  - Race not finished
- **Events**: `BetPlaced(address player, uint8 shipId, uint256 amount)`

#### `claimWinnings(uint256 raceId)`
- **Purpose**: Claim winnings for a completed race
- **Parameters**: `raceId` - the race to claim from
- **Requirements**: 
  - Race must be finished
  - Player must have winning bets
  - Bets not already claimed
- **Events**: `WinningsClaimed(address player, uint256 amount)`

### **Owner Functions** (Only contract owner)

#### `startNewRace()`
- **Purpose**: Start a new race
- **Requirements**: 
  - Current race has bets
  - Current race not finished
- **Events**: `RaceStarted(uint256 raceId)`

#### `finishRace(uint8 winner)`
- **Purpose**: Set the winner and finish the race
- **Parameters**: `winner` (1-8) - winning ship ID
- **Requirements**: 
  - Valid winner (1-8)
  - Race not already finished
  - Race has bets
- **Events**: `RaceFinished(uint256 raceId, uint8 winner, uint256 totalPrize)`

### **View Functions**

#### `getRaceInfo(uint256 raceId)`
Returns race information:
```solidity
returns (
    uint8 winner,      // Winning ship ID (0 if not finished)
    uint256 totalBets, // Total bets in race
    uint256 totalPrize, // Prize pool (after house fee)
    bool finished      // Race completion status
)
```

#### `getShipBets(uint256 raceId, uint8 shipId)`
Returns total bets on a specific ship in a race.

#### `getPlayerBets(uint256 raceId, address player)`
Returns array of player's bets for a race:
```solidity
returns (Bet[] memory) // Array of {player, shipId, amount, claimed}
```

#### `getShip(uint8 shipId)`
Returns ship information:
```solidity
returns (
    uint8 id,           // Ship ID
    string name,        // Ship name
    uint16 initialSpeed, // Base speed
    uint8 acceleration,  // Acceleration rate
    string chaosFactor,  // Special ability
    uint8 chaosChance    // Chance to trigger (percentage)
)
```

#### `currentRaceId()`
Returns the current active race ID.

## The 8 Spaceships

| ID | Name | Speed | Accel | Chaos Factor | Chance |
|----|------|-------|-------|--------------|--------|
| 1 | The Comet | 78 | 11 | Overdrive | 10% |
| 2 | The Juggernaut | 85 | 9 | Unstable Engine | 25% |
| 3 | The Shadow | 82 | 14 | Slipstreamer | 20% |
| 4 | The Phantom | 69 | 8 | Quantum Tunneling | 8% |
| 5 | The Phoenix | 90 | 12 | Last Stand Protocol | 20% |
| 6 | The Vanguard | 80 | 10 | Micro-warp Engine | 65% |
| 7 | The Wildcard | 80 | 13 | Rogue AI | 20% |
| 8 | The Apex | 95 | 12 | Graviton Brake | 75% |

## Frontend Integration

### **Web3 Composable Functions**

The `useWeb3.ts` composable provides these functions:

```typescript
// Connect wallet
await connectMetaMask()

// Place a bet
await placeBet(shipId, amount) // amount in STT string

// Get race information
const raceInfo = await getCurrentRaceInfo()

// Get ship betting totals
const shipBets = await getShipBets(raceId, shipId)

// Get player's bets
const playerBets = await getPlayerBets(raceId)

// Claim winnings
await claimWinnings(raceId)

// Get ship information
const ship = await getShip(shipId)
```

### **Contract State**

The composable provides reactive contract state:

```typescript
const {
  isConnected,        // Wallet connection status
  currentRaceId,      // Current race ID
  contractInfo,       // { minBet, maxBet, houseFee }
  formattedBalance,   // Player's STT balance
  isCorrectNetwork    // On Somnia Testnet
} = useWeb3()
```

## Testing the Contract

Run the test script to verify contract functionality:

```bash
node test-contract.js
```

Expected output:
```
🔗 Connecting to Somnia Testnet...
✅ Connected to contract: 0x28c91484b55b6991d8f5e4fe2ff313024532537e
📊 Testing contract functions...
Current Race ID: 0
Min Bet: 0.001 STT
Max Bet: 1.0 STT
House Fee: 5 %
🏁 Current Race Info:
  Winner: 0
  Total Bets: 0.0 STT
  Total Prize: 0.0 STT
  Finished: false
🚀 Ship 1 Info:
  ID: 1
  Name: The Comet
  Initial Speed: 78
  Acceleration: 11
  Chaos Factor: Overdrive
  Chaos Chance: 10 %
✅ All contract tests passed!
```

## Game Flow Example

1. **Player connects wallet** → MetaMask connects to Somnia Testnet
2. **Player places bet** → Calls `placeBet(3, "0.1")` (bets 0.1 STT on ship 3)
3. **Owner starts race** → Calls `startNewRace()` (creates race #1)
4. **Race simulation** → Off-chain simulation determines winner
5. **Owner finishes race** → Calls `finishRace(3)` (ship 3 wins)
6. **Player claims winnings** → Calls `claimWinnings(1)` (claims from race #1)

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Only owner can start/finish races
- **Input validation**: All parameters validated
- **Safe transfers**: Uses `call` for ETH transfers
- **Event logging**: All important actions logged

## Gas Optimization

- Efficient storage layout
- Minimal external calls
- Batch operations where possible
- Optimized for Somnia's high TPS

## Error Handling

Common error messages:
- `"Invalid ship ID"` - Ship ID must be 1-8
- `"Bet too small"` - Below minimum bet (0.001 STT)
- `"Bet too large"` - Above maximum bet (1.0 STT)
- `"Race already finished"` - Cannot bet on finished race
- `"No winnings to claim"` - No winning bets to claim

## Next Steps

1. **Deploy frontend** to production
2. **Test betting flow** with real STT tokens
3. **Implement race simulation** integration
4. **Add admin interface** for race management
5. **Monitor contract events** for analytics 