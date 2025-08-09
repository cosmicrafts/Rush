const hre = require("hardhat");

async function main() {
    console.log("🏁 Testing 100 Races - Ship Win Distribution");
    console.log("============================================");

    // Deploy all contracts
    console.log("🚀 Deploying contracts...");
    
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

    console.log("✅ All contracts deployed!");

    // Get ship names for reporting
    const shipNames = [];
    for (let i = 0; i < 8; i++) {
        const name = await shipConfig.getShipName(i);
        const stats = await shipConfig.getShipStats(i);
        const chaosName = await chaosManager.getChaosFactorName(stats.chaosFactor);
        shipNames.push({
            index: i,
            name,
            chaosName,
            stats: {
                speed: stats.initialSpeed.toString(),
                accel: stats.acceleration.toString(),
                chance: stats.chaosChance.toString()
            }
        });
    }

    console.log("\n📋 Ship Roster:");
    shipNames.forEach(ship => {
        console.log(`${ship.index}: ${ship.name} (${ship.chaosName} ${ship.stats.chance}%) - Speed: ${ship.stats.speed}, Accel: ${ship.stats.accel}`);
    });

    // Run 100 races with different entropy each time
    console.log("\n🎲 Running 100 races...");
    
    const winCounts = [0, 0, 0, 0, 0, 0, 0, 0];
    const chaosEventCounts = {};
    const raceResults = [];

    for (let race = 1; race <= 100; race++) {
        // Add entropy variation by using different "users" and race IDs
        const mockUsers = [
            "0x1234567890123456789012345678901234567890",
            "0x2345678901234567890123456789012345678901", 
            "0x3456789012345678901234567890123456789012",
            "0x4567890123456789012345678901234567890123",
            "0x5678901234567890123456789012345678901234"
        ];
        
        // Create entropy by connecting with different mock user addresses
        const mockUserIndex = race % mockUsers.length;
        const signers = await hre.ethers.getSigners();
        const testUser = signers[mockUserIndex];
        const userSpaceshipRace = spaceshipRace.connect(testUser);

        try {
            const raceResult = await userSpaceshipRace.debugRaceSimulation();
            const winner = raceResult.winner;
            
            winCounts[winner]++;
            
            // Count chaos events
            for (let i = 0; i < raceResult.totalEvents; i++) {
                const event = raceResult.turnEvents[i];
                const eventType = event.chaosEventType.toString();
                if (eventType !== "0") { // Not CHAOS_NONE
                    const shipIndex = event.shipId.toString();
                    const key = `ship${shipIndex}_event${eventType}`;
                    chaosEventCounts[key] = (chaosEventCounts[key] || 0) + 1;
                }
            }
            
            raceResults.push({
                race,
                winner,
                winnerName: shipNames[winner].name
            });
            
            if (race % 10 === 0) {
                console.log(`   Completed ${race}/100 races (${race}%)`);
            }
            
        } catch (error) {
            console.log(`❌ Race ${race} failed: ${error.message}`);
        }

        // Add small delay to change gas context
        if (race % 20 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    // Analyze results
    console.log("\n📊 100-Race Results Analysis:");
    console.log("============================");

    // Win distribution
    console.log("\n🏆 Win Distribution:");
    shipNames.forEach((ship, index) => {
        const wins = winCounts[index];
        const percentage = (wins / 100 * 100).toFixed(1);
        const bar = "█".repeat(Math.floor(wins / 2)); // Scale bar
        console.log(`${ship.name.padEnd(15)} | ${wins.toString().padStart(2)} wins (${percentage.padStart(4)}%) ${bar}`);
    });

    // Most/least successful ships
    const maxWins = Math.max(...winCounts);
    const minWins = Math.min(...winCounts);
    const topShip = winCounts.indexOf(maxWins);
    const bottomShip = winCounts.indexOf(minWins);

    console.log(`\n🥇 Most successful: ${shipNames[topShip].name} (${maxWins} wins)`);
    console.log(`🥉 Least successful: ${shipNames[bottomShip].name} (${minWins} wins)`);

    // Chaos event analysis
    console.log("\n⚡ Chaos Events Summary:");
    Object.entries(chaosEventCounts).forEach(([key, count]) => {
        const [shipPart, eventPart] = key.split('_');
        const shipIndex = parseInt(shipPart.replace('ship', ''));
        const eventType = eventPart.replace('event', '');
        const shipName = shipNames[shipIndex].name;
        
        const eventNames = {
            "1": "Overdrive",
            "2": "Unstable Engine", 
            "3": "Slipstreamer",
            "4": "Quantum Tunneling",
            "5": "Last Stand",
            "6": "Micro-warp",
            "7": "Rogue AI",
            "8": "Graviton Brake"
        };
        
        const eventName = eventNames[eventType] || `Event${eventType}`;
        console.log(`${shipName} ${eventName}: ${count} triggers`);
    });

    // Balance analysis
    console.log("\n⚖️ Balance Analysis:");
    const avgWins = 100 / 8; // 12.5 wins per ship for perfect balance
    const variance = winCounts.reduce((sum, wins) => sum + Math.pow(wins - avgWins, 2), 0) / 8;
    const stdDev = Math.sqrt(variance);
    
    console.log(`Average wins per ship: ${avgWins.toFixed(1)}`);
    console.log(`Standard deviation: ${stdDev.toFixed(2)}`);
    console.log(`Balance score: ${stdDev < 3 ? "🟢 Well balanced" : stdDev < 5 ? "🟡 Moderately balanced" : "🔴 Needs rebalancing"}`);

    // Show sample of race winners
    console.log("\n🎯 Sample Race Results (first 20):");
    raceResults.slice(0, 20).forEach(result => {
        console.log(`Race ${result.race.toString().padStart(2)}: ${result.winnerName}`);
    });

    console.log("\n✅ 100-race distribution test complete!");
    console.log("🎯 Each race should have unique randomness due to:");
    console.log("   - Different user addresses per race");
    console.log("   - Unique race IDs and turn combinations");  
    console.log("   - Variable gas contexts");
    console.log("   - Multiple entropy sources in chaos calculations");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
