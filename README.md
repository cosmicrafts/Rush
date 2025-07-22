# Cosmicrafts Rush 🚀

**A Web3 Spaceship Racing Game on Somnia Testnet**

> Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!

## 🎮 How to Play

1. **Connect Wallet** - Link your Somnia wallet to start betting
2. **Analyze Ships** - Study the 8 unique spaceships and their chaos factors
3. **Place Bets** - Distribute your SOM tokens across multiple ships
4. **Watch the Race** - Enjoy the 10-turn automated showdown with real-time animations
5. **Claim Winnings** - Winners automatically receive their share of the prize pool

## 🏗️ Game Architecture

### Smart Contract (RaceTrack.sol)
- **On-chain Race Logic**: All race calculations happen transparently on Somnia
- **Provably Fair**: Ship stats and chaos factors are immutable on-chain
- **Automated Payouts**: Smart contract handles all betting and winnings distribution
- **Randomness**: Uses block-based entropy for unpredictable race outcomes

### Frontend (React + TypeScript)
- **Real-time Visualization**: Beautiful race animations with ship movement
- **Wallet Integration**: Seamless MetaMask/Web3 wallet connection
- **Live Updates**: Instant race results and betting interface
- **Responsive Design**: Works on desktop and mobile devices

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
placeBet(uint shipId) // Payable function to bet on ships
startRace() // Triggers race simulation and determines winner
claimWinnings() // Allows winners to claim their rewards
```

### Race Mechanics
- **10-turn simulation** with increasing complexity
- **Chaos factors** trigger based on ship abilities and positioning
- **Real-time ranking** affects ship performance
- **Automatic finish detection** when ships cross 3000-unit track

### Web3 Integration
- **Ethers.js** for blockchain interaction
- **Event listening** for real-time race updates
- **Gas-optimized** transactions for smooth UX
- **Error handling** for network issues

## 🎯 Hackathon Goals

✅ **Creativity & Originality**: Unique chaos factor system creates endless replayability  
✅ **Technical Excellence**: Fully deployed on Somnia Testnet with minimal off-chain dependency  
✅ **User Experience**: Intuitive betting interface with engaging race animations  
✅ **Onchain Impact**: 100% on-chain race logic with transparent randomness  
✅ **Community Fit**: Perfect for Somnia's gaming ecosystem with quick, exciting rounds  

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Deploy smart contract to Somnia Testnet
4. Update contract address in frontend
5. Run development server: `npm start`

## 📱 Demo Video

[2-minute demo showcasing gameplay, betting interface, and race visualization]

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
