// Simple test script to verify contract interaction
// Run with: node test-contract.js

const { ethers } = require('ethers');

// Contract ABI (minimal for testing)
const CONTRACT_ABI = [
  'function currentRaceId() external view returns (uint256)',
  'function getRaceInfo(uint256 raceId) external view returns (uint8 winner, uint256 totalBets, uint256 totalPrize, bool finished)',
  'function getShip(uint8 shipId) external view returns (tuple(uint8 id, string name, uint16 initialSpeed, uint8 acceleration, string chaosFactor, uint8 chaosChance))',
  'function MIN_BET() external view returns (uint256)',
  'function MAX_BET() external view returns (uint256)',
  'function houseFee() external view returns (uint256)'
];

// Contract address from nuxt.config.ts
const CONTRACT_ADDRESS = '0x28c91484b55b6991d8f5e4fe2ff313024532537e';

// Somnia Testnet RPC
const RPC_URL = 'https://dream-rpc.somnia.network/';

async function testContract() {
  try {
    console.log('🔗 Connecting to Somnia Testnet...');
    
    // Create provider using ethers v5
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    console.log('✅ Connected to contract:', CONTRACT_ADDRESS);
    
    // Test basic contract calls
    console.log('\n📊 Testing contract functions...');
    
    // Get current race ID
    const currentRaceId = await contract.currentRaceId();
    console.log('Current Race ID:', currentRaceId.toString());
    
    // Get contract constants
    const minBet = await contract.MIN_BET();
    const maxBet = await contract.MAX_BET();
    const houseFee = await contract.houseFee();
    
    console.log('Min Bet:', ethers.utils.formatEther(minBet), 'STT');
    console.log('Max Bet:', ethers.utils.formatEther(maxBet), 'STT');
    console.log('House Fee:', houseFee.toString(), '%');
    
    // Get race info for current race
    const raceInfo = await contract.getRaceInfo(currentRaceId);
    console.log('\n🏁 Current Race Info:');
    console.log('  Winner:', raceInfo[0].toString());
    console.log('  Total Bets:', ethers.utils.formatEther(raceInfo[1]), 'STT');
    console.log('  Total Prize:', ethers.utils.formatEther(raceInfo[2]), 'STT');
    console.log('  Finished:', raceInfo[3]);
    
    // Get ship info for ship 1
    const ship1 = await contract.getShip(1);
    console.log('\n🚀 Ship 1 Info:');
    console.log('  ID:', ship1[0].toString());
    console.log('  Name:', ship1[1]);
    console.log('  Initial Speed:', ship1[2].toString());
    console.log('  Acceleration:', ship1[3].toString());
    console.log('  Chaos Factor:', ship1[4]);
    console.log('  Chaos Chance:', ship1[5].toString(), '%');
    
    console.log('\n✅ All contract tests passed!');
    
  } catch (error) {
    console.error('❌ Contract test failed:', error.message);
  }
}

// Run the test
testContract(); 