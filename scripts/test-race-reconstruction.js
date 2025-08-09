const { ethers } = require("hardhat");

async function main() {
    console.log("🎮 Testing Race Reconstruction Interface");
    console.log("=======================================");
    
    // Get signers
    const [deployer, player] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🎮 Player: ${player.address}`);
    
    // Deploy contracts
    console.log("\n📦 Deploying modular contracts...");
    
    const SpiralToken = await ethers.getContractFactory("SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    await spiralToken.deployed();
    console.log(`✅ SpiralToken deployed to: ${spiralToken.address}`);
    
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    await achievementNFT.deployed();
    console.log(`✅ AchievementNFT deployed to: ${achievementNFT.address}`);
    
    const ShipConfiguration = await ethers.getContractFactory("ShipConfiguration");
    const shipConfig = await ShipConfiguration.deploy();
    await shipConfig.deployed();
    console.log(`✅ ShipConfiguration deployed to: ${shipConfig.address}`);
    
    const ChaosManager = await ethers.getContractFactory("ChaosManager");
    const chaosManager = await ChaosManager.deploy(shipConfig.address);
    await chaosManager.deployed();
    console.log(`✅ ChaosManager deployed to: ${chaosManager.address}`);
    
    const SpaceshipRace = await ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(
        spiralToken.address,
        achievementNFT.address,
        shipConfig.address,
        chaosManager.address
    );
    await spaceshipRace.deployed();
    console.log(`✅ SpaceshipRace deployed to: ${spaceshipRace.address}`);
    
    // Set up contracts
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    console.log(`✅ Set SpaceshipRace contract address in AchievementNFT`);
    
    // Fund contracts and player
    const gamePool = ethers.utils.parseUnits("500000", 8); // 500,000 SPIRAL
    await spiralToken.transfer(spaceshipRace.address, gamePool);
    
    const playerFunds = ethers.utils.parseUnits("10000", 8); // 10,000 SPIRAL
    await spiralToken.transfer(player.address, playerFunds);
    await spiralToken.connect(player).approve(spaceshipRace.address, ethers.constants.MaxUint256);
    
    console.log(`💰 Funded game contract and player with SPIRAL tokens`);
    
    // Test 1: Debug Race Simulation
    console.log("\n🧪 Test 1: Debug Race Simulation");
    console.log("================================");
    
    const debugResult = await spaceshipRace.debugRaceSimulation();
    console.log(`🏁 Winner: Ship ${debugResult.winner}`);
    console.log(`📊 Total Events: ${debugResult.totalEvents}`);
    console.log(`🏆 Placements: [${debugResult.placements.join(', ')}]`);
    
    // Show first few turn events
    console.log(`\n📋 First 10 Turn Events:`);
    for (let i = 0; i < Math.min(10, debugResult.totalEvents); i++) {
        const event = debugResult.turnEvents[i];
        const chaosText = getChaosEventText(Number(event.chaosEventType), Number(event.shipId), Number(event.targetShipId));
        console.log(`   Turn ${event.turn}: Ship ${event.shipId} moves ${event.moveAmount} to ${event.distance}${chaosText ? ` - ${chaosText}` : ''}`);
    }
    
    // Test 2: Place Bet and Get Race Result
    console.log("\n🎲 Test 2: Place Bet and Get Race Result");
    console.log("========================================");
    
    const betAmount = ethers.utils.parseUnits("100", 8); // 100 SPIRAL
    const chosenShip = 3; // Phantom
    
    console.log(`💰 Placing bet of 100 SPIRAL on Ship ${chosenShip} (Phantom)`);
    
    const tx = await spaceshipRace.connect(player).placeBet(chosenShip, betAmount);
    const receipt = await tx.wait();
    
    // Extract BetPlaced event
    const betEvent = receipt.logs.find(log => {
        try {
            const parsed = spaceshipRace.interface.parseLog(log);
            return parsed.name === 'BetPlaced';
        } catch (e) {
            return false;
        }
    });
    
    if (betEvent) {
        const parsed = spaceshipRace.interface.parseLog(betEvent);
        console.log(`✅ Bet placed successfully!`);
        console.log(`   - Player: ${parsed.args.player}`);
        console.log(`   - Ship: ${parsed.args.spaceship}`);
        console.log(`   - Amount: ${ethers.utils.formatUnits(parsed.args.amount, 8)} SPIRAL`);
        console.log(`   - Winner: Ship ${parsed.args.winner}`);
        console.log(`   - Payout: ${ethers.utils.formatUnits(parsed.args.payout, 8)} SPIRAL`);
        console.log(`   - Jackpot Tier: ${parsed.args.jackpotTier}`);
        
        if (Number(parsed.args.spaceship) === Number(parsed.args.winner)) {
            console.log(`🎉 Player WON the race!`);
        } else {
            console.log(`💔 Player lost, but that's racing!`);
        }
    }
    
    // Test 3: Race Reconstruction Demo
    console.log("\n🔄 Test 3: Race Reconstruction Demo");
    console.log("===================================");
    
    // Get another debug simulation for reconstruction demo
    const reconstructionDemo = await spaceshipRace.debugRaceSimulation();
    const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex'];
    
    console.log(`🏁 Reconstructing race with winner: ${shipNames[reconstructionDemo.winner]}`);
    
    // Simulate turn-by-turn progression
    console.log(`\n🎬 Turn-by-Turn Race Progression:`);
    console.log("================================");
    
    for (let turn = 1; turn <= 10; turn++) {
        const turnEvents = reconstructionDemo.turnEvents.filter(e => Number(e.turn) === turn);
        
        if (turnEvents.length > 0) {
            console.log(`\n⏰ Turn ${turn}:`);
            
            // Sort by ship ID for consistent display
            turnEvents.sort((a, b) => Number(a.shipId) - Number(b.shipId));
            
            for (const event of turnEvents) {
                const shipId = Number(event.shipId);
                const moveAmount = Number(event.moveAmount);
                const distance = Number(event.distance);
                const chaosEventType = Number(event.chaosEventType);
                const targetShipId = Number(event.targetShipId);
                
                let eventText = `   ${shipNames[shipId]}: moves ${moveAmount} → ${distance}`;
                
                if (chaosEventType > 0) {
                    const chaosText = getChaosEventText(chaosEventType, shipId, targetShipId);
                    eventText += ` ${chaosText}`;
                }
                
                // Add progress bar
                const progress = Math.min(100, Math.floor((distance / 1000) * 100));
                const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
                eventText += ` [${progressBar}] ${progress}%`;
                
                console.log(eventText);
            }
        }
    }
    
    // Final standings
    console.log(`\n🏆 Final Standings:`);
    console.log("==================");
    
    const placements = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th', '7th', '8th'];
    reconstructionDemo.placements.forEach((shipId, index) => {
        console.log(`${placements[index]}: ${shipNames[Number(shipId)]}`);
    });
    
    console.log(`\n✅ Race reconstruction interface working perfectly!`);
    console.log(`🚀 Ready for frontend integration!`);
}

// Helper function for chaos event text
function getChaosEventText(eventType, shipId, targetId) {
    const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex'];
    
    switch (eventType) {
        case 1: return `🔥 Overdrive!`
        case 2: return `⚡ Unstable Engine!`
        case 3: return `💨 Slipstream!`
        case 4: return `🌀 Quantum Tunneling!`
        case 5: return `🚀 Last Stand!`
        case 6: return `⚡ Micro-warp!`
        case 7: return `🤖 Rogue AI!`
        case 8: return `🛑 Graviton Brake on ${shipNames[targetId]}!`
        case 9: return `💥 Braked!`
        default: return ''
    }
}

main()
    .then(() => {
        console.log("\n✅ Race reconstruction test completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Test failed:");
        console.error(error);
        process.exit(1);
    });
