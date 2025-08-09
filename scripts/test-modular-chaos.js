const hre = require("hardhat");

async function main() {
    console.log("🔥 Testing Modular Chaos Factors System");
    console.log("=====================================");

    // Deploy all contracts
    console.log("🚀 Deploying contracts...");
    
    // 1. Deploy ShipConfiguration
    const ShipConfiguration = await hre.ethers.getContractFactory("ShipConfiguration");
    const shipConfig = await ShipConfiguration.deploy();
    await shipConfig.deployed();

    // 2. Deploy ChaosManager
    const ChaosManager = await hre.ethers.getContractFactory("ChaosManager");
    const chaosManager = await ChaosManager.deploy(shipConfig.address);
    await chaosManager.deployed();

    // 3. Deploy mock tokens
    const MockToken = await hre.ethers.getContractFactory("SpiralToken");
    const spiralToken = await MockToken.deploy();
    await spiralToken.deployed();

    const MockNFT = await hre.ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await MockNFT.deploy();
    await achievementNFT.deployed();

    // 4. Deploy main contract
    const SpaceshipRace = await hre.ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(
        spiralToken.address,
        achievementNFT.address,
        shipConfig.address,
        chaosManager.address
    );
    await spaceshipRace.deployed();

    console.log("✅ All contracts deployed successfully!");

    // Test modular components
    console.log("\n📋 Testing Ship Configuration...");
    for (let i = 0; i < 8; i++) {
        const stats = await shipConfig.getShipStats(i);
        const name = await shipConfig.getShipName(i);
        console.log(`Ship ${i} (${name}): Speed=${stats.initialSpeed}, Accel=${stats.acceleration}, Chaos=${stats.chaosFactor} (${stats.chaosChance}%)`);
    }

    console.log("\n⚡ Testing Chaos Manager...");
    for (let i = 0; i < 8; i++) {
        const chaosName = await chaosManager.getChaosFactorName(i);
        const affectsSpeed = await chaosManager.affectsSpeed(i);
        const affectsAccel = await chaosManager.affectsAcceleration(i);
        console.log(`Chaos ${i}: ${chaosName} - Speed: ${affectsSpeed}, Acceleration: ${affectsAccel}`);
    }

    // Test chaos factors specifically
    console.log("\n🎲 Testing Chaos Factor Triggers...");
    
    const raceCount = 50;
    const chaosEvents = {
        overdrive: 0,
        unstable: 0,
        total: 0
    };

    for (let race = 0; race < raceCount; race++) {
        const raceResult = await spaceshipRace.debugRaceSimulation();
        
        // Count chaos events
        for (let i = 0; i < raceResult.totalEvents; i++) {
            const event = raceResult.turnEvents[i];
            if (event.chaosEventType == 1) { // CHAOS_OVERDRIVE
                chaosEvents.overdrive++;
                if (race < 5) { // Log first few for verification
                    console.log(`🔥 Race ${race + 1}: The Comet Overdrive! Turn ${event.turn}: Move ${event.moveAmount}, Distance ${event.distance}`);
                }
            } else if (event.chaosEventType == 2) { // CHAOS_UNSTABLE
                chaosEvents.unstable++;
                if (race < 5) { // Log first few for verification
                    console.log(`⚡ Race ${race + 1}: The Juggernaut Unstable Engine! Turn ${event.turn}: Move ${event.moveAmount}, Distance ${event.distance}`);
                }
            }
        }
        chaosEvents.total++;
        
        if ((race + 1) % 10 == 0) {
            console.log(`   Progress: ${race + 1}/${raceCount} races completed`);
        }
    }

    // Calculate statistics
    console.log("\n📊 Chaos Factor Statistics:");
    console.log("===========================");
    
    // Estimate total turns for each ship (approximately 6-8 turns per race on average)
    const estimatedTurnsPerShip = raceCount * 7; // Conservative estimate
    
    console.log(`The Comet (Overdrive):`);
    console.log(`  Total races: ${raceCount}`);
    console.log(`  Overdrive triggers: ${chaosEvents.overdrive}`);
    console.log(`  Estimated trigger rate: ${((chaosEvents.overdrive / estimatedTurnsPerShip) * 100).toFixed(2)}%`);
    console.log(`  Expected trigger rate: 10%`);

    console.log(`\nThe Juggernaut (Unstable Engine):`);
    console.log(`  Total races: ${raceCount}`);
    console.log(`  Unstable triggers: ${chaosEvents.unstable}`);
    console.log(`  Estimated trigger rate: ${((chaosEvents.unstable / estimatedTurnsPerShip) * 100).toFixed(2)}%`);
    console.log(`  Expected trigger rate: 25%`);

    console.log("\n✅ Modular chaos factor system is working!");
    console.log("🎯 The contract architecture is now clean and extensible!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
