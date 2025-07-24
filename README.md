# Cosmicrafts Rush 🚀

**A Web3 Spaceship Racing Game on Somnia Testnet**

> Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!

**🏆 Somnia v1 Mini-Games Hackathon Submission**

*Timeline: July 21 - August 4, 2025*

## 🎮 How to Play

1. **Connect Wallet** - Link your Somnia wallet to start betting
2. **Analyze Ships** - Study the 8 unique spaceships and their chaos factors
3. **Place Bets** - Distribute your SOM tokens across multiple ships
4. **Watch the Race** - Enjoy the 10-turn automated showdown with real-time animations
5. **Claim Winnings** - Winners automatically receive their share of the prize pool

## 🏗️ Game Architecture

### Smart Contract (RaceTrack.sol)
- **On-chain Betting**: All bets and payouts handled transparently on Somnia
- **Provably Fair**: Ship stats and chaos factors are immutable on-chain
- **Automated Payouts**: Smart contract handles all betting and winnings distribution
- **Security**: Uses OpenZeppelin's ReentrancyGuard and Ownable for security
- **Gas Optimized**: Efficient contract design for Somnia's high TPS

### Frontend (Nuxt 3 + Vue 3)
- **Real-time Visualization**: Beautiful race animations with ship movement
- **Wallet Integration**: Seamless MetaMask/Web3 wallet connection
- **Live Updates**: Instant race results and betting interface
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## 🚀 The 8 Spaceships

| Ship | Chaos Factor | Strategy |
|------|-------------|----------|
| **The Comet** | Overdrive (10% chance x2 speed) | High-risk speed burst |
| **The Juggernaut** | Unstable Engine (20% chance x3 acceleration) | Volatile but powerful |
| **The Shadow** | Slipstreamer (30% chance +50 speed when trailing) | Comeback specialist |
| **The Phantom** | Quantum Tunneling (2% chance teleport 25% distance) | Ultimate long-shot |
| **The Phoenix** | Last Stand Protocol (x4 acceleration in final 3 turns) | Late-game surge |
| **The Vanguard** | Micro-warp Engine (x2 acceleration every turn) | Consistent performer |
| **The Wildcard** | Rogue AI (15% chance random effect) | Pure chaos |
| **The Apex** | Graviton Brake (25% chance slow 2nd place) | Tactical front-runner |

## 🔧 Technical Implementation

### Smart Contract Functions
```solidity
placeBet(uint8 shipId) // Payable function to bet on ships
startNewRace() // Owner function to start new race
finishRace(uint8 winner) // Owner function to set race winner
claimWinnings(uint256 raceId) // Allows winners to claim rewards
getRaceInfo(uint256 raceId) // View race information
getShipBets(uint256 raceId, uint8 shipId) // View ship betting totals
```

### Race Mechanics
- **10-turn simulation** with chaos factor triggers
- **8 unique ships** with distinct abilities and stats
- **Real-time ranking** affects ship performance
- **Chaos factors** create unpredictable race outcomes

### Web3 Integration
- **Ethers.js** for blockchain interaction
- **Event listening** for real-time updates
- **Gas-optimized** for Somnia's high TPS
- **Error handling** for network issues
- **MetaMask integration** for wallet connection

## 🎯 Hackathon Goals

✅ **Creativity & Originality**: Unique chaos factor system creates endless replayability  
✅ **Technical Excellence**: Fully deployed on Somnia Testnet with minimal off-chain dependency  
✅ **User Experience**: Intuitive betting interface with engaging race animations  
✅ **Onchain Impact**: 100% on-chain betting and payout system with transparent fairness  
✅ **Community Fit**: Perfect for Somnia's gaming ecosystem with quick, exciting rounds  

## 🚀 Deployment Status

- ✅ **Smart Contract**: Deployed to Somnia Testnet
- ✅ **Frontend**: Nuxt 3 application with Vue 3
- ✅ **Wallet Integration**: MetaMask support
- ✅ **Race Simulation**: 8 ships with chaos factors
- ✅ **Betting System**: On-chain betting and payouts
- 🔄 **Production Frontend**: Ready for deployment  

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MetaMask** wallet with Somnia Testnet configured
3. **Somnia Test Tokens (STT)** - Request from Discord: `#dev-chat` @emma_odia

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
   cp env.example .env
   # Edit .env and add your private key
   ```

4. **Deploy smart contract to Somnia Testnet**
   ```bash
   npm run deploy:contract
   ```

5. **Update contract address in frontend**
   - Copy the deployed contract address
   - Update it in your frontend configuration

6. **Run development server**
   ```bash
   npm run dev
   ```

### Smart Contract Deployment

1. **Compile the contract**
   ```bash
   npm run compile
   ```

2. **Deploy to Somnia Testnet**
   ```bash
   npm run deploy:contract
   ```

3. **Verify deployment**
   - Copy the contract address from the deployment output
   - Check the contract on Somnia Testnet explorer

### Frontend Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting service**
   - Vercel, Netlify, or any static hosting
   - Update the contract address in your frontend config

### MetaMask Configuration

1. **Add Somnia Testnet to MetaMask:**
   - Network Name: `Somnia Testnet`
   - RPC URL: `https://dream-rpc.somnia.network/`
   - Chain ID: `50312`
   - Currency Symbol: `STT`
   - Block Explorer: `https://shannon-explorer.somnia.network/`

2. **Get Test Tokens:**
   - Join [Somnia Discord](https://discord.com/invite/somnia)
   - Go to `#dev-chat` channel
   - Tag `@emma_odia` and request STT tokens
   - Or email `developers@somnia.network`

## 📱 Demo Video

[2-minute demo showcasing gameplay, betting interface, and race visualization]

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


# Cosmicrafts Rush - Nuxt 3 Edition

A Web3 spaceship racing game built with Vue 3, Nuxt 3, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Project Structure

```
cosmicrafts-rush/
├── app.vue              # Main game interface
├── components/          # Vue components
│   └── RaceTrack.vue   # Race visualization
├── stores/             # Pinia state management
│   └── game.ts         # Game state and logic
├── types/              # TypeScript definitions
│   └── game.ts         # Game interfaces
├── data/               # Game data
│   └── ships.ts        # Ship roster and constants
├── assets/             # Static assets
│   └── css/            # Global styles
└── nuxt.config.ts      # Nuxt configuration
```

## 🎮 Features

- **Real-time Race Visualization**: Watch ships compete with smooth animations
- **8 Unique Spaceships**: Each with distinct chaos factors and strategies
- **Bulk Simulation**: Run 1000 races to test balance
- **TypeScript Support**: Full type safety throughout the application
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Built with Nuxt UI and Tailwind CSS

## 🔧 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Nuxt 3** - Full-stack Vue framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Nuxt UI** - Component library

## 🚀 Next Steps

This is the foundation for the Web3 version. Next steps include:

1. **Smart Contract Integration** - Connect to Somnia blockchain
2. **Wallet Connection** - MetaMask/Web3 wallet support
3. **Betting Interface** - Place bets on ships
4. **On-chain Race Logic** - Move race simulation to smart contract
5. **Prize Distribution** - Automatic payout system

## 📱 Development

The development server runs on `http://localhost:3000` by default.

For more information about the game design and Web3 integration, see the main project README.
