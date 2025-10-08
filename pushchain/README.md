# Somnia Contracts

Smart contracts for the Somnia spaceship racing game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Available Scripts

- `npm run compile` - Compile all contracts
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run deploy:local` - Deploy to local Hardhat network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:somnia` - Deploy to Somnia testnet
- `npm run node` - Start local Hardhat node
- `npm run clean` - Clean build artifacts

## Contract Architecture

- `SpaceshipRace.sol` - Main racing game contract
- `SpiralToken.sol` - ERC20 token for the game
- `AchievementNFT.sol` - NFT contract for achievements
- `ChaosManager.sol` - Manages chaos events and modifiers
- `ShipConfiguration.sol` - Ship stats and configuration
- `IAchievementNFT.sol` - Interface for achievement NFTs
