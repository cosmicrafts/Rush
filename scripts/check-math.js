const { ethers } = require("hardhat");

async function main() {
    console.log("🧮 Mathematical Race Calculation");
    console.log("=================================");
    
    // Ship stats from contract
    const shipStats = [
        { name: "The Comet", initialSpeed: 70, acceleration: 8 },
        { name: "The Juggernaut", initialSpeed: 85, acceleration: 12 },
        { name: "The Shadow", initialSpeed: 80, acceleration: 15 },
        { name: "The Phantom", initialSpeed: 75, acceleration: 13 },
        { name: "The Phoenix", initialSpeed: 78, acceleration: 12 },
        { name: "The Vanguard", initialSpeed: 82, acceleration: 11 },
        { name: "The Wildcard", initialSpeed: 77, acceleration: 14 },
        { name: "The Apex", initialSpeed: 88, acceleration: 9 }
    ];
    
    console.log("\n📊 Ship Stats:");
    console.log("==============");
    shipStats.forEach((ship, i) => {
        console.log(`${i + 1}. ${ship.name}: ${ship.initialSpeed} initial speed, +${ship.acceleration} acceleration`);
    });
    
    console.log("\n🏁 Race Simulation (Mathematical):");
    console.log("==================================");
    
    const results = [];
    
    for (let shipIndex = 0; shipIndex < 8; shipIndex++) {
        const ship = shipStats[shipIndex];
        let currentSpeed = ship.initialSpeed;
        let distance = 0;
        let turnCount = 0;
        let finishTurn = 0;
        let finishFraction = 0;
        
        console.log(`\n${ship.name}:`);
        console.log(`  Turn 0: Speed ${currentSpeed}, Distance 0`);
        
        for (let turn = 1; turn <= 10; turn++) {
            const moveAmount = currentSpeed;
            const newDistance = distance + moveAmount;
            
            console.log(`  Turn ${turn}: Move ${moveAmount}, Speed ${currentSpeed}, Distance ${distance} -> ${newDistance}`);
            
            // Check if finished this turn
            if (newDistance >= 1000 && finishTurn === 0) {
                const distanceNeeded = 1000 - distance;
                const fraction = distanceNeeded / moveAmount;
                finishTurn = turn;
                finishFraction = fraction;
                console.log(`  *** FINISHED at Turn ${turn}.${(fraction * 100).toFixed(2)}% ***`);
                break;
            }
            
            distance = newDistance;
            currentSpeed += ship.acceleration;
        }
        
        if (finishTurn === 0) {
            console.log(`  Did not finish. Final distance: ${distance}`);
        }
        
        results.push({
            name: ship.name,
            finishTurn: finishTurn,
            finishFraction: finishFraction,
            finalDistance: distance
        });
    }
    
    // Sort by finish time
    results.sort((a, b) => {
        if (a.finishTurn === 0 && b.finishTurn === 0) {
            return b.finalDistance - a.finalDistance;
        }
        if (a.finishTurn === 0) return 1;
        if (b.finishTurn === 0) return -1;
        
        const aTime = a.finishTurn + a.finishFraction;
        const bTime = b.finishTurn + b.finishFraction;
        return aTime - bTime;
    });
    
    console.log("\n🏆 Predicted Finish Order:");
    console.log("==========================");
    results.forEach((result, i) => {
        if (result.finishTurn > 0) {
            console.log(`${i + 1}. ${result.name}: Turn ${result.finishTurn}.${(result.finishFraction * 100).toFixed(2)}%`);
        } else {
            console.log(`${i + 1}. ${result.name}: Did not finish (Distance: ${result.finalDistance})`);
        }
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

