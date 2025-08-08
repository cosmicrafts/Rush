const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting RaceTrack Deployment");
    console.log("==================================");

    // Get the network information
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "hardhat" : network.name;
    const chainId = network.chainId;
    
    console.log(`📡 Network: ${networkName} (Chain ID: ${chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Deployer Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    // Deploy the RaceTrack contract
    console.log("\n📦 Deploying RaceTrack contract...");
    
    const RaceTrack = await ethers.getContractFactory("RaceTrack");
    const raceTrack = await RaceTrack.deploy();
    
    console.log(`⏳ Waiting for deployment confirmation...`);
    await raceTrack.deployed();
    
    console.log(`✅ RaceTrack deployed to: ${raceTrack.address}`);
    console.log(`📋 Transaction hash: ${raceTrack.deployTransaction.hash}`);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    const deployedCode = await ethers.provider.getCode(raceTrack.address);
    if (deployedCode === "0x") {
        throw new Error("Contract deployment failed - no code at address");
    }
    
    console.log("✅ Contract code verified successfully");

    // Get initial contract state
    console.log("\n📊 Initial Contract State:");
    console.log(`   - Current Race ID: ${await raceTrack.currentRaceId()}`);
    console.log(`   - Min Bet: ${ethers.utils.formatEther(await raceTrack.MIN_BET())} ETH`);
    console.log(`   - Max Bet: ${ethers.utils.formatEther(await raceTrack.MAX_BET())} ETH`);
    console.log(`   - House Fee: ${await raceTrack.houseFee()}%`);
    console.log(`   - Race Duration: 5 minutes`);
    console.log(`   - Track Distance: 1000 units`);
    console.log(`   - Race Turns: 10`);

    // Display ship information
    console.log("\n🚀 Ships Initialized:");
    for (let i = 1; i <= 8; i++) {
        const ship = await raceTrack.getShip(i);
        console.log(`   Ship ${i}: ${ship.name}`);
        console.log(`     - Speed: ${ship.initialSpeed}, Accel: ${ship.acceleration}`);
        console.log(`     - Chaos: ${ship.chaosFactor} (${ship.chaosChance}%)`);
    }

    // Start first race
    console.log("\n🏁 Starting first race...");
    await raceTrack.startNewRace();
    console.log("✅ First race started successfully");

    // Get current race status
    const raceStatus = await raceTrack.getCurrentRaceStatus();
    console.log("\n📊 Current Race Status:");
    console.log(`   - Race ID: ${raceStatus.raceId}`);
    console.log(`   - Total Bets: ${ethers.utils.formatEther(raceStatus.totalBets)} ETH`);
    console.log(`   - Finished: ${raceStatus.finished}`);
    console.log(`   - Time Remaining: ${raceStatus.timeRemaining} seconds`);

    // Save deployment information
    const deploymentInfo = {
        network: networkName,
        chainId: chainId,
        contractAddress: raceTrack.address,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        transactionHash: raceTrack.deployTransaction.hash,
        blockNumber: raceTrack.deployTransaction.blockNumber,
        gasUsed: raceTrack.deployTransaction.gasLimit?.toString(),
        contractInfo: {
            currentRaceId: (await raceTrack.currentRaceId()).toString(),
            minBet: ethers.utils.formatEther(await raceTrack.MIN_BET()),
            maxBet: ethers.utils.formatEther(await raceTrack.MAX_BET()),
            houseFee: (await raceTrack.houseFee()).toString(),
            raceDuration: "5 minutes",
            trackDistance: "1000 units",
            raceTurns: "10"
        },
        ships: []
    };

    // Add ship information
    for (let i = 1; i <= 8; i++) {
        const ship = await raceTrack.getShip(i);
        deploymentInfo.ships.push({
            id: ship.id.toString(),
            name: ship.name,
            initialSpeed: ship.initialSpeed.toString(),
            acceleration: ship.acceleration.toString(),
            chaosFactor: ship.chaosFactor,
            chaosChance: ship.chaosChance.toString()
        });
    }

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `racetrack-${networkName}-${chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    // Network-specific post-deployment actions
    if (networkName !== "hardhat") {
        console.log("\n🔗 Network-specific actions:");
        
        // For testnets and mainnets, provide verification instructions
        if (chainId === 11155111) { // Sepolia
            console.log("📝 To verify on Sepolia Etherscan:");
            console.log(`   npx hardhat verify --network sepolia ${raceTrack.address}`);
        } else if (chainId === 50312) { // Somnia Testnet
            console.log("📝 To verify on Somnia Testnet Explorer:");
            console.log(`   npx hardhat verify --network somniaTestnet ${raceTrack.address}`);
        }
    }

    // Test the contract with a simple interaction
    console.log("\n🧪 Running basic contract test...");
    try {
        // Test basic functionality - check if we can read the contract state
        const currentRaceId = await raceTrack.currentRaceId();
        const minBet = await raceTrack.MIN_BET();
        const maxBet = await raceTrack.MAX_BET();
        const houseFee = await raceTrack.houseFee();
        
        console.log(`   ✅ Current Race ID: ${currentRaceId}`);
        console.log(`   ✅ Min Bet: ${ethers.utils.formatEther(minBet)} ETH`);
        console.log(`   ✅ Max Bet: ${ethers.utils.formatEther(maxBet)} ETH`);
        console.log(`   ✅ House Fee: ${houseFee}%`);
        
        // Test ship retrieval
        const ship1 = await raceTrack.getShip(1);
        console.log(`   ✅ Ship 1: ${ship1.name} (${ship1.chaosFactor})`);
        
        console.log("✅ Contract is ready for use!");
        
    } catch (error) {
        console.log(`⚠️  Basic test failed: ${error.message}`);
    }

    console.log("\n🎉 RaceTrack deployment completed successfully!");
    console.log("=============================================");
    console.log(`📋 Contract Address: ${raceTrack.address}`);
    console.log(`🌐 Network: ${networkName} (Chain ID: ${chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🏁 Current Race ID: ${await raceTrack.currentRaceId()}`);
    console.log(`💰 Min Bet: ${ethers.utils.formatEther(await raceTrack.MIN_BET())} ETH`);
    console.log(`💰 Max Bet: ${ethers.utils.formatEther(await raceTrack.MAX_BET())} ETH`);
    console.log(`🏦 House Fee: ${await raceTrack.houseFee()}%`);
    console.log("=============================================");

    return {
        contractAddress: raceTrack.address,
        deployer: deployer.address,
        network: networkName,
        chainId: chainId,
        transactionHash: raceTrack.deployTransaction.hash,
        contractInfo: {
            currentRaceId: (await raceTrack.currentRaceId()).toString(),
            minBet: ethers.utils.formatEther(await raceTrack.MIN_BET()),
            maxBet: ethers.utils.formatEther(await raceTrack.MAX_BET()),
            houseFee: (await raceTrack.houseFee()).toString()
        }
    };
}

// Handle errors
main()
    .then((result) => {
        console.log("\n✅ RaceTrack deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ RaceTrack deployment failed:");
        console.error(error);
        process.exit(1);
    });
