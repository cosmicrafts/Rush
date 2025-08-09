const { ethers } = require("hardhat");

async function main() {
    console.log("🔥 Testing Two Chaos Factors: Overdrive + Unstable Engine");
    console.log("========================================================");
    
    const [deployer] = await ethers.getSigners();
    
    // Deploy contracts
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    
    const AchievementNFT = await ethers.getContractFactory("contracts/AchievementNFT.sol:AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address, achievementNFT.address);
    
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    
    console.log("✅ Contracts deployed");
    
    const shipNames = ["The Comet", "The Juggernaut", "The Shadow", "The Phantom", "The Phoenix", "The Vanguard", "The Wildcard", "The Apex"];
    
    console.log("\n🔍 Running 100 races to test both chaos factors...");
    
    let overdriveCount = 0;
    let unstableCount = 0;
    let cometTurns = 0;
    let juggernautTurns = 0;
    
    for (let raceNum = 1; raceNum <= 100; raceNum++) {
        try {
            // Call the debug function to get race simulation
            const raceResult = await spaceshipRace.debugRaceSimulation();
            
            // Check for chaos events
            let raceOverdrives = 0;
            let raceUnstables = 0;
            
            for (let i = 0; i < raceResult.totalEvents; i++) {
                const event = raceResult.turnEvents[i];
                
                if (event.shipId === 0) { // The Comet
                    cometTurns++;
                    if (event.chaosEventType === 1) { // CHAOS_OVERDRIVE
                        raceOverdrives++;
                        overdriveCount++;
                        console.log(`🏁 Race ${raceNum}: The Comet Overdrive! Turn ${event.turn}: Move ${event.moveAmount}, Distance ${event.distance}`);
                    }
                } else if (event.shipId === 1) { // The Juggernaut
                    juggernautTurns++;
                    if (event.chaosEventType === 2) { // CHAOS_UNSTABLE
                        raceUnstables++;
                        unstableCount++;
                        console.log(`🏁 Race ${raceNum}: The Juggernaut Unstable Engine! Turn ${event.turn}: Move ${event.moveAmount}, Distance ${event.distance}`);
                    }
                }
            }
            
            // Show progress every 25 races
            if (raceNum % 25 === 0) {
                console.log(`   Progress: ${raceNum}/100 races completed`);
            }
            
        } catch (error) {
            console.log(`Race ${raceNum} failed: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Chaos Factor Statistics:`);
    console.log(`=============================`);
    console.log(`The Comet (Overdrive):`);
    console.log(`  Total turns: ${cometTurns}`);
    console.log(`  Overdrive triggers: ${overdriveCount}`);
    console.log(`  Actual trigger rate: ${((overdriveCount / cometTurns) * 100).toFixed(2)}%`);
    console.log(`  Expected trigger rate: 10%`);
    
    console.log(`\nThe Juggernaut (Unstable Engine):`);
    console.log(`  Total turns: ${juggernautTurns}`);
    console.log(`  Unstable triggers: ${unstableCount}`);
    console.log(`  Actual trigger rate: ${((unstableCount / juggernautTurns) * 100).toFixed(2)}%`);
    console.log(`  Expected trigger rate: 25%`);
    
    if (overdriveCount > 0 && unstableCount > 0) {
        console.log(`\n✅ Both chaos factors are working!`);
    } else {
        console.log(`\n❌ Some chaos factors not detected - may need more test runs`);
        if (overdriveCount === 0) console.log(`  - No Overdrive events detected`);
        if (unstableCount === 0) console.log(`  - No Unstable Engine events detected`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
