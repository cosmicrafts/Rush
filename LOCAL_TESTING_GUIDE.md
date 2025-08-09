# 🎮 Local Blockchain Testing Guide

This guide will help you test the race reconstruction interface with a local Hardhat blockchain and the Vue.js frontend.

## 🚀 Quick Start

### Terminal 1: Start Local Blockchain
```bash
cd /home/bizkit/GitHub/Rush
npx hardhat node
```

### Terminal 2: Deploy Contracts & Setup
```bash
npx hardhat run scripts/setup-local-test.js --network localhost
```

### Terminal 3: Start Frontend
```bash
npm run dev
```

## 📋 Detailed Setup Instructions

### 1. Start Local Hardhat Node
```bash
npx hardhat node
```
This will:
- Start a local blockchain on `http://localhost:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys

### 2. Deploy and Setup Contracts
```bash
npx hardhat run scripts/setup-local-test.js --network localhost
```
This will:
- Deploy all modular contracts (SpiralToken, AchievementNFT, ShipConfiguration, ChaosManager, SpaceshipRace)
- Fund the game contract with 1M SPIRAL tokens
- Fund test player with 100K SPIRAL tokens
- Test race simulation and betting
- Display contract addresses for frontend

### 3. Configure MetaMask

#### Add Localhost Network:
- Network Name: `Localhost 8545`
- New RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

#### Import Test Account:
- Copy the private key from Terminal 1 (usually Account #1)
- In MetaMask: Add Account → Import Account
- Paste the private key

### 4. Update Frontend Configuration

Copy the contract address from the setup script output and update `composables/useWeb3.ts`:
```typescript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE'
```

### 5. Start Frontend
```bash
npm run dev
```

## 🎯 Testing Features

### Race Simulation
1. **Connect Wallet**: Click connect in the frontend
2. **Start New Race**: Click "Start New Race" button
3. **Watch Animation**: See blockchain race data animated in real-time
4. **View Results**: Check race log for turn-by-turn progression

### Expected Race Flow:
1. 🚀 "Running blockchain race simulation..."
2. ✅ "Race simulation loaded from blockchain!"
3. 🏁 "Winner: [Ship Name]!"
4. ⚡ Chaos events display during animation
5. 🏆 Final standings in race log

### Betting Interface (BettingInterface.vue)
1. **Select Ship**: Choose your favorite spaceship
2. **Set Amount**: Enter bet in SPIRAL tokens (10-1000)
3. **Place Bet**: Execute transaction and watch race
4. **View Results**: See if you won or lost

### Chaos Events to Look For:
- 🔥 **Overdrive**: Speed multiplier boost
- ⚡ **Unstable Engine**: Acceleration surge
- 💨 **Slipstream**: Drafting speed bonus
- 🌀 **Quantum Tunneling**: Teleportation effect
- 🚀 **Last Stand Protocol**: Final turn speed boost
- ⚡ **Micro-warp Engine**: Acceleration multiplier
- 🤖 **Rogue AI**: Random unpredictable effects
- 🛑 **Graviton Brake**: Apex slowing other ships

## 🔧 Troubleshooting

### "Wrong Network" Error
- Ensure MetaMask is connected to Localhost 8545
- Chain ID should be 31337
- Try disconnecting and reconnecting wallet

### "Contract Not Found" Error
- Check CONTRACT_ADDRESS in `composables/useWeb3.ts`
- Ensure contracts are deployed (step 2)
- Restart Hardhat node and redeploy if needed

### "Insufficient Funds" Error
- Check SPIRAL token balance (should be 100K)
- Ensure bet amount is between 10-1000 SPIRAL
- Try smaller bet amounts

### Race Animation Not Working
- Check browser console for errors
- Ensure `getDebugRaceSimulation` is working
- Try refreshing the page

### Chaos Events Not Showing
- Events may be quick (1.5 second display)
- Check race log for event history
- Different ships have different chaos chances

## 📊 Performance Testing

### Test Multiple Races
```javascript
// In browser console:
for(let i = 0; i < 10; i++) {
  setTimeout(() => {
    document.getElementById('start-race-btn').click()
  }, i * 15000) // 15 seconds apart
}
```

### Check Win Distribution
Run the bulk simulation test:
```bash
npx hardhat run scripts/test-500-individual-races.js --network localhost
```

## 🚀 Ready for Sepolia?

Once local testing is successful:

### 1. Deploy to Sepolia Testnet
```bash
# Get Sepolia ETH from faucet first
npx hardhat run scripts/deploy-modular.js --network sepolia
```

### 2. Update Frontend Config
```typescript
const CONTRACT_ADDRESS = 'YOUR_SEPOLIA_CONTRACT_ADDRESS'
```

### 3. Switch MetaMask to Sepolia
- Network: Sepolia Testnet
- Ensure you have Sepolia ETH for gas

### 4. Get SPIRAL Tokens
- Deploy with owner account
- Transfer SPIRAL to test accounts
- Or implement faucet functionality

## 🎉 Success Indicators

### ✅ Local Testing Working:
- [ ] MetaMask connects to localhost
- [ ] Contract addresses deployed correctly
- [ ] Race animation shows blockchain data
- [ ] Chaos events trigger and display
- [ ] Turn-by-turn progression smooth
- [ ] Final standings match blockchain results
- [ ] Betting interface works with SPIRAL tokens
- [ ] Race log shows detailed progression

### ✅ Ready for Production:
- [ ] All chaos factors working correctly
- [ ] Achievement system minting NFTs
- [ ] Win distribution balanced across ships
- [ ] No console errors or failed transactions
- [ ] Smooth user experience
- [ ] Real-time blockchain race reconstruction working perfectly

## 🎮 Have Fun!

You now have a fully functional blockchain-powered spaceship racing game with:
- **Real blockchain races** with turn-by-turn reconstruction
- **9 different chaos factors** affecting ship performance  
- **NFT achievements** for betting and placement milestones
- **SPIRAL token economy** with win/loss mechanics
- **Smooth frontend animation** of blockchain race data

Enjoy testing your cosmic racing empire! 🚀✨
