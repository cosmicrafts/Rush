const { ethers } = require("hardhat");

async function main() {
    console.log("🔥 Testing The Comet's Overdrive Chaos Factor");
    console.log("=============================================");
    
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
    
    console.log("\n🔍 Running 100 races to test Overdrive chaos factor...");
    
    let overdriveCount = 0;
    let totalTurns = 0;
    
    for (let raceNum = 1; raceNum <= 100; raceNum++) {
        try {
            // Call the debug function to get race simulation
            const raceResult = await spaceshipRace.debugRaceSimulation();
            
            // Check for Overdrive events in The Comet's turns
            let raceOverdrives = 0;
            for (let i = 0; i < raceResult.totalEvents; i++) {
                const event = raceResult.turnEvents[i];
                if (event.shipId === 0) { // The Comet
                    totalTurns++;
                    if (event.chaosEventType === 1) { // CHAOS_OVERDRIVE
                        raceOverdrives++;
                        overdriveCount++;
                        console.log(`🏁 Race ${raceNum}: Winner = ${shipNames[raceResult.winner]}`);
                        console.log(`   🔥 Overdrive triggered! Turn ${event.turn}: Move ${event.moveAmount}, Distance ${event.distance}`);
                    }
                }
            }
            
            // Show progress every 20 races
            if (raceNum % 20 === 0) {
                console.log(`   Progress: ${raceNum}/100 races completed`);
            }
            
        } catch (error) {
            console.log(`Race ${raceNum} failed: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Overdrive Statistics:`);
    console.log(`=============================`);
    console.log(`Total Comet turns: ${totalTurns}`);
    console.log(`Overdrive triggers: ${overdriveCount}`);
    console.log(`Actual trigger rate: ${((overdriveCount / totalTurns) * 100).toFixed(2)}%`);
    console.log(`Expected trigger rate: 10%`);
    
    if (overdriveCount > 0) {
        console.log(`\n✅ Overdrive chaos factor is working!`);
    } else {
        console.log(`\n❌ No Overdrive events detected - may need more test runs`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
