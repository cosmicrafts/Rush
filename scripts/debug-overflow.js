const hre = require("hardhat");

async function main() {
    console.log("🔍 Debugging Overflow Issue");
    console.log("============================");

    try {
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

        console.log("✅ Contracts deployed successfully");

        // Test individual chaos factor calls first
        console.log("\n🧪 Testing individual chaos factors...");
        
        for (let shipIndex = 0; shipIndex < 8; shipIndex++) {
            try {
                const stats = await shipConfig.getShipStats(shipIndex);
                const shipName = await shipConfig.getShipName(shipIndex);
                
                console.log(`\nTesting ${shipName} (Ship ${shipIndex}):`);
                console.log(`- Speed: ${stats.initialSpeed}, Accel: ${stats.acceleration}, Chaos: ${stats.chaosFactor} (${stats.chaosChance}%)`);
                
                // Test chaos effect
                const chaosResult = await chaosManager.applyChaosEffect(
                    shipIndex,
                    5, // mid-turn
                    stats.initialSpeed.toNumber(),
                    1000,
                    "0x1234567890123456789012345678901234567890"
                );
                
                console.log(`- Chaos Result: Speed ${chaosResult.modifiedSpeed} (from ${stats.initialSpeed}), Event ${chaosResult.eventType}`);
                
                // Test acceleration effect
                const accelResult = await chaosManager.applyChaosAcceleration(
                    shipIndex,
                    5,
                    stats.acceleration.toNumber(),
                    1000,
                    "0x1234567890123456789012345678901234567890"
                );
                
                console.log(`- Accel Result: ${accelResult} (from ${stats.acceleration})`);
                
            } catch (error) {
                console.log(`❌ Ship ${shipIndex} chaos test failed: ${error.message}`);
                break;
            }
        }

        // Test with realistic accumulated speeds
        console.log("\n🏃 Testing with accumulated speeds...");
        
        const testSpeeds = [100, 200, 500, 1000, 2000, 5000];
        
        for (let speed of testSpeeds) {
            try {
                console.log(`\nTesting with speed: ${speed}`);
                
                // Test Phoenix Last Stand (x4 multiplier - most dangerous)
                const phoenixResult = await chaosManager.applyChaosEffect(
                    4, // Phoenix
                    8, // Turn 8 (should trigger Last Stand)
                    speed,
                    1000,
                    "0x1234567890123456789012345678901234567890"
                );
                
                console.log(`Phoenix result: ${phoenixResult.modifiedSpeed} (x4 from ${speed})`);
                
                if (phoenixResult.modifiedSpeed.gt(speed * 4)) {
                    console.log("⚠️ Unexpected multiplication result");
                }
                
            } catch (error) {
                console.log(`❌ Speed ${speed} test failed: ${error.message}`);
                console.log("🔍 This is likely where the overflow occurs!");
                break;
            }
        }

        // Test actual race simulation with minimal setup
        console.log("\n🏁 Testing race simulation...");
        
        try {
            const raceResult = await spaceshipRace.debugRaceSimulation();
            console.log("✅ Race simulation successful!");
            console.log(`Winner: Ship ${raceResult.winner}`);
        } catch (error) {
            console.log(`❌ Race simulation failed: ${error.message}`);
            
            // The error shows the overflow is in the main race simulation
            console.log("\n💡 The overflow is likely happening in the main race loop");
            console.log("   - Speeds accumulate each turn with acceleration");
            console.log("   - Chaos factors can multiply these accumulated speeds");
            console.log("   - By turn 8-10, speeds can be very high");
            console.log("   - 4x multiplier on high speed = overflow");
        }

    } catch (error) {
        console.log(`❌ Debug failed: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug script failed:", error);
        process.exit(1);
    });
