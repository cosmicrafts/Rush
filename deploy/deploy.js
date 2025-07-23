const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Cosmicrafts Rush to Somnia Testnet...");

  // Get the contract factory
  const RaceTrack = await ethers.getContractFactory("RaceTrack");
  
  // Deploy the contract
  console.log("📦 Deploying RaceTrack contract...");
  const raceTrack = await RaceTrack.deploy();
  
  // Wait for deployment to finish
  await raceTrack.waitForDeployment();
  
  const address = await raceTrack.getAddress();
  console.log("✅ RaceTrack deployed to:", address);
  
  console.log("\n🎮 Contract Functions:");
  console.log("- placeBet(uint8 shipId) - Place a bet on a ship (payable)");
  console.log("- startNewRace() - Start a new race (owner only)");
  console.log("- finishRace(uint8 winner) - Finish race and set winner (owner only)");
  console.log("- claimWinnings(uint256 raceId) - Claim winnings for a race");
  console.log("- getRaceInfo(uint256 raceId) - Get race information");
  console.log("- getShipBets(uint256 raceId, uint8 shipId) - Get total bets on a ship");
  console.log("- getPlayerBets(uint256 raceId, address player) - Get player's bets");
  console.log("- getShip(uint8 shipId) - Get ship information");
  
  console.log("\n🔧 Contract Configuration:");
  console.log("- Min Bet: 0.001 STT");
  console.log("- Max Bet: 1 STT");
  console.log("- House Fee: 5%");
  console.log("- Race Turns: 10");
  console.log("- Track Distance: 1000");
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Update the contract address in your frontend");
  console.log("2. Test the betting functionality");
  console.log("3. Integrate with the race simulation");
  console.log("4. Deploy your frontend to production");
  
  return address;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    console.log("Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 