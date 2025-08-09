const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Modular Spaceship Race Contracts...");
    console.log("================================================");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // 1. Deploy ShipConfiguration contract first
    console.log("\n📋 1. Deploying ShipConfiguration...");
    const ShipConfiguration = await hre.ethers.getContractFactory("ShipConfiguration");
    const shipConfig = await ShipConfiguration.deploy();
    await shipConfig.deployed();
    const shipConfigAddress = shipConfig.address;
    console.log("✅ ShipConfiguration deployed to:", shipConfigAddress);

    // 2. Deploy ChaosManager contract (needs ShipConfiguration address)
    console.log("\n⚡ 2. Deploying ChaosManager...");
    const ChaosManager = await hre.ethers.getContractFactory("ChaosManager");
    const chaosManager = await ChaosManager.deploy(shipConfigAddress);
    await chaosManager.deployed();
    const chaosManagerAddress = chaosManager.address;
    console.log("✅ ChaosManager deployed to:", chaosManagerAddress);

    // 3. Deploy mock SPIRAL token for testing
    console.log("\n🪙 3. Deploying Mock SPIRAL Token...");
    const MockToken = await hre.ethers.getContractFactory("SpiralToken");
    const spiralToken = await MockToken.deploy();
    await spiralToken.deployed();
    const spiralTokenAddress = spiralToken.address;
    console.log("✅ SPIRAL Token deployed to:", spiralTokenAddress);

    // 4. Deploy mock Achievement NFT
    console.log("\n🏆 4. Deploying Mock Achievement NFT...");
    const MockNFT = await hre.ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await MockNFT.deploy();
    await achievementNFT.deployed();
    const achievementNFTAddress = achievementNFT.address;
    console.log("✅ Achievement NFT deployed to:", achievementNFTAddress);

    // 5. Deploy main SpaceshipRace contract
    console.log("\n🚀 5. Deploying Main SpaceshipRace Contract...");
    const SpaceshipRace = await hre.ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(
        spiralTokenAddress,
        achievementNFTAddress,
        shipConfigAddress,
        chaosManagerAddress
    );
    await spaceshipRace.deployed();
    const spaceshipRaceAddress = spaceshipRace.address;
    console.log("✅ SpaceshipRace deployed to:", spaceshipRaceAddress);

    // Verify all contracts are working
    console.log("\n🔍 6. Verifying Contract Integration...");
    
    // Test ship config
    const ship0Stats = await shipConfig.getShipStats(0);
    console.log("Ship 0 (The Comet) stats:", {
        initialSpeed: ship0Stats.initialSpeed.toString(),
        acceleration: ship0Stats.acceleration.toString(),
        chaosFactor: ship0Stats.chaosFactor.toString(),
        chaosChance: ship0Stats.chaosChance.toString()
    });

    // Test chaos manager
    const chaosName = await chaosManager.getChaosFactorName(0);
    console.log("Chaos Factor 0 name:", chaosName);

    // Test main contract
    const spaceshipInfo = await spaceshipRace.getSpaceshipInfo(0);
    console.log("Spaceship 0 info from main contract:", {
        initialSpeed: spaceshipInfo[0].toString(),
        acceleration: spaceshipInfo[1].toString(),
        chaosFactor: spaceshipInfo[2].toString(),
        chaosChance: spaceshipInfo[3].toString()
    });

    // Test debug race simulation
    console.log("\n🏁 7. Testing Race Simulation...");
    const raceResult = await spaceshipRace.debugRaceSimulation();
    console.log("Race winner:", raceResult.winner.toString());
    console.log("Race placements:", raceResult.placements.map(p => p.toString()));

    // 8. Fund the faucet with SPIRAL tokens
    console.log("\n💰 8. Funding Faucet...");
    try {
        // Check SPIRAL token decimals
        const decimals = await spiralToken.decimals();
        console.log("SPIRAL Token decimals:", decimals);
        
        // Fund faucet with 100,000 SPIRAL tokens (enough for 100 users at 1000 SPIRAL each)
        const faucetFunding = hre.ethers.utils.parseUnits("100000", decimals);
        console.log("Transferring", hre.ethers.utils.formatUnits(faucetFunding, decimals), "SPIRAL to faucet...");
        
        const fundTx = await spiralToken.transfer(spaceshipRaceAddress, faucetFunding);
        await fundTx.wait();
        
        // Verify the transfer
        const gameBalance = await spiralToken.balanceOf(spaceshipRaceAddress);
        console.log("✅ Game contract now has:", hre.ethers.utils.formatUnits(gameBalance, decimals), "SPIRAL tokens");
        
        // Test faucet claim
        console.log("🧪 Testing faucet claim...");
        const claimTx = await spaceshipRace.claimFaucet();
        await claimTx.wait();
        
        const deployerBalance = await spiralToken.balanceOf(deployer.address);
        console.log("✅ Deployer claimed from faucet! New balance:", hre.ethers.utils.formatUnits(deployerBalance, decimals), "SPIRAL");
        
    } catch (error) {
        console.log("❌ Error funding faucet:", error.message);
    }

    console.log("\n✅ All contracts deployed and verified successfully!");
    console.log("================================================");
    console.log("📋 Contract Addresses:");
    console.log("- ShipConfiguration:", shipConfigAddress);
    console.log("- ChaosManager:", chaosManagerAddress);
    console.log("- SPIRAL Token:", spiralTokenAddress);
    console.log("- Achievement NFT:", achievementNFTAddress);
    console.log("- SpaceshipRace:", spaceshipRaceAddress);

    // Save deployment info
    const deployment = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            ShipConfiguration: shipConfigAddress,
            ChaosManager: chaosManagerAddress,
            SpiralToken: spiralTokenAddress,
            AchievementNFT: achievementNFTAddress,
            SpaceshipRace: spaceshipRaceAddress
        }
    };

    console.log("\n💾 Deployment complete! Ready for testing.");
    return deployment;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
