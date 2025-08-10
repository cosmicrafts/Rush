const hre = require("hardhat");

async function main() {
    console.log("🏆 Testing Epic Achievement System");
    console.log("==================================");

    // Get deployed contracts
    const spaceshipRace = await hre.ethers.getContractAt("SpaceshipRace", "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9");
    const spiralToken = await hre.ethers.getContractAt("SpiralToken", "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB");
    const achievementNFT = await hre.ethers.getContractAt("AchievementNFT", "0x9E545E3C0baAB3E08CdfD552C960A1050f373042");

    // Get test accounts
    const [deployer, player1, player2, player3, player4] = await hre.ethers.getSigners();

    console.log("\n🎯 Setting up test players...");
    
    // Fund players with SPIRAL tokens
    const fundingAmount = hre.ethers.utils.parseUnits("10000", 8); // 10,000 SPIRAL each
    await spiralToken.transfer(player1.address, fundingAmount);
    await spiralToken.transfer(player2.address, fundingAmount);
    await spiralToken.transfer(player3.address, fundingAmount);
    await spiralToken.transfer(player4.address, fundingAmount);

    console.log("✅ Players funded with SPIRAL tokens");

    // Register usernames and avatars
    const usernames = ["CosmicRacer1", "StellarPilot2", "GalaxyMaster3", "VoidWalker4"];
    const avatars = [0, 1, 2, 3];
    const players = [player1, player2, player3, player4];

    for (let i = 0; i < players.length; i++) {
        try {
            await spaceshipRace.connect(players[i]).registerUsername(usernames[i], avatars[i]);
            console.log(`✅ ${usernames[i]} registered with avatar ${avatars[i]}`);
        } catch (error) {
            console.log(`⚠️  ${usernames[i]} already registered`);
        }
    }

    console.log("\n🚀 Testing Epic Achievement System...");

    // Test 1: Betting Achievements (The Rising Star, Bearer of the Crest, Eternal Overseer)
    console.log("\n📊 Test 1: Betting Achievements");
    console.log("Testing: The Rising Star → Bearer of the Crest → Eternal Overseer");
    
    let initialBalance = await spiralToken.balanceOf(player1.address);
    console.log(`💰 ${usernames[0]} initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);

    // Place 5 bets to get "The Rising Star"
    for (let i = 0; i < 5; i++) {
        const betAmount = hre.ethers.utils.parseUnits("100", 8);
        await spiralToken.connect(player1).approve(spaceshipRace.address, betAmount);
        await spaceshipRace.connect(player1).placeBet(0, betAmount); // Ship 0 (Comet)
        console.log(`🎯 Bet ${i + 1}/5 placed on Comet`);
    }

    let finalBalance = await spiralToken.balanceOf(player1.address);
    console.log(`💰 ${usernames[0]} final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`💎 Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);

    // Test 2: Placement Achievements (Triumphant Warrior, Dominant Force)
    console.log("\n🏆 Test 2: Placement Achievements");
    console.log("Testing: Triumphant Warrior → Dominant Force");
    
    initialBalance = await spiralToken.balanceOf(player2.address);
    console.log(`💰 ${usernames[1]} initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);

    // Place bets until we get 3 wins (Triumphant Warrior)
    let wins = 0;
    let bets = 0;
    while (wins < 3 && bets < 50) {
        const betAmount = hre.ethers.utils.parseUnits("50", 8);
        await spiralToken.connect(player2).approve(spaceshipRace.address, betAmount);
        await spaceshipRace.connect(player2).placeBet(1, betAmount); // Ship 1 (Nova)
        bets++;
        
        // Check if we won (simplified check)
        const [totalRaces, totalWinnings, biggestWin, highestJackpotTier, achievementRewards, spaceshipWins] = await spaceshipRace.getPlayerStats(player2.address);
        wins = spaceshipWins[1].toNumber(); // Ship 1 (Nova) wins
        console.log(`🎯 Bet ${bets}: ${wins}/3 wins achieved`);
    }

    finalBalance = await spiralToken.balanceOf(player2.address);
    console.log(`💰 ${usernames[1]} final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`💎 Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);

    // Test 3: Milestone Achievements (Initiate of the Cosmos, Strategist in Training, Guardian of the Galaxy)
    console.log("\n🌟 Test 3: Milestone Achievements");
    console.log("Testing: Initiate of the Cosmos → Strategist in Training → Guardian of the Galaxy");
    
    initialBalance = await spiralToken.balanceOf(player3.address);
    console.log(`💰 ${usernames[2]} initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);

    // Place 10 bets to get "Initiate of the Cosmos"
    for (let i = 0; i < 10; i++) {
        const betAmount = hre.ethers.utils.parseUnits("25", 8);
        await spiralToken.connect(player3).approve(spaceshipRace.address, betAmount);
        await spaceshipRace.connect(player3).placeBet(2, betAmount); // Ship 2 (Pulsar)
        console.log(`🎯 Race ${i + 1}/10 completed`);
    }

    finalBalance = await spiralToken.balanceOf(player3.address);
    console.log(`💰 ${usernames[2]} final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`💎 Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);

    // Test 4: Special Achievements (Cosmic Conqueror, Super Jackpot Hunter)
    console.log("\n👑 Test 4: Special Achievements");
    console.log("Testing: Cosmic Conqueror, Super Jackpot Hunter");
    
    initialBalance = await spiralToken.balanceOf(player4.address);
    console.log(`💰 ${usernames[3]} initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);

    // Place large bets to accumulate winnings for Cosmic Conqueror
    for (let i = 0; i < 20; i++) {
        const betAmount = hre.ethers.utils.parseUnits("1000", 8); // Large bets
        await spiralToken.connect(player4).approve(spaceshipRace.address, betAmount);
        await spaceshipRace.connect(player4).placeBet(3, betAmount); // Ship 3 (Quasar)
        console.log(`🎯 Large bet ${i + 1}/20 placed`);
    }

    finalBalance = await spiralToken.balanceOf(player4.address);
    console.log(`💰 ${usernames[3]} final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`💎 Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);

    // Test 5: NFT Verification and Metadata
    console.log("\n🎨 Test 5: NFT Verification and Metadata");
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const tokens = await achievementNFT.getTokensOfOwner(player.address);
        console.log(`\n🏆 ${usernames[i]} owns ${tokens.length} achievement NFTs:`);
        
        for (const tokenId of tokens) {
            const [name, description, type, shipId, threshold] = await achievementNFT.getAchievementInfo(tokenId);
            const tokenURI = await achievementNFT.tokenURI(tokenId);
            console.log(`  🎯 Token ${tokenId}: "${name}"`);
            console.log(`     📝 Description: ${description}`);
            console.log(`     🏷️  Type: ${type}`);
            console.log(`     🚀 Ship ID: ${shipId}`);
            console.log(`     🎯 Threshold: ${threshold}`);
            console.log(`     🔗 URI: ${tokenURI.substring(0, 100)}...`);
        }
    }

    // Test 6: Achievement Rewards Summary
    console.log("\n💰 Test 6: Achievement Rewards Summary");
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const achievementCount = await spaceshipRace.getPlayerAchievementsCount(player.address);
        const achievementRewards = await spaceshipRace.achievementRewardsEarned(player.address);
        const nftBalance = await achievementNFT.balanceOf(player.address);
        
        console.log(`\n🏆 ${usernames[i]} Achievement Summary:`);
        console.log(`  📊 Total Achievements: ${achievementCount}`);
        console.log(`  💰 Total Rewards Earned: ${hre.ethers.utils.formatUnits(achievementRewards, 8)} SPIRAL`);
        console.log(`  🎨 NFTs Owned: ${nftBalance}`);
    }

    // Test 7: Epic Achievement Names Showcase
    console.log("\n🌟 Test 7: Epic Achievement Names Showcase");
    console.log("🎯 Betting Progression:");
    console.log("  • The Rising Star of [Ship] (5 bets) - 50 SPIRAL");
    console.log("  • Bearer of the Crest - [Ship] (25 bets) - 200 SPIRAL");
    console.log("  • Eternal Overseer of [Ship] (100 bets) - 1000 SPIRAL");
    
    console.log("\n🏆 Placement Hierarchy:");
    console.log("  • Triumphant Warrior of [Ship] (3 wins) - 150 SPIRAL");
    console.log("  • Dominant Force of [Ship] (10 wins) - 500 SPIRAL");
    console.log("  • Guardian-in-Training - [Ship] (5 second) - 100 SPIRAL");
    console.log("  • Keeper of the Code - [Ship] (20 second) - 400 SPIRAL");
    console.log("  • Pathfinder of Peace - [Ship] (10 third) - 75 SPIRAL");
    console.log("  • Sentinel of Stability - [Ship] (50 third) - 300 SPIRAL");
    console.log("  • Harbinger of Harmony - [Ship] (15 fourth) - 50 SPIRAL");
    console.log("  • Wielder of the Will - [Ship] (75 fourth) - 250 SPIRAL");
    
    console.log("\n🌟 Milestone Journey:");
    console.log("  • Initiate of the Cosmos (10 races) - 100 SPIRAL");
    console.log("  • Strategist in Training (50 races) - 500 SPIRAL");
    console.log("  • Guardian of the Galaxy (100 races) - 2000 SPIRAL");
    
    console.log("\n👑 Special Achievements:");
    console.log("  • Cosmic Conqueror (10,000 SPIRAL winnings) - 5000 SPIRAL");
    console.log("  • Super Jackpot Hunter (Hit Super Jackpot) - 3000 SPIRAL");

    console.log("\n✅ Epic Achievement System Test Complete!");
    console.log("🎉 Players now have truly inspiring achievements with meaningful rewards!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
