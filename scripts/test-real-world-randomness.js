const hre = require("hardhat");

async function main() {
    console.log("🌍 Testing Real-World Randomness Simulation");
    console.log("==========================================");

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

    // Get multiple signers to simulate different users
    const signers = await hre.ethers.getSigners();
    console.log(`✅ Got ${signers.length} different users for testing`);

    // Test with different users (simulating real-world usage)
    console.log("\n🎲 Testing with different users and race IDs...");
    
    const chaosEvents = {
        overdrive: 0,
        unstable: 0,
        total: 0
    };

    const results = [];

    for (let i = 0; i < 20; i++) {
        // Use different signer each time
        const signer = signers[i % signers.length];
        const raceSpaceshipRace = spaceshipRace.connect(signer);
        
        // Simulate different race IDs (as would happen in real usage)
        const simulatedRaceId = 1000 + i * 7; // Different race IDs
        
        console.log(`\n--- User ${signer.address.slice(-4)} | Race ${simulatedRaceId} ---`);
        
        // Test individual chaos calls with this user's address
        const cometCheck = await chaosManager.applyChaosEffect(
            0, // The Comet
            Math.floor(Math.random() * 8) + 1, // Random turn 1-8
            78 + Math.floor(Math.random() * 50), // Variable speed
            simulatedRaceId,
            signer.address
        );
        
        const juggernautCheck = await chaosManager.applyChaosEffect(
            1, // The Juggernaut
            Math.floor(Math.random() * 8) + 1, // Random turn 1-8
            85 + Math.floor(Math.random() * 40), // Variable speed
            simulatedRaceId,
            signer.address
        );
        
        const cometTriggered = cometCheck.eventType == 1;
        const juggernautTriggered = juggernautCheck.eventType == 2;
        
        console.log(`Comet: ${cometTriggered ? '🔥 OVERDRIVE' : '❌ No'} | Juggernaut: ${juggernautTriggered ? '⚡ UNSTABLE' : '❌ No'}`);
        
        if (cometTriggered) chaosEvents.overdrive++;
        if (juggernautTriggered) chaosEvents.unstable++;
        chaosEvents.total++;
        
        results.push({
            user: signer.address.slice(-4),
            raceId: simulatedRaceId,
            comet: cometTriggered,
            juggernaut: juggernautTriggered
        });
        
        // Add small delay to simulate real-world timing
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Analyze results
    console.log("\n📊 Real-World Simulation Results:");
    console.log("=================================");
    
    console.log(`\nOverdrive (Expected: ~10%):`);
    console.log(`- Triggers: ${chaosEvents.overdrive}/${chaosEvents.total}`);
    console.log(`- Rate: ${((chaosEvents.overdrive / chaosEvents.total) * 100).toFixed(1)}%`);
    
    console.log(`\nUnstable Engine (Expected: ~25%):`);
    console.log(`- Triggers: ${chaosEvents.unstable}/${chaosEvents.total}`);
    console.log(`- Rate: ${((chaosEvents.unstable / chaosEvents.total) * 100).toFixed(1)}%`);
    
    // Show distribution across users
    const userStats = {};
    results.forEach(r => {
        if (!userStats[r.user]) userStats[r.user] = { comet: 0, juggernaut: 0, total: 0 };
        if (r.comet) userStats[r.user].comet++;
        if (r.juggernaut) userStats[r.user].juggernaut++;
        userStats[r.user].total++;
    });
    
    console.log(`\n👥 Distribution by User:`);
    Object.entries(userStats).forEach(([user, stats]) => {
        console.log(`User ...${user}: Comet ${stats.comet}/${stats.total} (${((stats.comet/stats.total)*100).toFixed(0)}%) | Juggernaut ${stats.juggernaut}/${stats.total} (${((stats.juggernaut/stats.total)*100).toFixed(0)}%)`);
    });

    // Test with actual bet simulation
    console.log("\n🎰 Testing with actual bet simulation...");
    
    // Mint tokens for testing
    const testAmount = hre.ethers.utils.parseEther("100");
    for (let i = 0; i < 3; i++) {
        await spiralToken.transfer(signers[i].address, testAmount);
    }
    
    for (let i = 0; i < 3; i++) {
        const signer = signers[i];
        const userSpaceshipRace = spaceshipRace.connect(signer);
        const userSpiralToken = spiralToken.connect(signer);
        
        // Approve tokens
        await userSpiralToken.approve(spaceshipRace.address, testAmount);
        
        console.log(`\nUser ${signer.address.slice(-4)} placing bet...`);
        
        try {
            const betTx = await userSpaceshipRace.placeBet(0, hre.ethers.utils.parseEther("10"));
            const receipt = await betTx.wait();
            
            console.log(`✅ Bet placed successfully! Gas used: ${receipt.gasUsed}`);
            
            // Different gas usage = different entropy!
            
        } catch (error) {
            console.log(`❌ Bet failed: ${error.message}`);
        }
    }

    console.log("\n✅ Real-world simulation complete!");
    console.log("🎯 In production, each user's transaction will have unique entropy from:");
    console.log("   - Different block numbers");
    console.log("   - Different timestamps"); 
    console.log("   - Different gas states");
    console.log("   - Different user addresses");
    console.log("   - Different race IDs");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
