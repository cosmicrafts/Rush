require('dotenv').config();
const { ethers } = require('ethers');

async function checkAddress() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('❌ No PRIVATE_KEY found in .env file');
    return;
  }
  
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    console.log('🔍 Wallet Information:');
    console.log('Address:', wallet.address);
    console.log('Private Key (first 10 chars):', privateKey.substring(0, 10) + '...');
    
    // Check balance on Somnia testnet
    const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network/');
    const balance = await provider.getBalance(wallet.address);
    
    console.log('Balance:', ethers.formatEther(balance), 'STT');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAddress(); 