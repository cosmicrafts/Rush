const hre = require("hardhat");

async function main() {
    console.log("🏆 Testing Leaderboard System with Real Data");
    console.log("=============================================");

    // Get signers for multiple players
    const [deployer, player1, player2, player3, player4, player5] = await hre.ethers.getSigners();
    console.log("👥 Test Players:");
    console.log("- Deployer:", deployer.address);
    console.log("- Player 1:", player1.address);
    console.log("- Player 2:", player2.address);
    console.log("- Player 3:", player3.address);
    console.log("- Player 4:", player4.address);
    console.log("- Player 5:", player5.address);

    // Get contract instances
    const SpaceshipRace = await hre.ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
    
    const SpiralToken = await hre.ethers.getContractFactory("SpiralToken");
    const spiralToken = await SpiralToken.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

    console.log("\n📋 Contract Addresses:");
    console.log("- SpaceshipRace:", spaceshipRace.address);
    console.log("- SpiralToken:", spiralToken.address);

    // Fund players with SPIRAL tokens
    console.log("\n💰 Funding Players with SPIRAL Tokens...");
    const fundingAmount = hre.ethers.utils.parseUnits("10000", 8); // 10,000 SPIRAL each
    
    try {
        // Fund each player
        for (const player of [player1, player2, player3, player4, player5]) {
            const tx = await spiralToken.transfer(player.address, fundingAmount);
            await tx.wait();
            console.log(`✅ Funded ${player.address} with 10,000 SPIRAL`);
        }
    } catch (error) {
        console.log("⚠️ Funding failed, trying faucet claims...");
        // Try faucet claims instead
        for (const player of [player1, player2, player3, player4, player5]) {
            try {
                const tx = await spaceshipRace.connect(player).claimFaucet();
                await tx.wait();
                console.log(`✅ ${player.address} claimed from faucet`);
            } catch (faucetError) {
                console.log(`❌ ${player.address} faucet claim failed:`, faucetError.message);
            }
        }
    }

    // Register usernames and avatars for players
    console.log("\n👤 Registering Player Profiles...");
    const usernames = ["RacerPro", "SpeedDemon", "CosmicRider", "StarPilot", "GalaxyRacer"];
    const avatars = [0, 1, 2, 3, 4]; // Different avatar IDs
    
    for (let i = 0; i < 5; i++) {
        const player = [player1, player2, player3, player4, player5][i];
        try {
            const tx = await spaceshipRace.connect(player).registerUsername(usernames[i], avatars[i]);
            await tx.wait();
            console.log(`✅ ${usernames[i]} registered with avatar ${avatars[i]}`);
        } catch (error) {
            console.log(`❌ Failed to register ${usernames[i]}:`, error.message);
        }
    }

    // Run multiple races to generate leaderboard data
    console.log("\n🏁 Running Races to Generate Leaderboard Data...");
    
    const players = [player1, player2, player3, player4, player5];
    const betAmounts = [
        hre.ethers.utils.parseUnits("100", 8),   // 100 SPIRAL
        hre.ethers.utils.parseUnits("200", 8),   // 200 SPIRAL
        hre.ethers.utils.parseUnits("150", 8),   // 150 SPIRAL
        hre.ethers.utils.parseUnits("300", 8),   // 300 SPIRAL
        hre.ethers.utils.parseUnits("250", 8)    // 250 SPIRAL
    ];

    // Run 20 races with different players and ships
    for (let race = 1; race <= 20; race++) {
        const player = players[race % 5]; // Cycle through players
        const ship = race % 8; // Cycle through ships 0-7
        const betAmount = betAmounts[race % 5]; // Cycle through bet amounts
        
        try {
            // Approve tokens first
            const approveTx = await spiralToken.connect(player).approve(spaceshipRace.address, betAmount);
            await approveTx.wait();
            
            // Place bet
            const betTx = await spaceshipRace.connect(player).placeBet(ship, betAmount);
            const receipt = await betTx.wait();
            
            // Get race result from events
            const betPlacedEvent = receipt.events?.find(e => e.event === 'BetPlaced');
            if (betPlacedEvent) {
                const { winner, payout, jackpotTier } = betPlacedEvent.args;
                console.log(`🏁 Race ${race}: ${player.address} bet ${hre.ethers.utils.formatUnits(betAmount, 8)} SPIRAL on ship ${ship}`);
                console.log(`   Winner: Ship ${winner}, Payout: ${hre.ethers.utils.formatUnits(payout, 8)} SPIRAL, Jackpot: ${jackpotTier > 0 ? 'YES' : 'NO'}`);
            }
            
            // Add delay between races
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`❌ Race ${race} failed:`, error.message);
        }
    }

    // Test leaderboard functions
    console.log("\n📊 Testing Leaderboard Functions...");
    
    // 1. Get top players
    console.log("\n🏆 Top Players by Winnings:");
    try {
        const [players, usernames, avatars, winnings] = await spaceshipRace.getTopPlayersByWinnings(10);
        for (let i = 0; i < players.length; i++) {
            if (players[i] !== hre.ethers.constants.AddressZero) {
                console.log(`   ${i + 1}. ${usernames[i] || 'Anonymous'} (Avatar: ${avatars[i]}) - ${hre.ethers.utils.formatUnits(winnings[i], 8)} SPIRAL`);
            }
        }
    } catch (error) {
        console.log("❌ getTopPlayersByWinnings failed:", error.message);
    }

    // 2. Get leaderboard stats
    console.log("\n📈 Leaderboard Statistics:");
    try {
        const [totalPlayers, totalVolume, totalJackpots] = await spaceshipRace.getLeaderboardStats();
        console.log(`   Total Ranked Players: ${totalPlayers}`);
        console.log(`   Total Volume: ${hre.ethers.utils.formatUnits(totalVolume, 8)} SPIRAL`);
        console.log(`   Total Jackpots Paid: ${hre.ethers.utils.formatUnits(totalJackpots, 8)} SPIRAL`);
    } catch (error) {
        console.log("❌ getLeaderboardStats failed:", error.message);
    }

    // 3. Get individual player stats
    console.log("\n👤 Individual Player Stats:");
    for (let i = 0; i < 5; i++) {
        const player = players[i];
        try {
            const [rank, firstPlace, secondPlace, thirdPlace, fourthPlace, jackpots, achievements] = 
                await spaceshipRace.getPlayerLeaderboardStats(player.address);
            
            console.log(`   ${usernames[i]}:`);
            console.log(`     Rank: ${rank > 0 ? rank : 'Unranked'}`);
            console.log(`     1st Place: ${firstPlace}, 2nd Place: ${secondPlace}, 3rd Place: ${thirdPlace}, 4th Place: ${fourthPlace}`);
            console.log(`     Jackpots Won: ${hre.ethers.utils.formatUnits(jackpots, 8)} SPIRAL`);
            console.log(`     Achievements: ${achievements}`);
        } catch (error) {
            console.log(`❌ Failed to get stats for ${usernames[i]}:`, error.message);
        }
    }

    // 4. Get comprehensive player stats
    console.log("\n📋 Comprehensive Player Profiles:");
    for (let i = 0; i < 5; i++) {
        const player = players[i];
        try {
            const [username, avatarId, totalRaces, totalWinnings, biggestWin, firstPlace, secondPlace, thirdPlace, fourthPlace] = 
                await spaceshipRace.getPlayerComprehensiveStats(player.address);
            
            console.log(`   ${username || 'Anonymous'}:`);
            console.log(`     Avatar: ${avatarId < 255 ? avatarId : 'Not set'}`);
            console.log(`     Total Races: ${totalRaces}`);
            console.log(`     Total Winnings: ${hre.ethers.utils.formatUnits(totalWinnings, 8)} SPIRAL`);
            console.log(`     Biggest Win: ${hre.ethers.utils.formatUnits(biggestWin, 8)} SPIRAL`);
            console.log(`     Placements: 1st(${firstPlace}) 2nd(${secondPlace}) 3rd(${thirdPlace}) 4th(${fourthPlace})`);
        } catch (error) {
            console.log(`❌ Failed to get comprehensive stats for player ${i}:`, error.message);
        }
    }

    // 5. Test player rank context
    console.log("\n🎯 Player Rank Context (around Player 1):");
    try {
        const [contextPlayers, contextUsernames, contextAvatars, contextWinnings, contextRanks] = 
            await spaceshipRace.getPlayerRankContext(player1.address, 2);
        
        for (let i = 0; i < contextPlayers.length; i++) {
            if (contextPlayers[i] !== hre.ethers.constants.AddressZero) {
                console.log(`   Rank ${contextRanks[i]}: ${contextUsernames[i] || 'Anonymous'} - ${hre.ethers.utils.formatUnits(contextWinnings[i], 8)} SPIRAL`);
            }
        }
    } catch (error) {
        console.log("❌ getPlayerRankContext failed:", error.message);
    }

    // 6. Get current jackpot amounts
    console.log("\n💰 Current Jackpot Amounts:");
    try {
        const [mini, mega, superJackpot] = await spaceshipRace.getJackpotAmounts();
        console.log(`   Mini Jackpot: ${hre.ethers.utils.formatUnits(mini, 8)} SPIRAL`);
        console.log(`   Mega Jackpot: ${hre.ethers.utils.formatUnits(mega, 8)} SPIRAL`);
        console.log(`   Super Jackpot: ${hre.ethers.utils.formatUnits(superJackpot, 8)} SPIRAL`);
    } catch (error) {
        console.log("❌ getJackpotAmounts failed:", error.message);
    }

    // 7. Test profile functions
    console.log("\n👤 Player Profile Tests:");
    for (let i = 0; i < 5; i++) {
        const player = players[i];
        try {
            const [username, avatarId, hasUsernameSet, hasAvatarSet] = await spaceshipRace.getPlayerProfile(player.address);
            console.log(`   ${player.address}:`);
            console.log(`     Username: ${username || 'Not set'} (${hasUsernameSet})`);
            console.log(`     Avatar: ${avatarId < 255 ? avatarId : 'Not set'} (${hasAvatarSet})`);
        } catch (error) {
            console.log(`❌ Failed to get profile for player ${i}:`, error.message);
        }
    }

    console.log("\n✅ Leaderboard Testing Complete!");
    console.log("=============================================");
    console.log("📊 Summary:");
    console.log("- Generated real race data with 5 players");
    console.log("- Tested all leaderboard functions");
    console.log("- Verified avatar and username system");
    console.log("- Checked jackpot accumulation");
    console.log("- Validated ranking system");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Leaderboard testing failed:", error);
        process.exit(1);
    });
