const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Detailed Race Logs - Base Stats Only");
    console.log("=======================================");
    
    const [deployer] = await ethers.getSigners();
    
    // Deploy contracts
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    
    const AchievementNFT = await ethers.getContractFactory("contracts/AchievementNFT.sol:AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address, achievementNFT.address);
    
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    
    // Fund contracts
    await spiralToken.transfer(spaceshipRace.address, ethers.utils.parseUnits("10000", 8));
    await spiralToken.transfer(deployer.address, ethers.utils.parseUnits("1000", 8));
    await spiralToken.approve(spaceshipRace.address, ethers.utils.parseUnits("1000", 8));
    
    console.log("✅ Contracts deployed and funded");
    
    const shipNames = ["The Comet", "The Juggernaut", "The Shadow", "The Phantom", "The Phoenix", "The Vanguard", "The Wildcard", "The Apex"];
    
    console.log("\n🏁 Running 1 race with detailed logs...");
    
    try {
        const betAmount = ethers.utils.parseUnits("10", 8);
        const raceResult = await spaceshipRace.callStatic.placeBet(0, betAmount);
        
        console.log(`\n🏆 Winner: ${shipNames[raceResult.winner]}`);
        
        console.log("\n📊 Turn-by-Turn Logs:");
        console.log("=====================");
        
        // Group events by turn
        const turnEvents = {};
        for (let i = 0; i < raceResult.totalEvents; i++) {
            const event = raceResult.turnEvents[i];
            if (!turnEvents[event.turn]) {
                turnEvents[event.turn] = [];
            }
            turnEvents[event.turn].push(event);
        }
        
        // Display each turn
        for (let turn = 1; turn <= 10; turn++) {
            if (turnEvents[turn]) {
                console.log(`\n🔄 Turn ${turn}:`);
                console.log("----------------");
                
                // Sort by ship ID for consistent display
                turnEvents[turn].sort((a, b) => a.shipId - b.shipId);
                
                for (const event of turnEvents[turn]) {
                    console.log(`   ${shipNames[event.shipId]}: Move ${event.moveAmount}, Distance ${event.distance}`);
                }
            }
        }
        
        console.log("\n🏁 Final Results:");
        console.log("=================");
        for (let i = 0; i < 8; i++) {
            const finalEvent = raceResult.turnEvents.find(e => e.shipId === i && e.distance >= 1000);
            if (finalEvent) {
                console.log(`   ${shipNames[i]}: Finished at Turn ${finalEvent.turn} with Distance ${finalEvent.distance}`);
            } else {
                const lastEvent = raceResult.turnEvents.filter(e => e.shipId === i).pop();
                console.log(`   ${shipNames[i]}: Did not finish, Final Distance ${lastEvent ? lastEvent.distance : 0}`);
            }
        }
        
    } catch (error) {
        console.log(`Race failed: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
