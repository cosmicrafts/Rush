# 🚀 Casino-Style Spaceship Racing Game

A fully on-chain, single-player spaceship racing game with casino-style jackpot mechanics, achievements, and ERC20 token integration. Built for the Somnia Hackathon with high TPS optimization.

## 🎮 Game Overview

**Cosmicrafts Rush** is a provably fair, single-player spaceship racing game where players bet SPIRAL tokens on one of 8 unique spaceships. Each race is resolved immediately using on-chain randomness, with a chance to hit a massive jackpot!

### 🎯 Key Features

- **True Single-Player Experience**: Race independently against contract odds, no pooling
- **Tiered Jackpot System**: Mini (5%), Mega (0.5%), Super (0.1%) jackpots
- **8 Unique Spaceships**: Each with different odds and win rates
- **NFT Achievement System**: 13 different badges as NFTs + token rewards
- **ERC20 Integration**: Bet and win with SPIRAL tokens
- **Provably Fair**: All randomness generated on-chain using block data
- **Gas Optimized**: Designed for high TPS networks like Somnia

## 🚀 Spaceships & Odds

| Spaceship | Odds | Win Rate | Payout |
|-----------|------|----------|---------|
| The Comet | 3.0x | 25% | 300% |
| The Juggernaut | 4.0x | 20% | 400% |
| The Shadow | 6.0x | 15% | 600% |
| The Phantom | 7.0x | 12% | 700% |
| The Phoenix | 9.0x | 10% | 900% |
| The Vanguard | 11.0x | 8% | 1100% |
| The Wildcard | 18.0x | 5% | 1800% |
| The Apex | 18.0x | 5% | 1800% |

## 🎰 Tiered Jackpot System

- **Mini Jackpot**: 5% chance (1 in 20 races) - 60% of jackpot funds
- **Mega Jackpot**: 0.5% chance (1 in 200 races) - 30% of jackpot funds  
- **Super Jackpot**: 0.1% chance (1 in 1000 races) - 10% of jackpot funds
- **Funding**: 5% of every bet distributed across all jackpots
- **Payout**: Entire jackpot amount when triggered
- **Reset**: Individual jackpot resets to 0 after being won

## 🏆 NFT Achievement System

### Dual Reward System
- **NFT Badge**: Unique achievement NFT with metadata
- **Token Reward**: SPIRAL tokens for each achievement
- **Tradeable**: NFTs can be traded on marketplaces

### Spaceship Specialist Achievements
- **Comet Master**: Win 10 races with The Comet (NFT + 100 SPIRAL)
- **Juggernaut Destroyer**: Win 5 races with The Juggernaut (NFT + 150 SPIRAL)
- **Shadow Hunter**: Win 8 races with The Shadow (NFT + 120 SPIRAL)
- **Phantom Phantom**: Win 3 races with The Phantom (NFT + 200 SPIRAL)
- **Phoenix Rising**: Win 5 races with The Phoenix (NFT + 180 SPIRAL)
- **Vanguard Veteran**: Win 7 races with The Vanguard (NFT + 160 SPIRAL)
- **Wildcard Wizard**: Win 2 races with The Wildcard (NFT + 300 SPIRAL)
- **Apex Predator**: Win 5 races with The Apex (NFT + 250 SPIRAL)

### Milestone Achievements
- **Novice Racer**: Complete 5 races (NFT + 50 SPIRAL)
- **Experienced Pilot**: Complete 25 races (NFT + 200 SPIRAL)
- **Veteran Captain**: Complete 100 races (NFT + 500 SPIRAL)
- **High Roller**: Win 1000+ SPIRAL in a single race (NFT + 1000 SPIRAL)
- **Cosmic Luck**: Hit any jackpot (NFT + 1000 SPIRAL)

## 🎲 How to Play

1. **Get SPIRAL Tokens**: Obtain SPIRAL tokens for betting
2. **Choose Spaceship**: Select one of 8 spaceships (0-7)
3. **Place Bet**: Bet between 10-1000 SPIRAL tokens
4. **Race Resolution**: Winner determined instantly using on-chain randomness
5. **Collect Winnings**: If your spaceship wins, receive payout based on odds
6. **Jackpot Chance**: Multiple chances to win tiered jackpots
7. **Unlock Achievements**: Earn NFT badges and token rewards for milestones

## 📊 Game Mechanics

### Betting Limits
- **Minimum Bet**: 10 SPIRAL
- **Maximum Bet**: 1000 SPIRAL
- **House Edge**: 5% (goes to jackpot)

### Payout Calculation
```
Payout = Bet Amount × Spaceship Odds
Example: 100 SPIRAL bet on The Wildcard (18x odds) = 1800 SPIRAL payout
```

### Randomness Source
Uses verifiable on-chain randomness combining:
- Block hash
- Block timestamp
- Player address
- Race ID

## 🛠️ Technical Architecture

### Smart Contracts

#### SpiralToken.sol
- ERC20 token with 18 decimals
- 1 billion total supply
- Mint function for achievement rewards

#### SpaceshipRace.sol
- Main game contract
- Betting and race resolution logic
- Jackpot management
- Achievement tracking
- Player statistics

### Key Functions

```solidity
// Place a bet and run race immediately
function placeBet(uint8 spaceshipId, uint256 amount) external

// Get player statistics
function getPlayerStats(address player) external view returns (...)

// Get game statistics
function getGameStats() external view returns (...)

// Get spaceship information
function getSpaceshipInfo(uint8 spaceshipId) external view returns (...)
```

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- Hardhat
- Private key with testnet ETH

### Environment Setup
1. Copy `env.sample` to `.env`
2. Fill in your configuration:
```bash
SEPOLIA_RPC_URL=your_sepolia_rpc_url
SOMNIA_RPC_URL=your_somnia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Local Testing
```bash
# Start local node
npx hardhat node

# Run comprehensive tests
npm run test:casino

# Deploy locally
npm run deploy:casino:local
```

### Testnet Deployment

#### Sepolia (Testing)
```bash
# Deploy to Sepolia
npm run deploy:casino:sepolia

# Verify contracts
npx hardhat verify --network sepolia <SPIRAL_TOKEN_ADDRESS>
npx hardhat verify --network sepolia <SPACESHIP_RACE_ADDRESS> "<SPIRAL_TOKEN_ADDRESS>"
```

#### Somnia Testnet (Hackathon)
```bash
# Deploy to Somnia
npm run deploy:casino:somnia

# Verify contracts
npx hardhat verify --network somniaTestnet <SPIRAL_TOKEN_ADDRESS>
npx hardhat verify --network somniaTestnet <SPACESHIP_RACE_ADDRESS> "<SPIRAL_TOKEN_ADDRESS>"
```

## 🧪 Testing

### Comprehensive Test Suite
The test suite covers:
- ✅ Contract initialization
- ✅ Spaceship information
- ✅ Token distribution
- ✅ Basic betting and race simulation
- ✅ Player statistics
- ✅ Multiple players betting
- ✅ Achievement system
- ✅ Jackpot testing (50 races)
- ✅ Edge cases and error handling
- ✅ Final statistics and summary

### Test Commands
```bash
# Run casino game tests
npm run test:casino

# Run original race simulation tests
npm run test:race

# Run all tests
npm test
```

## 📈 Game Statistics

The contract tracks comprehensive statistics:
- Total races played
- Total betting volume
- Current jackpot amount
- Player-specific stats:
  - Total races
  - Total winnings
  - Biggest single win
  - Spaceship-specific wins
  - Achievement rewards earned
  - Jackpot hits

## 🔧 Owner Functions

The contract owner can:
- Update spaceship odds
- Update spaceship win rates
- Withdraw accumulated fees
- Emergency withdraw all tokens

## 🎯 Hackathon Features

### Somnia Optimization
- **High TPS Ready**: Gas-optimized for 1M+ TPS
- **Fast Finality**: Sub-second race resolution
- **Scalable**: Single-player design reduces network load
- **Cost Efficient**: Minimal gas usage per race

### On-Chain Everything
- **No Off-Chain Dependencies**: All logic in smart contracts
- **Provably Fair**: Verifiable randomness
- **Transparent**: All game state on-chain
- **Decentralized**: No central authority needed

## 🎮 Frontend Integration

### Web3 Integration
```javascript
// Connect to contract
const spaceshipRace = new ethers.Contract(address, abi, signer);

// Place bet
await spiralToken.approve(spaceshipRace.address, betAmount);
await spaceshipRace.placeBet(spaceshipId, betAmount);

// Get player stats
const stats = await spaceshipRace.getPlayerStats(playerAddress);

// Get game stats
const gameStats = await spaceshipRace.getGameStats();
```

### Events to Listen For
- `BetPlaced`: When a player places a bet
- `RaceResult`: When a race completes
- `AchievementUnlocked`: When player earns achievement
- `JackpotHit`: When jackpot is triggered

## 🏆 Hackathon Submission

### Demo Video Requirements
- Show single-player betting experience
- Demonstrate jackpot trigger
- Display achievement unlocking
- Show real-time race resolution

### Deployment Checklist
- [ ] Deploy to Somnia Testnet
- [ ] Verify contracts on explorer
- [ ] Test all game features
- [ ] Record demo video
- [ ] Update README with live links

## 📞 Support

For hackathon support:
- **Discord**: [Somnia Discord](https://discord.com/invite/somnia)
- **Telegram**: [Somnia Telegram](https://t.me/+XHq0F0JXMyhmMzM0)
- **Twitter**: [@SomniaEco](https://x.com/SomniaEco)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Somnia Hackathon**

*May the odds be ever in your favor, space pilot!* 🚀✨
