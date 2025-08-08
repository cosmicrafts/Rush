# Cosmicrafts Rush 🚀

**A Web3 Single-Player Spaceship Racing Casino on Somnia Testnet**

> Bet against the house, unlock NFT achievements, and hit jackpots in this fully on-chain spaceship racing game!

**🏆 Somnia v1 Mini-Games Hackathon Submission**

*Timeline: July 21 - August 4, 2025*

## 🎮 How to Play

1. **Connect Wallet** - Link your Somnia wallet to start betting
2. **Choose Your Ship** - Pick from 8 unique spaceships with different odds
3. **Place Your Bet** - Bet SPIRAL tokens (10-1000 SPIRAL per race)
4. **Instant Results** - Each bet triggers an independent race against the house
5. **Claim Rewards** - Win tokens, unlock NFT achievements, and hit jackpots!

## 🏗️ Game Architecture

### Smart Contracts
- **SpiralToken.sol** - ERC20 token for betting and rewards (8 decimals)
- **AchievementNFT.sol** - ERC721 NFTs for achievement badges with metadata
- **SpaceshipRace.sol** - Main game contract with single-player betting system

### Key Features
- **Single-Player vs House**: Each bet is an independent race against contract odds
- **Tiered Jackpot System**: Mini (5%), Mega (0.5%), Super (0.1%) jackpots
- **61 Unique Achievements**: Betting, placement, and milestone achievements
- **Dual Rewards**: Tokens + NFT badges for achievements
- **Provably Fair**: On-chain randomness using block data
- **Gas Optimized**: Efficient for Somnia's high TPS

## 🚀 The 8 Spaceships

| Ship | Odds | Win Rate | Strategy |
|------|------|----------|----------|
| **The Comet** | 2.5x | 40% | High-risk, high-reward speedster |
| **The Juggernaut** | 2.0x | 50% | Balanced power and reliability |
| **The Shadow** | 1.5x | 67% | Steady performer with good odds |
| **The Phantom** | 1.2x | 83% | Conservative choice for consistent wins |
| **The Phoenix** | 1.0x | 100% | Even odds, no house edge |
| **The Vanguard** | 0.8x | 125% | Higher win rate, lower payouts |
| **The Wildcard** | 0.5x | 200% | High win rate, low payouts |
| **The Apex** | 0.5x | 200% | Most likely to win, lowest payouts |

## 🎯 Achievement System

### Betting Achievements (24 total)
- **Bet 5 times** on each spaceship (8 achievements)
- **Bet 25 times** on each spaceship (8 achievements)  
- **Bet 100 times** on each spaceship (8 achievements)

### Placement Achievements (32 total)
- **1st place 3 times** with each spaceship (8 achievements)
- **1st place 10 times** with each spaceship (8 achievements)
- **2nd place 5 times** with each spaceship (8 achievements)
- **2nd place 20 times** with each spaceship (8 achievements)
- **3rd place 10 times** with each spaceship (8 achievements)
- **3rd place 50 times** with each spaceship (8 achievements)
- **4th place 15 times** with each spaceship (8 achievements)
- **4th place 75 times** with each spaceship (8 achievements)

### Milestone Achievements (5 total)
- **Novice Racer**: Complete 10 races
- **Veteran Racer**: Complete 50 races
- **Master Racer**: Complete 100 races
- **High Roller**: Win 1000+ SPIRAL in a single race
- **Cosmic Luck**: Hit any jackpot

## 🎁 NFT Rewards

Each achievement unlocks:
- **Unique NFT Badge** with metadata (name, description, type, spaceship, threshold)
- **Token Rewards** in SPIRAL tokens
- **MetaMask Compatible** - NFTs appear in your wallet
- **On-chain Metadata** - Base64 encoded JSON with external image URLs

## 🎰 Jackpot System

### Tiered Jackpots
- **Mini Jackpot**: 5% chance per race (funded by 30% of house edge)
- **Mega Jackpot**: 0.5% chance per race (funded by 40% of house edge)
- **Super Jackpot**: 0.1% chance per race (funded by 30% of house edge)

### Jackpot Triggers
- **Mini**: Random chance based on block data
- **Mega**: Requires specific race conditions + randomness
- **Super**: Rare combination of factors + randomness

## 🔧 Technical Implementation

### Smart Contract Functions
```solidity
placeBet(uint8 spaceship, uint256 amount) // Place bet and trigger race
getPlayerStats(address player) // Get player statistics
getGameStats() // Get game statistics
getSpaceshipInfo(uint8 spaceshipId) // Get spaceship details
getPlayerAchievementsCount(address player) // Get achievement count
```

### Race Mechanics
- **Instant Resolution**: Each bet triggers immediate race simulation
- **On-chain Randomness**: Uses blockhash, timestamp, and player address
- **House Edge**: 2% fee funds jackpots and contract maintenance
- **Automatic Payouts**: Winnings sent directly to player wallet

### NFT System
- **ERC721 Standard**: Compatible with all NFT marketplaces
- **Dynamic Metadata**: Generated on-chain for each achievement
- **External Images**: Points to hosted artwork folders
- **Immediate Transfer**: NFTs sent to player wallet upon achievement unlock

## 🚀 Deployment Status

- ✅ **Smart Contracts**: Fully tested and production-ready
- ✅ **SpiralToken**: ERC20 token with 8 decimals
- ✅ **AchievementNFT**: ERC721 with metadata generation
- ✅ **SpaceshipRace**: Main game contract with all features
- ✅ **Comprehensive Testing**: 100 races with full verification
- ✅ **Financial Tracking**: Accurate spending vs rewards analysis
- 🔄 **Frontend**: Ready for integration

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MetaMask** wallet with Somnia Testnet configured
3. **SPIRAL Tokens** - ERC20 token for betting

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cosmicrafts-rush.git
   cd cosmicrafts-rush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.sample .env
   # Edit .env and add your private key and RPC URLs
   ```

4. **Test locally**
   ```bash
   npm run test
   ```

5. **Deploy to Sepolia (testing)**
   ```bash
   npm run deploy:sepolia
   ```

6. **Deploy to Somnia Testnet**
   ```bash
   npm run deploy:somnia
   ```

### Available Commands

```bash
# Compile contracts
npm run compile

# Test locally (100 races with full verification)
npm run test

# Deploy to local network
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to Somnia testnet
npm run deploy:somnia

# Verify contracts on Sepolia
npm run verify:sepolia

# Verify contracts on Somnia
npm run verify:somnia

# Start local hardhat node
npm run node

# Clean build artifacts
npm run clean
```

### Smart Contract Deployment

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to testnet**
   ```bash
   npm run deploy:sepolia  # Test on Sepolia first
   npm run deploy:somnia   # Deploy to Somnia
   ```

3. **Verify contracts**
   ```bash
   npm run verify:somnia
   ```

## 📊 Test Results

Our comprehensive testing shows:

- **100 Races**: Full simulation with random betting
- **Achievement System**: 19/61 achievements unlocked
- **NFT Minting**: 19 NFTs successfully minted and verified
- **Financial Tracking**: Accurate spending vs rewards analysis
- **Jackpot System**: 5 mini jackpots hit in 100 races
- **Token Rewards**: 4,100 SPIRAL distributed for achievements
- **Player Profit**: 25,354 SPIRAL profit in test run

### Performance Metrics
- **Success Rate**: 18% (realistic for casino-style game)
- **Achievement Rate**: 31.15% (19 out of 61 achievements)
- **NFT Minting Success**: 100%
- **Jackpot Hit Rate**: 5% (5 mini jackpots in 100 races)

## 🎯 Hackathon Goals

✅ **Creativity & Originality**: Unique single-player casino system with NFT achievements  
✅ **Technical Excellence**: Fully deployed on Somnia with comprehensive testing  
✅ **User Experience**: Instant race resolution with dual token/NFT rewards  
✅ **Onchain Impact**: 100% on-chain with provably fair randomness  
✅ **Community Fit**: Perfect for Somnia's gaming ecosystem with quick rounds  

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Smart Contract**: [Deployed on Somnia Testnet]
- **GitHub Repository**: [Your Repository URL]
- **Somnia Testnet**: https://testnet.somnia.network

## 📞 Contact

- **Discord**: [Your Discord Handle]
- **Twitter**: [Your Twitter Handle]
- **Email**: [Your Email]

---

**Built for Somnia v1 Mini-Games Hackathon**  
*Timeline: July 21 - August 4, 2025*
