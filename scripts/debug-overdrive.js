const hre = require("hardhat");

async function main() {
    console.log("🔍 Debugging Overdrive Chaos Factor");
    console.log("===================================");

    // Deploy contracts
    const ShipConfiguration = await hre.ethers.getContractFactory("ShipConfiguration");
    const shipConfig = await ShipConfiguration.deploy();
    await shipConfig.deployed();

    const ChaosManager = await hre.ethers.getContractFactory("ChaosManager");
    const chaosManager = await ChaosManager.deploy(shipConfig.address);
    await chaosManager.deployed();

    const MockToken = await hre.ethers.getContractFactory("SpiralToken");
    const spiralToken = await MockToken.deploy();
    await spiralToken.deployed();

    const MockNFT = await hre.ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await MockNFT.deploy();
    await achievementNFT.deployed();

    const SpaceshipRace = await hre.ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(
        spiralToken.address,
        achievementNFT.address,
        shipConfig.address,
        chaosManager.address
    );
    await spaceshipRace.deployed();

    console.log("✅ Contracts deployed");

    // Check The Comet's stats
    const cometStats = await shipConfig.getShipStats(0);
    console.log("\n🚀 The Comet Stats:");
    console.log(`- Initial Speed: ${cometStats.initialSpeed}`);
    console.log(`- Acceleration: ${cometStats.acceleration}`);
    console.log(`- Chaos Factor: ${cometStats.chaosFactor}`);
    console.log(`- Chaos Chance: ${cometStats.chaosChance}%`);

    // Simulate several individual chaos checks
    console.log("\n🎲 Testing Individual Chaos Checks:");
    
    const [deployer] = await hre.ethers.getSigners();
    const raceId = 1;
    
    for (let turn = 1; turn <= 10; turn++) {
        try {
            const result = await chaosManager.applyChaosEffect(
                0, // The Comet (shipIndex 0)
                turn,
                78, // Initial speed
                raceId,
                deployer.address
            );
            
            const triggered = result.eventType == 1; // CHAOS_OVERDRIVE
            const speedBoost = result.modifiedSpeed > 78;
            
            console.log(`Turn ${turn}: Triggered=${triggered}, Speed=${result.modifiedSpeed} (boost=${speedBoost})`);
        } catch (error) {
            console.log(`Turn ${turn}: ERROR - ${error.message}`);
        }
    }

    // Test a few race simulations and trace The Comet specifically
    console.log("\n🏁 Testing Race Simulations:");
    
    for (let race = 1; race <= 5; race++) {
        console.log(`\n--- Race ${race} ---`);
        const raceResult = await spaceshipRace.debugRaceSimulation();
        
        let cometEvents = [];
        for (let i = 0; i < raceResult.totalEvents; i++) {
            const event = raceResult.turnEvents[i];
            if (event.shipId == 0) { // The Comet
                cometEvents.push({
                    turn: event.turn.toString(),
                    moveAmount: event.moveAmount.toString(),
                    distance: event.distance.toString(),
                    chaosType: event.chaosEventType.toString()
                });
            }
        }
        
        console.log(`The Comet events:`, cometEvents);
        
        const overdriveEvents = cometEvents.filter(e => e.chaosType == "1");
        console.log(`Overdrive triggers: ${overdriveEvents.length}`);
        
        if (overdriveEvents.length > 0) {
            console.log("🔥 OVERDRIVE TRIGGERED!", overdriveEvents);
        }
    }

    // Test with static values to verify logic
    console.log("\n🧪 Testing with known values:");
    
    // Manually test the chaos logic with predictable values
    try {
        // Use fixed parameters that should result in a trigger
        const testResult = await chaosManager.applyChaosEffect(
            0, // The Comet
            1, // Turn 1
            78, // Speed
            123, // Fixed race ID
            "0x1234567890123456789012345678901234567890" // Fixed address
        );
        
        console.log(`Manual test result: Speed=${testResult.modifiedSpeed}, EventType=${testResult.eventType}`);
        
        // Calculate what the random number would be
        const manualRandom = hre.ethers.utils.solidityKeccak256(
            ['bytes32', 'uint256', 'address', 'uint256', 'uint8', 'uint8', 'string'],
            [
                '0x0000000000000000000000000000000000000000000000000000000000000000', // blockhash
                Date.now(), // timestamp approximation
                "0x1234567890123456789012345678901234567890",
                123,
                1,
                0,
                "CHAOS"
            ]
        );
        
        const randomValue = hre.ethers.BigNumber.from(manualRandom).mod(100);
        console.log(`Estimated random value: ${randomValue} (trigger if < 10)`);
        
    } catch (error) {
        console.log(`Manual test error: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug failed:", error);
        process.exit(1);
    });
