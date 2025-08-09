const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debug Final Turn Values");
    console.log("==========================");
    
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
    
    console.log("\n🏁 Running debug race simulation...");
    
    try {
        // Call the debug function to get race simulation without placing a bet
        const raceResult = await spaceshipRace.debugRaceSimulation();
        
        console.log(`\n🏆 Winner: ${shipNames[raceResult.winner]}`);
        console.log(`📊 Placements: ${raceResult.placements.map(p => shipNames[p]).join(" -> ")}`);
        
        console.log("\n📊 Final Turn Values (with fractional precision):");
        console.log("================================================");
        
        // Create a map of ship states from the turn events
        const shipStates = {};
        for (let i = 0; i < 8; i++) {
            shipStates[i] = { distance: 0, finalTurn: 0 };
        }
        
        // Process all turn events to get final states
        for (let i = 0; i < raceResult.totalEvents; i++) {
            const event = raceResult.turnEvents[i];
            shipStates[event.shipId].distance = event.distance;
            
            // If ship reached 1000, calculate finalTurn
            if (event.distance >= 1000 && shipStates[event.shipId].finalTurn === 0) {
                // Find the previous event for this ship to calculate the fractional turn
                let prevDistance = 0;
                for (let j = i - 1; j >= 0; j--) {
                    if (raceResult.turnEvents[j].shipId === event.shipId) {
                        prevDistance = raceResult.turnEvents[j].distance;
                        break;
                    }
                }
                
                const distanceNeeded = 1000 - prevDistance;
                const turnFraction = (distanceNeeded * 1e18) / event.moveAmount;
                const finalTurn = event.turn * 1e18 + turnFraction;
                shipStates[event.shipId].finalTurn = finalTurn;
            }
        }
        
        // Display final turn values
        for (let i = 0; i < 8; i++) {
            const state = shipStates[i];
            if (state.finalTurn > 0) {
                const turn = Math.floor(state.finalTurn / 1e18);
                const fraction = state.finalTurn % 1e18;
                const fractionPercent = (fraction * 100) / 1e18;
                console.log(`   ${shipNames[i]}: Turn ${turn}.${fractionPercent.toFixed(2)}% (${state.finalTurn})`);
            } else {
                console.log(`   ${shipNames[i]}: Did not finish, Distance ${state.distance}`);
            }
        }
        
        // Sort by finalTurn to show the actual order
        const sortedShips = Object.keys(shipStates).map(id => ({
            id: parseInt(id),
            name: shipNames[id],
            finalTurn: shipStates[id].finalTurn,
            distance: shipStates[id].distance
        })).sort((a, b) => {
            if (a.finalTurn === 0 && b.finalTurn === 0) {
                return b.distance - a.distance; // Higher distance first for unfinished
            }
            if (a.finalTurn === 0) return 1; // Unfinished ships go last
            if (b.finalTurn === 0) return -1;
            return a.finalTurn - b.finalTurn; // Lower finalTurn first
        });
        
        console.log("\n🏁 Actual Finish Order (by finalTurn):");
        console.log("=====================================");
        for (let i = 0; i < sortedShips.length; i++) {
            const ship = sortedShips[i];
            if (ship.finalTurn > 0) {
                const turn = Math.floor(ship.finalTurn / 1e18);
                const fraction = ship.finalTurn % 1e18;
                const fractionPercent = (fraction * 100) / 1e18;
                console.log(`   ${i + 1}. ${ship.name}: Turn ${turn}.${fractionPercent.toFixed(2)}%`);
            } else {
                console.log(`   ${i + 1}. ${ship.name}: Did not finish (Distance: ${ship.distance})`);
            }
        }
        
    } catch (error) {
        console.log(`Debug failed: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
