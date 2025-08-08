const { spawn } = require('child_process');
const { ethers } = require("hardhat");

async function startLocalNetwork() {
  console.log("🚀 Starting local Hardhat network...");
  
  return new Promise((resolve, reject) => {
    const hardhatNode = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe',
      shell: true
    });
    
    let isReady = false;
    
    hardhatNode.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        isReady = true;
        setTimeout(() => {
          hardhatNode.kill();
          resolve();
        }, 2000); // Give it 2 seconds to fully start
      }
    });
    
    hardhatNode.stderr.on('data', (data) => {
      console.error(`Hardhat error: ${data}`);
    });
    
    hardhatNode.on('close', (code) => {
      if (!isReady) {
        reject(new Error(`Hardhat node exited with code ${code}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!isReady) {
        hardhatNode.kill();
        reject(new Error('Hardhat node startup timeout'));
      }
    }, 30000);
  });
}

async function runTests() {
  console.log("🧪 Running comprehensive contract tests...\n");
  
  try {
    // Run the test script
    const testProcess = spawn('node', ['test-contract.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    return new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test process exited with code ${code}`));
        }
      });
    });
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    console.log("🎯 Cosmicrafts Rush - Local Testing Suite\n");
    
    // Step 1: Start local network
    await startLocalNetwork();
    console.log("✅ Local network started successfully\n");
    
    // Step 2: Run tests
    await runTests();
    console.log("✅ All tests completed successfully!\n");
    
    console.log("🎉 Local testing completed!");
    console.log("🚀 Your smart contract is ready for deployment to Somnia Testnet!");
    
  } catch (error) {
    console.error("❌ Testing failed:", error.message);
    process.exit(1);
  }
}

// Run the local testing suite
main();
