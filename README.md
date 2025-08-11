# ![Cosmic Rush 🚀](/public/ships/cosmicrush.webp)

**A Web3 Spaceship Racing Game on Somnia Testnet**

> Bet against the house, unlock NFT achievements, and hit jackpots in this fully on-chain spaceship racing game!

**🏆 Somnia v1 Mini-Games Hackathon Submission**

*Timeline: July 21 - August 11, 2025*

## 🎮 How to Play

### Step 1: Connect Your Wallet
1. **Install MetaMask** and configure it for Somnia Testnet
2. **Connect your wallet** to the Cosmic Rush dApp
3. **Automated switch to Somnia Testnet** (RPC: https://testnet.somnia.network)

### Step 2: Claim Your SPIRAL Tokens
1. **Click the faucet button** to claim 1,000 SPIRAL tokens
2. **Wait for confirmation** - tokens will appear in your wallet
3. **SPIRAL tokens** are used for all betting and rewards (8 decimals)

### Step 3: Choose Your Spaceship
1. **Browse the 8 unique spaceships** with different odds and chaos factors
2. **Study each ship's stats** - speed, acceleration, and special abilities
3. **Select your preferred ship** based on your risk tolerance

### Step 4: Place Your Bet
1. **Enter bet amount** (10-1,000 SPIRAL per race)
2. **Confirm your bet** - this triggers an instant race simulation
3. **Watch the race unfold** with real-time animations and chaos events

### Step 5: Claim Rewards
1. **Check your results** - win tokens based on ship placement
2. **Unlock achievements** - earn NFT badges for milestones
3. **Hit jackpots** - win massive payouts on rare combinations

## 🚀 The Build: An On-Chain Gaming Experience

Cosmic Rush is built as a decentralized application (dApp) with a two-part architecture: a robust on-chain smart contract on the Somnia Testnet handling all game logic and finances, and a reactive, modern frontend built with Nuxt 3.

### Smart Contract Architecture
- **SpaceshipRace.sol** - Main game contract with betting, racing, and jackpot systems
- **ShipConfiguration.sol** - Centralized ship stats and chaos factor management
- **ChaosManager.sol** - Handles all chaos factor calculations and random events
- **AchievementNFT.sol** - ERC721 NFTs for achievement badges with metadata
- **SpiralToken.sol** - ERC20 token for betting and rewards (8 decimals)

### Frontend Technology Stack
- **Nuxt 3** - Vue.js framework with SSR and modern tooling
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with cosmic theme
- **Web3 Integration** - MetaMask wallet connection and contract interaction

## 🚀 The 8 Spaceships

Each spaceship has unique characteristics, chaos factors, and betting odds. Click on any ship to view detailed stats!

| Ship | Image | Odds | Win Rate | Chaos Factor | Image | Strategy |
|------|-------|------|----------|--------------|-------|----------|
| **The Comet** | ![The Comet](/public/ships/comet.webp) | 2.5x | 40% | **Overdrive**: 10% chance to triple speed | ![Overdrive](/public/chaos/overdrive.webp) | High-risk, high-reward speedster |
| **The Juggernaut** | ![The Juggernaut](/public/ships/juggernaut.webp) | 2.0x | 50% | **Unstable Engine**: 35% chance to triple acceleration | ![Unstable Engine](/public/chaos/ue.webp) | Balanced power and reliability |
| **The Shadow** | ![The Shadow](/public/ships/shadow.webp) | 1.5x | 67% | **Slipstreamer**: 40% chance +50 speed when trailing | ![Slipstreamer](/public/chaos/slipstreamer.webp) | Steady performer with good odds |
| **The Phantom** | ![The Phantom](/public/ships/phantom.webp) | 1.2x | 83% | **Quantum Tunneling**: 40% chance teleport 25% + speed boost | ![Quantum Tunneling](/public/chaos/qt.webp) | Conservative choice for consistent wins |
| **The Phoenix** | ![The Phoenix](/public/ships/phoenix.webp) | 1.0x | 100% | **Last Stand Protocol**: 10% chance x4 speed in final turns | ![Last Stand Protocol](/public/chaos/lsp.webp) | Even odds, no house edge |
| **The Vanguard** | ![The Vanguard](/public/ships/vanguard.webp) | 0.8x | 125% | **Micro-warp Engine**: 55% chance x2 acceleration | ![Micro-warp Engine](/public/chaos/mwe.webp) | Higher win rate, lower payouts |
| **The Wildcard** | ![The Wildcard](/public/ships/wildcard.webp) | 0.5x | 200% | **Rogue AI**: 20% chance random effect | ![Rogue AI](/public/chaos/rogueai.webp) | High win rate, low payouts |
| **The Apex** | ![The Apex](/public/ships/apex.webp) | 0.5x | 200% | **Graviton Brake**: 77% chance slow 2nd place | ![Graviton Brake](/public/chaos/gb.webp) | Most likely to win, lowest payouts |

## ⚡ Chaos Factor System

The chaos factor system adds unpredictability and excitement to every race. Each spaceship has a unique chaos factor that can trigger during races:

### Chaos Factor Types
- **Overdrive** - Triple speed boost for one turn
- **Unstable Engine** - Triple acceleration for one turn  
- **Slipstreamer** - +50 speed when not in 1st or 2nd place
- **Quantum Tunneling** - Teleport 25% of track distance + speed boost
- **Last Stand Protocol** - Quadruple speed in final 4 turns
- **Micro-warp Engine** - Double acceleration for one turn
- **Rogue AI** - Random effect: x2 speed, /2 speed, x2 accel, or 0 accel
- **Graviton Brake** - Slow 2nd place ship by 50% when in 1st place

### Chaos Factor Images
Each chaos factor has its own visual representation:
- ![Overdrive](/public/chaos/overdrive.webp) - Overdrive
- ![Unstable Engine](/public/chaos/ue.webp) - Unstable Engine  
- ![Slipstreamer](/public/chaos/slipstreamer.webp) - Slipstreamer
- ![Quantum Tunneling](/public/chaos/qt.webp) - Quantum Tunneling
- ![Last Stand Protocol](/public/chaos/lsp.webp) - Last Stand Protocol
- ![Micro-warp Engine](/public/chaos/mwe.webp) - Micro-warp Engine
- ![Rogue AI](/public/chaos/rogueai.webp) - Rogue AI
- ![Graviton Brake](/public/chaos/gb.webp) - Graviton Brake

## 🎰 Jackpot System

### Tiered Jackpots
The game features three jackpot tiers funded by the house edge:

| Jackpot | Image | Chance | Trigger |
|---------|-------|--------|---------|
| **Mini Jackpot** | ![Mini Jackpot](/public/mini-jackpot.webp) | 5% | Random chance based on block data |
| **Mega Jackpot** | ![Mega Jackpot](/public/mega-jackpot.webp) | 3% | Specific race conditions + randomness |
| **Super Jackpot** | ![Super Jackpot](/public/super-jackpot.webp) | 1% | Rare combination of factors + randomness |

### Jackpot Images
- ![Mini Jackpot](/public/mini-jackpot.webp) - Mini Jackpot
- ![Mega Jackpot](/public/mega-jackpot.webp) - Mega Jackpot
- ![Super Jackpot](/public/super-jackpot.webp) - Super Jackpot


## 🏆 Achievement System

### 61 Unique Achievements
The game features a comprehensive achievement system with three categories:

#### Betting Achievements (24 total)
- **Bet 5 times** on each spaceship (8 achievements)
- **Bet 25 times** on each spaceship (8 achievements)  
- **Bet 100 times** on each spaceship (8 achievements)

#### Placement Achievements (32 total)
- **1st place 3 times** with each spaceship (8 achievements)
- **1st place 10 times** with each spaceship (8 achievements)
- **2nd place 5 times** with each spaceship (8 achievements)
- **2nd place 20 times** with each spaceship (8 achievements)
- **3rd place 10 times** with each spaceship (8 achievements)
- **3rd place 50 times** with each spaceship (8 achievements)
- **4th place 15 times** with each spaceship (8 achievements)
- **4th place 75 times** with each spaceship (8 achievements)

#### Milestone Achievements (5 total)
- **Novice Racer**: Complete 10 races
- **Veteran Racer**: Complete 50 races
- **Master Racer**: Complete 100 races
- **High Roller**: Win 1000+ SPIRAL in a single race
- **Cosmic Luck**: Hit any jackpot

### NFT Rewards
Each achievement unlocks:
- **Unique NFT Badge** with metadata (name, description, type, spaceship, threshold)
- **Token Rewards** in SPIRAL tokens
- **MetaMask Compatible** - NFTs appear in your wallet
- **On-chain Metadata** - Base64 encoded JSON with external image URLs

## 🔧 Technical Implementation

### Smart Contract Functions
```solidity
placeBet(uint8 spaceship, uint256 amount) // Place bet and trigger race
getPlayerStats(address player) // Get player statistics
getGameStats() // Get game statistics
getSpaceshipInfo(uint8 spaceshipId) // Get spaceship details
getPlayerAchievementsCount(address player) // Get achievement count
claimFaucet() // Claim SPIRAL tokens
registerUsername(string username, uint8 avatarId) // Register username and avatar
```

### Race Mechanics
- **Instant Resolution**: Each bet triggers immediate race simulation
- **On-chain Randomness**: Uses blockhash, timestamp, and player address
- **House Edge**: 10% fee funds jackpots and contract maintenance
- **Automatic Payouts**: Winnings sent directly to player wallet
- **Chaos Factor Integration**: Real-time chaos events during race simulation

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
- ✅ **ShipConfiguration**: Centralized ship stats management
- ✅ **ChaosManager**: Chaos factor system implementation
- ✅ **Comprehensive Testing**: 100 races with full verification
- ✅ **Financial Tracking**: Accurate spending vs rewards analysis
- 🔄 **Frontend**: Ready for integration

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MetaMask** wallet with Somnia Testnet configured
3. **SPIRAL Tokens** - Claim from in-game faucet

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/cosmicrafts/cosmic-rush.git
   cd cosmic-rush
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Configure environment**
   ```bash
   # Create .env and add your private key without 0x and RPC URLs
   PRIVATE_KEY=here_your_private_key
   ```

4. **Test locally**
   ```bash
   npx hardhat run scripts/deploy-modular.js --network localhost
   ```

5. **Deploy to Somnia Testnet**
   ```bash
   npx hardhat run scripts/deploy-modular.js --network somniaTestnet
   ```

### Available Commands

```bash
# Compile contracts
npm run compile

# Test locally (100 races with full verification)
npm run test

# Deploy to local network
npm run deploy:local

# Deploy to Somnia testnet
npm run deploy:somnia

# Verify contracts on Somnia
npm run verify:somnia

# Start local hardhat node
npm run node

# Clean build artifacts
npm run clean
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

- **Discord**: [https://cosmicrafts.com/assets/discord-BlISsN3U.svg]
- **X**: [https://cosmicrafts.com/assets/discord-BlISsN3U.svg]
- **Email**: [contact@cosmicrafts.com]

---

**Built for Somnia v1 Mini-Games Hackathon**  
*Timeline: July 21 - August 4, 2025*
