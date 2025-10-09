# Push Chain Deployment Guide

## 🚀 Deployment Steps

### 1. Deploy Contracts to Push Chain

```bash
cd pushchain
npm run deploy:pushchain
```

This will deploy all refactored contracts and output their addresses.

### 2. Set Environment Variables

Create a `.env` file in the **root directory** with the contract addresses from deployment:

```bash
# Push Chain Contract Addresses (from deployment output)
SPACESHIP_RACE_CORE_ADDRESS=0x...
PLAYER_STATS_MANAGER_ADDRESS=0x...
PLAYER_PROFILE_MANAGER_ADDRESS=0x...
ACHIEVEMENT_MANAGER_ADDRESS=0x...
SPIRAL_TOKEN_ADDRESS=0x...
ACHIEVEMENT_NFT_ADDRESS=0x...
SHIP_CONFIGURATION_ADDRESS=0x...
CHAOS_MANAGER_ADDRESS=0x...

# Push Chain Network (optional - defaults are set)
PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
PUSH_CHAIN_CHAIN_ID=0xa4b5
PUSH_CHAIN_CHAIN_NAME=Push Chain Donut Testnet
```

### 3. Frontend is Ready!

The frontend is already configured to:
- ✅ Use refactored contracts via `useRefactoredWeb3.ts`
- ✅ Read contract addresses from environment variables
- ✅ Support Push Chain network
- ✅ Route function calls to correct modular contracts

### 4. Test the Application

```bash
npm run dev
```

The app will automatically:
- Connect to Push Chain
- Use the deployed contract addresses
- Route all calls through the refactored contract system

## 📋 Contract Mapping

| Frontend Function | Contract | Method |
|------------------|----------|---------|
| `placeBet()` | SpaceshipRaceCore | `placeBet()` |
| `getPlayerStats()` | PlayerStatsManager | `getPlayerStats()` |
| `registerUsername()` | PlayerProfileManager | `registerUsername()` |
| `claimFaucet()` | AchievementManager | `claimFaucet()` |
| `mintAchievement()` | AchievementManager | `mintAchievement()` |

## 🔧 Configuration Files Updated

- ✅ `nuxt.config.ts` - Contract addresses and Push Chain network config
- ✅ `useRefactoredWeb3.ts` - Wrapper for modular contracts
- ✅ `useNetwork.ts` - Push Chain network support
- ✅ All composables updated to use refactored contracts

## 🌐 Production Deployment

For production (Vercel, Netlify, etc.), set the environment variables in your deployment platform's environment settings.

The frontend will automatically use the contract addresses and connect to Push Chain.
