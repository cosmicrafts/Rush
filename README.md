# Cosmic Rush 🚀

![Cosmic Rush Logo](/public/cosmicrush.webp)

**A Web3 Spaceship Racing Game on Somnia Testnet**

> Bet against the house, unlock NFT achievements, and hit jackpots in this fully on-chain spaceship racing game!

**🎲 100% On-Chain Randomness & Trustless Gaming**

Every race is powered by **provably fair on-chain randomness** using block data, timestamps, and player addresses. The **chaos factor system** adds an exciting twist - any spaceship can win regardless of initial odds! With 10 turns per race, unexpected comebacks and dramatic finishes are guaranteed. All game logic is **verifiable on-chain** and **completely trustless**.

**🤖 Fully Automated Gameplay**

Simply place your bet and watch the AI run the entire race! Each turn is generated on the blockchain using EVM randomness, then perfectly simulated on the frontend exactly as it was computed on-chain. No human intervention, no delays - just instant, automated racing action powered by smart contract logic.

**🏆 Somnia v1 Mini-Games Hackathon Submission**

*Timeline: July 21 - August 11, 2025*

## 🎮 How to Play

**🎮 Game is live at [https://rush.cosmicrafts.com/](https://rush.cosmicrafts.com/)**

### Step 1: Connect Your Wallet
1. **Install MetaMask** and configure it for Somnia Testnet
2. **Connect your wallet** to the Cosmic Rush dApp
3. **Automated switch to Somnia Testnet** (RPC: https://testnet.somnia.network) 
4. **Get your STT** on [Somnia Testnet](https://testnet.somnia.network/)

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

### Step 5: Instant payouts
1. **Check your results** - win tokens based on ship placement, achievement unlock or hittin the jackpot
2. **Unlock achievements** - earn NFT badges for milestones
3. **Hit jackpots** - win massive payouts on rare combinations

### Step 6: Compete on Leaderboards
1. **View global rankings** - see top players by total winnings
2. **Check player profiles** - click on any player to view their match history
3. **Track your progress** - monitor your position and earnings
4. **Username system** - register a custom username and avatar for recognition

## 🚀 The Build: An On-Chain AI Gaming Experience

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

### ⚡ Chaos Factor System

The chaos factor system adds unpredictability and excitement to every race. Each spaceship has a unique chaos factor that can trigger during races.


| Ship | Image | Odds | Win Rate | Chaos Factor | Image |
|------|-------|------|----------|--------------|-------|
| **The Comet** | ![The Comet](/public/ships/comet.webp) | 2.5x | 40% | **Overdrive**: 10% chance to triple speed | ![Overdrive](/public/chaos/overdrive.webp) |
| **The Juggernaut** | ![The Juggernaut](/public/ships/juggernaut.webp) | 2.0x | 50% | **Unstable Engine**: 35% chance to triple acceleration | ![Unstable Engine](/public/chaos/ue.webp) |
| **The Shadow** | ![The Shadow](/public/ships/shadow.webp) | 1.5x | 67% | **Slipstreamer**: 40% chance +50 speed when trailing | ![Slipstreamer](/public/chaos/slipstreamer.webp) |
| **The Phantom** | ![The Phantom](/public/ships/phantom.webp) | 1.2x | 83% | **Quantum Tunneling**: 40% chance teleport 25% + speed boost | ![Quantum Tunneling](/public/chaos/qt.webp) |
| **The Phoenix** | ![The Phoenix](/public/ships/phoenix.webp) | 1.0x | 100% | **Last Stand Protocol**: 10% chance x4 speed in final turns | ![Last Stand Protocol](/public/chaos/lsp.webp) |
| **The Vanguard** | ![The Vanguard](/public/ships/vanguard.webp) | 0.8x | 125% | **Micro-warp Engine**: 55% chance x2 acceleration | ![Micro-warp Engine](/public/chaos/mwe.webp) |
| **The Wildcard** | ![The Wildcard](/public/ships/wildcard.webp) | 0.5x | 200% | **Rogue AI**: 20% chance random effect | ![Rogue AI](/public/chaos/rogueai.webp) |
| **The Apex** | ![The Apex](/public/ships/apex.webp) | 0.5x | 200% | **Graviton Brake**: 77% chance slow 2nd place | ![Graviton Brake](/public/chaos/gb.webp) |


## 💰 Payout System

### Race Payouts
Your winnings are based on your spaceship's final placement in the race:

| Placement | Emoji | Payout | Description |
|-----------|-------|--------|-------------|
| **1st Place** | 🥇 | **4X Bet** | Champion payout - quadruple your bet! |
| **2nd Place** | 🥈 | **2X Bet** | Runner-up - double your bet |
| **3rd Place** | 🥉 | **1X Bet** | Bronze finish - get your bet back |
| **4th Place** | 4️⃣ | **0.5X Bet** | Fourth place - half your bet back |
| **5th Place** | 5️⃣ | **0.35X Bet** | Fifth place - 35% of your bet |
| **6th Place** | 6️⃣ | **0.25X Bet** | Sixth place - 25% of your bet |
| **7th Place** | 7️⃣ | **0.1X Bet** | Seventh place - 10% of your bet |
| **8th Place** | 8️⃣ | **0X Bet** | Last place - no payout |

> **House Edge**: 10% of each bet goes to jackpot pools and contract maintenance

### Betting Limits
- **Minimum Bet**: 10 SPIRAL tokens
- **Maximum Bet**: 1,000 SPIRAL tokens

## 🎰 Jackpot System

### Tiered Jackpots
The game features three jackpot tiers funded by the house edge:

| Jackpot | Image | Chance | House Edge Allocation |
|---------|-------|--------|----------------------|
| **Mini Jackpot** | ![Mini Jackpot](/public/mini-jackpot.webp) | 5% | 10% of house edge |
| **Mega Jackpot** | ![Mega Jackpot](/public/mega-jackpot.webp) | 3% | 25% of house edge |
| **Super Jackpot** | ![Super Jackpot](/public/super-jackpot.webp) | 1% | 65% of house edge |

**💰 Jackpot Pool Funding:**
- **House Edge**: 10% of every bet goes to jackpot pools
- **Mini Jackpot**: Receives 10% of house edge (1% of total bet)
- **Mega Jackpot**: Receives 25% of house edge (2.5% of total bet)  
- **Super Jackpot**: Receives 65% of house edge (6.5% of total bet)

### How Jackpots Work
- **Random Triggers**: Jackpots are triggered randomly on every bet
- **Multiple Wins**: Multiple jackpots can be won in a single race
- **Immediate Payouts**: Jackpot amounts are paid out immediately
- **Independent Chances**: Jackpot chances are independent of race placement

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

## 🏆 Leaderboard System

### Global Rankings
Compete with players worldwide on the live leaderboard:

- **Real-time Updates** - Rankings update instantly after each race
- **Total Winnings** - Players ranked by cumulative SPIRAL earnings
- **Player Profiles** - Click any player to view their complete match history
- **Username System** - Register custom usernames and avatars for recognition

### Leaderboard Features
- **🏆 Top Players** - See who's dominating the cosmic racing scene
- **💰 Total Winnings** - Track cumulative earnings across all races
- **👤 Player Identity** - Display usernames or anonymous addresses
- **📊 Match History** - Detailed race records for every player
- **🔄 Live Updates** - Real-time leaderboard refreshes

### Competition Elements
- **Global Rankings** - Compete against players worldwide
- **Persistent Stats** - All data stored on-chain for transparency
- **Achievement Tracking** - See who's unlocking the most achievements
- **Jackpot Winners** - Celebrate players who hit massive jackpots

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
