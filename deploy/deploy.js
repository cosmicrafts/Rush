const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Cosmicrafts Rush Smart Contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy the contract
  console.log("📦 Deploying RaceTrack contract...");
  const RaceTrack = await ethers.getContractFactory("RaceTrack");
  const raceTrack = await RaceTrack.deploy();
  await raceTrack.deployed();

  console.log("✅ RaceTrack deployed to:", raceTrack.address);
  console.log("🔗 Contract address:", raceTrack.address);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  // Check ship initialization
  console.log("🚀 Ships initialized:");
  for (let i = 1; i <= 8; i++) {
    const ship = await raceTrack.getShip(i);
    console.log(`  Ship ${i}: ${ship.name} - Speed: ${ship.initialSpeed}, Accel: ${ship.acceleration}, Chaos: ${ship.chaosFactor} (${ship.chaosChance}%)`);
  }

  // Check contract constants
  const minBet = await raceTrack.MIN_BET();
  const maxBet = await raceTrack.MAX_BET();
  const houseFee = await raceTrack.houseFee();
  
  console.log("\n⚙️ Contract settings:");
  console.log(`  Min Bet: ${ethers.utils.formatEther(minBet)} STT`);
  console.log(`  Max Bet: ${ethers.utils.formatEther(maxBet)} STT`);
  console.log(`  House Fee: ${houseFee}%`);
  console.log(`  Race Duration: 5 minutes`);
  console.log(`  Track Distance: 1000 units`);
  console.log(`  Race Turns: 10`);

  // Start first race
  console.log("\n🏁 Starting first race...");
  await raceTrack.startNewRace();
  console.log("✅ First race started successfully");

  // Get current race status
  const raceStatus = await raceTrack.getCurrentRaceStatus();
  console.log("\n📊 Current Race Status:");
  console.log(`  Race ID: ${raceStatus.raceId}`);
  console.log(`  Total Bets: ${ethers.utils.formatEther(raceStatus.totalBets)} STT`);
  console.log(`  Finished: ${raceStatus.finished}`);
  console.log(`  Time Remaining: ${raceStatus.timeRemaining} seconds`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🚀 Contract is ready for use!");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: raceTrack.address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contractName: "RaceTrack",
    version: "1.0.0"
  };
  
  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // For local testing, also log the contract address for easy copying
  if (hre.network.name === "localhost") {
    console.log("\n💡 For local testing, update your frontend with this contract address:");
    console.log(`CONTRACT_ADDRESS = '${raceTrack.address}'`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 