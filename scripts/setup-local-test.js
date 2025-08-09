const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Setting up Local Test Environment");
    console.log("===================================");
    
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
    
    // Fund contracts and player with plenty of tokens
    const gamePool = ethers.utils.parseUnits("1000000", 8); // 1M SPIRAL for testing
    await spiralToken.transfer(spaceshipRace.address, gamePool);
    
    const playerFunds = ethers.utils.parseUnits("100000", 8); // 100K SPIRAL for player
    await spiralToken.transfer(player.address, playerFunds);
    await spiralToken.connect(player).approve(spaceshipRace.address, ethers.constants.MaxUint256);
    
    console.log(`💰 Funded game contract with ${ethers.utils.formatUnits(gamePool, 8)} SPIRAL`);
    console.log(`💰 Funded player with ${ethers.utils.formatUnits(playerFunds, 8)} SPIRAL`);
    
    // Test a quick race to make sure everything works
    console.log("\n🧪 Testing Race Simulation...");
    const debugResult = await spaceshipRace.debugRaceSimulation();
    const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex'];
    console.log(`🏁 Winner: ${shipNames[debugResult.winner]} (Ship ${debugResult.winner})`);
    console.log(`📊 Total Events: ${debugResult.totalEvents}`);
    
    // Test placing a bet
    console.log("\n💰 Testing Bet Placement...");
    const betAmount = ethers.utils.parseUnits("50", 8); // 50 SPIRAL
    const chosenShip = 2; // Shadow
    
    const tx = await spaceshipRace.connect(player).placeBet(chosenShip, betAmount);
    const receipt = await tx.wait();
    
    const betEvent = receipt.events.find(e => e.event === 'BetPlaced');
    if (betEvent) {
        console.log(`✅ Bet placed successfully!`);
        console.log(`   - Ship: ${shipNames[betEvent.args.spaceship]}`);
        console.log(`   - Amount: ${ethers.utils.formatUnits(betEvent.args.amount, 8)} SPIRAL`);
        console.log(`   - Winner: ${shipNames[betEvent.args.winner]}`);
        console.log(`   - Payout: ${ethers.utils.formatUnits(betEvent.args.payout, 8)} SPIRAL`);
        
        if (Number(betEvent.args.spaceship) === Number(betEvent.args.winner)) {
            console.log(`🎉 Player WON!`);
        } else {
            console.log(`💔 Player lost, but got SPIRAL experience!`);
        }
    }
    
    console.log("\n🎯 CONTRACT ADDRESSES FOR FRONTEND:");
    console.log("===================================");
    console.log(`SpaceshipRace: ${spaceshipRace.address}`);
    console.log(`SpiralToken: ${spiralToken.address}`);
    console.log(`AchievementNFT: ${achievementNFT.address}`);
    
    console.log("\n📋 SETUP INSTRUCTIONS:");
    console.log("======================");
    console.log("1. Update CONTRACT_ADDRESS in composables/useWeb3.ts:");
    console.log(`   const CONTRACT_ADDRESS = '${spaceshipRace.address}'`);
    console.log("");
    console.log("2. In MetaMask:");
    console.log("   - Add Localhost 8545 network");
    console.log("   - Import test account using private key:");
    console.log(`   - Account: ${player.address}`);
    console.log("   - Use 'Add account' -> 'Import account' in MetaMask");
    console.log("");
    console.log("3. Start your frontend:");
    console.log("   npm run dev");
    console.log("");
    console.log("4. Connect wallet and test blockchain races!");
    console.log("");
    console.log("🚀 Everything is ready for local blockchain testing!");
}

main()
    .then(() => {
        console.log("\n✅ Local test environment setup completed successfully");
        console.log("🎮 Ready to test blockchain races in the frontend!");
        // Don't exit so Hardhat node keeps running
    })
    .catch((error) => {
        console.error("\n❌ Setup failed:");
        console.error(error);
        process.exit(1);
    });
