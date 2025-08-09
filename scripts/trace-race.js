const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Detailed Race Trace");
    console.log("======================");
    
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
    
    console.log("\n🏁 Running detailed race trace...");
    
    try {
        // Call the debug function to get race simulation
        const raceResult = await spaceshipRace.debugRaceSimulation();
        
        console.log(`\n🏆 Winner: ${shipNames[raceResult.winner]}`);
        
        // Group events by turn and ship
        const shipTraces = {};
        for (let i = 0; i < 8; i++) {
            shipTraces[i] = [];
        }
        
        for (let i = 0; i < raceResult.totalEvents; i++) {
            const event = raceResult.turnEvents[i];
            shipTraces[event.shipId].push(event);
        }
        
        // Display detailed trace for each ship
        for (let shipIndex = 0; shipIndex < 8; shipIndex++) {
            console.log(`\n${shipNames[shipIndex]}:`);
            console.log("=".repeat(shipNames[shipIndex].length + 1));
            
            const events = shipTraces[shipIndex];
            let currentSpeed = 0;
            
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                
                if (i === 0) {
                    // First turn - speed should be initial speed
                    currentSpeed = event.moveAmount;
                    console.log(`  Turn ${event.turn}: Speed ${currentSpeed}, Move ${event.moveAmount}, Distance ${event.distance}`);
                } else {
                    // Calculate what the speed should be based on previous turn
                    const prevEvent = events[i - 1];
                    const expectedSpeed = prevEvent.moveAmount + 8; // Assuming acceleration is 8 for all ships
                    console.log(`  Turn ${event.turn}: Speed ${event.moveAmount}, Move ${event.moveAmount}, Distance ${event.distance} (Expected speed: ${expectedSpeed})`);
                }
            }
        }
        
    } catch (error) {
        console.log(`Trace failed: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

