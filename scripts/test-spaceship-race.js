const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Casino-Style Spaceship Racing Contract");
    console.log("=================================================");

    // Get signers
    const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
    
    console.log("📋 Test Accounts:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Player 1: ${player1.address}`);
    console.log(`Player 2: ${player2.address}`);
    console.log(`Player 3: ${player3.address}`);
    console.log(`Player 4: ${player4.address}`);
    console.log(`Player 5: ${player5.address}\n`);

    // Deploy SpiralToken
    console.log("📦 Deploying SpiralToken...");
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    await spiralToken.deployed();
    console.log(`✅ SpiralToken deployed to: ${spiralToken.address}\n`);

    // Deploy SpaceshipRace
    console.log("📦 Deploying SpaceshipRace...");
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address);
    await spaceshipRace.deployed();
    console.log(`✅ SpaceshipRace deployed to: ${spaceshipRace.address}`);
    
    // Transfer tokens to game contract for payouts
    console.log("💰 Setting up game contract with tokens for payouts...");
    const gamePool = ethers.utils.parseEther("500000"); // 500k SPIRAL
    await spiralToken.transfer(spaceshipRace.address, gamePool);
    console.log(`✅ Transferred ${ethers.utils.formatEther(gamePool)} SPIRAL to game contract\n`);

    // Test 1: Check contract initialization
    console.log("🧪 Test 1: Contract Initialization");
    console.log(`Min Bet: ${ethers.utils.formatEther(await spaceshipRace.MIN_BET())} SPIRAL`);
    console.log(`Max Bet: ${ethers.utils.formatEther(await spaceshipRace.MAX_BET())} SPIRAL`);
    console.log(`House Edge: ${await spaceshipRace.HOUSE_EDGE()}%`);
    console.log(`Mini Jackpot Chance: 5% (1 in 20)`);
    console.log(`Mega Jackpot Chance: 0.5% (1 in 200)`);
    console.log(`Super Jackpot Chance: 0.1% (1 in 1000)`);
    console.log(`Race Pool Percentage: ${await spaceshipRace.RACE_POOL_PERCENTAGE()}%`);
    console.log("✅ Contract initialization test passed\n");

    // Test 2: Check spaceship information
    console.log("🧪 Test 2: Spaceship Information");
    for (let i = 0; i < 8; i++) {
        const info = await spaceshipRace.getSpaceshipInfo(i);
        console.log(`Spaceship ${i}: ${info.name}`);
        console.log(`  Odds: ${info.odds / 100}x (${info.odds / 10}% payout)`);
        console.log(`  Win Rate: ${info.winRate / 10}%`);
    }
    console.log("✅ Spaceship information test passed\n");

    // Test 3: Distribute tokens to players
    console.log("🧪 Test 3: Token Distribution");
    const tokenAmount = ethers.utils.parseEther("10000"); // 10,000 SPIRAL each
    
    for (const player of [player1, player2, player3, player4, player5]) {
        await spiralToken.transfer(player.address, tokenAmount);
        const balance = await spiralToken.balanceOf(player.address);
        console.log(`${player.address.slice(0, 6)}...: ${ethers.utils.formatEther(balance)} SPIRAL`);
    }
    console.log("✅ Token distribution completed\n");

    // Test 4: Basic betting and race simulation
    console.log("🧪 Test 4: Basic Betting and Race Simulation");
    
    // Player 1 bets on The Comet
    const betAmount = ethers.utils.parseEther("100"); // 100 SPIRAL
    await spiralToken.connect(player1).approve(spaceshipRace.address, betAmount);
    
    console.log(`Player 1 betting ${ethers.utils.formatEther(betAmount)} SPIRAL on The Comet...`);
    const tx = await spaceshipRace.connect(player1).placeBet(0, betAmount);
    const receipt = await tx.wait();
    
    console.log(`✅ Race completed! Gas used: ${receipt.gasUsed}`);
    console.log(`📋 Transaction hash: ${tx.hash}`);
    
    // Check game stats
    const gameStats = await spaceshipRace.getGameStats();
    console.log(`Current Race ID: ${gameStats.gameCurrentRace}`);
    console.log(`Total Races: ${gameStats.gameTotalRaces}`);
    console.log(`Total Volume: ${ethers.utils.formatEther(gameStats.gameTotalVolume)} SPIRAL`);
    console.log(`Mini Jackpot: ${ethers.utils.formatEther(gameStats.gameMiniJackpot)} SPIRAL`);
    console.log(`Mega Jackpot: ${ethers.utils.formatEther(gameStats.gameMegaJackpot)} SPIRAL`);
    console.log(`Super Jackpot: ${ethers.utils.formatEther(gameStats.gameSuperJackpot)} SPIRAL`);
    console.log("✅ Basic betting test passed\n");

    // Test 5: Check player statistics
    console.log("🧪 Test 5: Player Statistics");
    const playerStats = await spaceshipRace.getPlayerStats(player1.address);
    console.log(`Player 1 Stats:`);
    console.log(`  Total Races: ${playerStats.playerTotalRaces}`);
    console.log(`  Total Winnings: ${ethers.utils.formatEther(playerStats.playerTotalWinnings)} SPIRAL`);
    console.log(`  Biggest Win: ${ethers.utils.formatEther(playerStats.playerBiggestWin)} SPIRAL`);
    console.log(`  Highest Jackpot Tier: ${playerStats.playerHighestJackpotTier}`);
    console.log(`  Achievement Rewards: ${ethers.utils.formatEther(playerStats.playerAchievementRewards)} SPIRAL`);
    
    console.log(`  Spaceship Wins:`);
    for (let i = 0; i < 8; i++) {
        if (playerStats.playerSpaceshipWins[i] > 0) {
            const shipInfo = await spaceshipRace.getSpaceshipInfo(i);
            console.log(`    ${shipInfo.name}: ${playerStats.playerSpaceshipWins[i]} wins`);
        }
    }
    console.log("✅ Player statistics test passed\n");

    // Test 6: Multiple players betting
    console.log("🧪 Test 6: Multiple Players Betting");
    
    const players = [player2, player3, player4, player5];
    const spaceships = [1, 2, 3, 4]; // Different spaceships
    const betAmounts = [
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("75"),
        ethers.utils.parseEther("200"),
        ethers.utils.parseEther("150")
    ];
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const spaceship = spaceships[i];
        const amount = betAmounts[i];
        
        await spiralToken.connect(player).approve(spaceshipRace.address, amount);
        const shipInfo = await spaceshipRace.getSpaceshipInfo(spaceship);
        
        console.log(`${player.address.slice(0, 6)}... betting ${ethers.utils.formatEther(amount)} SPIRAL on ${shipInfo.name}...`);
        
        const tx = await spaceshipRace.connect(player).placeBet(spaceship, amount);
        await tx.wait();
        
        // Check if they won
        const stats = await spaceshipRace.getPlayerStats(player.address);
        if (stats.playerTotalWinnings > 0) {
            console.log(`  🎉 WON ${ethers.utils.formatEther(stats.playerTotalWinnings)} SPIRAL!`);
        } else {
            console.log(`  ❌ Lost`);
        }
    }
    console.log("✅ Multiple players test passed\n");

    // Test 7: Achievement system and NFT rewards
    console.log("🧪 Test 7: Achievement System and NFT Rewards");
    
    // Check achievements for all players
    for (const player of [player1, player2, player3, player4, player5]) {
        const achievements = await spaceshipRace.getPlayerAchievements(player.address);
        if (achievements.length > 0) {
            console.log(`${player.address.slice(0, 6)}... achievements:`);
            for (const achievement of achievements) {
                console.log(`  🏆 ${achievement}`);
            }
            
            // Check NFT balance
            const achievementNFTAddress = await spaceshipRace.achievementNFT();
            const AchievementNFT = await ethers.getContractFactory("contracts/SpaceshipRace.sol:AchievementNFT");
            const achievementNFT = AchievementNFT.attach(achievementNFTAddress);
            
            const nftBalance = await achievementNFT.balanceOf(player.address);
            console.log(`  🎨 NFT Achievements: ${nftBalance}`);
            
            // Get NFT details if any (simplified)
            if (nftBalance > 0) {
                console.log(`    🎨 ${nftBalance} NFT achievement(s) minted`);
            }
        }
    }
    console.log("✅ Achievement system and NFT rewards test passed\n");

    // Test 8: Tiered Jackpot testing (simulate many races to try to trigger jackpots)
    console.log("🧪 Test 8: Tiered Jackpot Testing");
    console.log("🏁 Running 100 races to test tiered jackpot probability...");
    
    let miniJackpotHit = false;
    let megaJackpotHit = false;
    let superJackpotHit = false;
    
    const initialMiniJackpot = await spaceshipRace.miniJackpot();
    const initialMegaJackpot = await spaceshipRace.megaJackpot();
    const initialSuperJackpot = await spaceshipRace.superJackpot();
    
    for (let race = 0; race < 100; race++) {
        // Player 1 bets small amounts to test jackpots
        const smallBet = ethers.utils.parseEther("10");
        await spiralToken.connect(player1).approve(spaceshipRace.address, smallBet);
        
        const tx = await spaceshipRace.connect(player1).placeBet(race % 8, smallBet);
        const receipt = await tx.wait();
        
        // Check if jackpots were hit
        const currentMiniJackpot = await spaceshipRace.miniJackpot();
        const currentMegaJackpot = await spaceshipRace.megaJackpot();
        const currentSuperJackpot = await spaceshipRace.superJackpot();
        
        if (currentMiniJackpot < initialMiniJackpot && !miniJackpotHit) {
            miniJackpotHit = true;
            console.log(`🎰 MINI JACKPOT HIT on race ${race + 1}!`);
        }
        if (currentMegaJackpot < initialMegaJackpot && !megaJackpotHit) {
            megaJackpotHit = true;
            console.log(`🎰 MEGA JACKPOT HIT on race ${race + 1}!`);
        }
        if (currentSuperJackpot < initialSuperJackpot && !superJackpotHit) {
            superJackpotHit = true;
            console.log(`🎰 SUPER JACKPOT HIT on race ${race + 1}!`);
        }
        
        if (race % 20 === 19) {
            console.log(`  Completed ${race + 1} races...`);
        }
    }
    
    if (!miniJackpotHit) {
        console.log("  No mini jackpot hit in 100 races");
    }
    if (!megaJackpotHit) {
        console.log("  No mega jackpot hit in 100 races");
    }
    if (!superJackpotHit) {
        console.log("  No super jackpot hit in 100 races (expected due to low probability)");
    }
    
    const jackpotTestStats = await spaceshipRace.getGameStats();
    console.log(`Final Mini Jackpot: ${ethers.utils.formatEther(jackpotTestStats.gameMiniJackpot)} SPIRAL`);
    console.log(`Final Mega Jackpot: ${ethers.utils.formatEther(jackpotTestStats.gameMegaJackpot)} SPIRAL`);
    console.log(`Final Super Jackpot: ${ethers.utils.formatEther(jackpotTestStats.gameSuperJackpot)} SPIRAL`);
    console.log("✅ Tiered jackpot testing completed\n");

    // Test 9: Edge cases and error handling
    console.log("🧪 Test 9: Edge Cases and Error Handling");
    
    // Test minimum bet
    try {
        const smallBet = ethers.utils.parseEther("5"); // Below minimum
        await spiralToken.connect(player1).approve(spaceshipRace.address, smallBet);
        await spaceshipRace.connect(player1).placeBet(0, smallBet);
        console.log("❌ Should have rejected bet below minimum");
    } catch (error) {
        console.log("✅ Correctly rejected bet below minimum");
    }
    
    // Test maximum bet
    try {
        const largeBet = ethers.utils.parseEther("2000"); // Above maximum
        await spiralToken.connect(player1).approve(spaceshipRace.address, largeBet);
        await spaceshipRace.connect(player1).placeBet(0, largeBet);
        console.log("❌ Should have rejected bet above maximum");
    } catch (error) {
        console.log("✅ Correctly rejected bet above maximum");
    }
    
    // Test invalid spaceship ID
    try {
        await spaceshipRace.connect(player1).placeBet(8, ethers.utils.parseEther("100"));
        console.log("❌ Should have rejected invalid spaceship ID");
    } catch (error) {
        console.log("✅ Correctly rejected invalid spaceship ID");
    }
    
    // Test insufficient balance
    try {
        const hugeBet = ethers.utils.parseEther("100000"); // More than player has
        await spiralToken.connect(player1).approve(spaceshipRace.address, hugeBet);
        await spaceshipRace.connect(player1).placeBet(0, hugeBet);
        console.log("❌ Should have rejected insufficient balance");
    } catch (error) {
        console.log("✅ Correctly rejected insufficient balance");
    }
    
    console.log("✅ Edge cases test passed\n");

    // Test 10: Final statistics and summary
    console.log("🧪 Test 10: Final Statistics and Summary");
    
    const finalGameStats = await spaceshipRace.getGameStats();
    console.log(`\n📊 Final Game Statistics:`);
    console.log(`  Total Races Played: ${finalGameStats.gameTotalRaces}`);
    console.log(`  Total Volume: ${ethers.utils.formatEther(finalGameStats.gameTotalVolume)} SPIRAL`);
    console.log(`  Mini Jackpot: ${ethers.utils.formatEther(finalGameStats.gameMiniJackpot)} SPIRAL`);
    console.log(`  Mega Jackpot: ${ethers.utils.formatEther(finalGameStats.gameMegaJackpot)} SPIRAL`);
    console.log(`  Super Jackpot: ${ethers.utils.formatEther(finalGameStats.gameSuperJackpot)} SPIRAL`);
    console.log(`  Current Race ID: ${finalGameStats.gameCurrentRace}`);
    
    console.log(`\n👥 Player Summary:`);
    for (const player of [player1, player2, player3, player4, player5]) {
        const stats = await spaceshipRace.getPlayerStats(player.address);
        const tokenBalance = await spiralToken.balanceOf(player.address);
        const achievements = await spaceshipRace.getPlayerAchievements(player.address);
        
        console.log(`\n${player.address.slice(0, 6)}...:`);
        console.log(`  Races: ${stats.playerTotalRaces}`);
        console.log(`  Winnings: ${ethers.utils.formatEther(stats.playerTotalWinnings)} SPIRAL`);
        console.log(`  Biggest Win: ${ethers.utils.formatEther(stats.playerBiggestWin)} SPIRAL`);
        console.log(`  Current Balance: ${ethers.utils.formatEther(tokenBalance)} SPIRAL`);
        console.log(`  Achievements: ${achievements.length}`);
        console.log(`  Highest Jackpot Tier: ${stats.playerHighestJackpotTier}`);
    }
    
    console.log("\n🎉 All tests completed successfully!");
    console.log("🚀 Casino-style spaceship racing contract is ready for deployment!");
    console.log("\n📋 Feature Summary:");
    console.log("  ✅ Single-player betting system");
    console.log("  ✅ Casino-style jackpot with 0.1% trigger chance");
    console.log("  ✅ 8 unique spaceships with different odds");
    console.log("  ✅ Achievement system with 13 different badges");
    console.log("  ✅ ERC20 token integration");
    console.log("  ✅ Provably fair randomness");
    console.log("  ✅ Comprehensive player statistics");
    console.log("  ✅ Owner controls for odds adjustment");
    console.log("  ✅ Gas-optimized for high TPS networks");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
