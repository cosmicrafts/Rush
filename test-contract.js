const { ethers } = require('ethers');

// Contract address from deployment
const CONTRACT_ADDRESS = '0x28c91484b55b6991d8f5e4fe2ff313024532537e';

// Somnia Testnet RPC
const RPC_URL = 'https://dream-rpc.somnia.network/';

// Simple ABI for testing
const CONTRACT_ABI = [
  'function currentRaceId() external view returns (uint256)',
  'function MIN_BET() external view returns (uint256)',
  'function MAX_BET() external view returns (uint256)',
  'function houseFee() external view returns (uint256)',
  'function getShip(uint8 shipId) external view returns (tuple(uint8,string,uint16,uint8,string,uint8))',
  'function getShipBets(uint256 raceId, uint8 shipId) external view returns (uint256)'
];

async function testContract() {
  try {
    console.log('🔍 Testing Contract Integration...\n');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('✅ Connected to Somnia Testnet');
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log('✅ Contract instance created');
    
    // Test basic contract calls
    console.log('\n📊 Contract Information:');
    
    const currentRace = await contract.currentRaceId();
    console.log(`Current Race ID: ${currentRace}`);
    
    const minBet = await contract.MIN_BET();
    console.log(`Min Bet: ${ethers.formatEther(minBet)} STT`);
    
    const maxBet = await contract.MAX_BET();
    console.log(`Max Bet: ${ethers.formatEther(maxBet)} STT`);
    
    const houseFee = await contract.houseFee();
    console.log(`House Fee: ${houseFee}%`);
    
    // Test ship information
    console.log('\n🚀 Ship Information:');
    for (let i = 1; i <= 8; i++) {
      try {
        const ship = await contract.getShip(i);
        console.log(`Ship ${i}: ${ship[1]} (${ship[4]})`);
      } catch (error) {
        console.log(`Ship ${i}: Error - ${error.message}`);
      }
    }
    
    // Test ship bets
    console.log('\n💰 Ship Bets (Race 0):');
    for (let i = 1; i <= 8; i++) {
      try {
        const bets = await contract.getShipBets(0, i);
        console.log(`Ship ${i}: ${ethers.formatEther(bets)} STT`);
      } catch (error) {
        console.log(`Ship ${i}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ Contract test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contract test failed:', error.message);
  }
}

// Run the test
testContract(); 