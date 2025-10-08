# Push Chain Migration Guide

## Overview

This guide covers the migration from Somnia to Push Chain, enabling universal cross-chain functionality for the spaceship racing game.

## What's New with Push Chain

### 🌐 Universal Cross-Chain Support
- **Deploy Once**: Contracts deployed only on Push Chain
- **Reach Everyone**: Users from Ethereum, Solana, and other chains can interact
- **Multiple Wallets**: MetaMask, Phantom, Coinbase Wallet, etc.
- **Fee Abstraction**: Users pay gas in ETH, SOL, USDC (no need for PC tokens)

### 🔧 Technical Implementation
- **100% EVM Compatible**: Existing Solidity contracts work unchanged
- **Universal Signers**: Push Chain SDK handles cross-chain signatures
- **Smart Accounts**: Automatic UEA (Universal Execution Account) creation
- **Real-time**: Same performance as single-chain deployment

## Network Configuration

### Push Chain Donut Testnet
- **RPC URL**: `https://evm.rpc-testnet-donut-node1.push.org/`
- **Chain ID**: `42101` (0xa4b5)
- **Currency**: PC (Push Chain Token)
- **Explorer**: https://donut.push.network/
- **Faucet**: [Get testnet PC tokens](https://donut.push.network/faucet)

## Deployment Steps

### 1. Get Testnet Tokens
```bash
# Visit the Push Chain faucet to get PC tokens
# https://donut.push.network/faucet
```

### 2. Set Environment Variables
```bash
# In somnia/.env
PRIVATE_KEY=your_private_key_here
PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
```

### 3. Deploy Contracts
```bash
cd somnia

# Deploy to Push Chain testnet
npm run deploy:pushchain

# Or deploy to local Push Chain (if running local node)
npm run deploy:pushchain-local
```

### 4. Verify Contracts
```bash
# Verify on Push Chain explorer
npx hardhat verify --network pushChainTestnet <CONTRACT_ADDRESS>
```

## Frontend Integration

### 1. Install Dependencies
```bash
# Already added to package.json
npm install @pushchain/core @pushchain/ui-kit buffer
```

### 2. Use Push Universal Wallet
```vue
<template>
  <PushUniversalWalletProvider :config="walletConfig">
    <PushUniversalAccountButton />
    <!-- Your existing game components -->
  </PushUniversalWalletProvider>
</template>

<script setup>
import {
  PushUniversalWalletProvider,
  PushUniversalAccountButton,
  PushUI,
} from '@pushchain/ui-kit'

const walletConfig = {
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  app: {
    title: 'Spaceship Racing',
    description: 'Web3 spaceship racing game',
    logoUrl: '/rush.svg'
  }
}
</script>
```

### 3. Use Universal Signers in Composables
```typescript
// In your betting composable
import { usePushChain } from '~/composables/usePushChain'

const { createUniversalSigner, getUniversalContract } = usePushChain()

// Convert any wallet to universal signer
const universalSigner = await createUniversalSigner(ethersSigner)

// Get contract with universal support
const contract = getUniversalContract(contractAddress, contractABI)

// Place bet - works for Ethereum, Solana, and Push Chain users
const tx = await contract.placeBet(shipId, amount)
```

## User Experience

### For Ethereum Users
1. Connect with MetaMask
2. Sign transaction (feels like normal Ethereum)
3. Pay gas in ETH (no PC tokens needed)
4. Bet gets placed on Push Chain automatically

### For Solana Users
1. Connect with Phantom wallet
2. Sign transaction (feels like normal Solana)
3. Pay gas in SOL (no PC tokens needed)
4. Bet gets placed on Push Chain automatically

### For Push Chain Users
1. Connect with any EVM wallet
2. Standard Push Chain interaction
3. Pay gas in PC tokens

## Contract Addresses

After deployment, update these in your environment:

```bash
# Push Chain Testnet Contract Addresses
PUSH_SPACESHIP_RACE_ADDRESS=0x...
PUSH_SPIRAL_TOKEN_ADDRESS=0x...
PUSH_ACHIEVEMENT_NFT_ADDRESS=0x...
```

## Testing

### 1. Test Local Deployment
```bash
# Terminal 1: Start local Push Chain node
git clone https://github.com/pushchain/push-chain-node
cd push-chain
make install
make sh-testnet

# Terminal 2: Deploy contracts
cd your-project/somnia
npm run deploy:pushchain-local
```

### 2. Test Cross-Chain Functionality
1. Deploy to Push Chain testnet
2. Connect with MetaMask (Ethereum)
3. Try placing a bet
4. Connect with Phantom (Solana)
5. Try placing a bet
6. Verify both work seamlessly

## Key Contracts on Push Chain

### Universal Executor Factory
- **Address**: `0x00000000000000000000000000000000000000eA`
- **Purpose**: Creates Universal Execution Accounts (UEAs)
- **Usage**: Automatic - handled by Push Chain SDK

### Universal Verification Precompile
- **Address**: `0x00000000000000000000000000000000000000ca`
- **Purpose**: Verifies signatures from different chains
- **Usage**: Automatic - handled by Push Chain validators

## Migration Benefits

### For Users
- ✅ Use existing wallets (MetaMask, Phantom, etc.)
- ✅ Pay gas in familiar tokens (ETH, SOL, USDC)
- ✅ No bridging or token swapping required
- ✅ Seamless cross-chain experience

### For Developers
- ✅ Deploy once, reach all chains
- ✅ No contract modifications needed
- ✅ Unified development experience
- ✅ Built-in cross-chain infrastructure

### For the Game
- ✅ Larger user base (Ethereum + Solana + others)
- ✅ Better user onboarding
- ✅ Future-proof architecture
- ✅ Advanced cross-chain features (coming soon)

## Next Steps

1. **Deploy**: Get PC tokens and deploy contracts
2. **Test**: Verify cross-chain functionality works
3. **Integrate**: Add Push Universal Wallet to frontend
4. **Launch**: Go live with universal cross-chain racing!

## Support

- **Documentation**: https://pushchain.github.io/push-chain-website/
- **Discord**: Push Chain community
- **Explorer**: https://donut.push.network/
- **Faucet**: https://donut.push.network/faucet
