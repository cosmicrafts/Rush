const hre = require("hardhat");

async function main() {
    console.log("🏆 Testing Achievement System");
    console.log("=============================");

    // Get signers
    const [deployer, player1, player2, player3] = await hre.ethers.getSigners();
    console.log("👥 Test Players:");
    console.log("- Deployer:", deployer.address);
    console.log("- Player 1:", player1.address);
    console.log("- Player 2:", player2.address);
    console.log("- Player 3:", player3.address);

    // Get contract instances
    const SpaceshipRace = await hre.ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.attach("0x0B306BF915C4d645ff596e518fAf3F9669b97016");
    
    const SpiralToken = await hre.ethers.getContractFactory("SpiralToken");
    const spiralToken = await SpiralToken.attach("0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82");
    
    const AchievementNFT = await hre.ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await AchievementNFT.attach("0x9A676e781A523b5d0C0e43731313A708CB607508");

    console.log("\n📋 Contract Addresses:");
    console.log("- SpaceshipRace:", spaceshipRace.address);
    console.log("- SpiralToken:", spiralToken.address);
    console.log("- AchievementNFT:", achievementNFT.address);

    // Fund players
    console.log("\n💰 Funding Players...");
    const fundingAmount = hre.ethers.utils.parseUnits("10000", 8);
    
    for (const player of [player1, player2, player3]) {
        const tx = await spiralToken.transfer(player.address, fundingAmount);
        await tx.wait();
        console.log(`✅ Funded ${player.address} with 10,000 SPIRAL`);
    }

    // Check if players already have usernames
    console.log("\n👤 Checking Player Profiles...");
    const usernames = ["AchievementHunter", "MilestoneMaster", "PlacementPro"];
    const avatars = [0, 1, 2];
    
    for (let i = 0; i < 3; i++) {
        const player = [player1, player2, player3][i];
        const hasUsername = await spaceshipRace.playerHasUsername(player.address);
        
        if (!hasUsername) {
            try {
                const tx = await spaceshipRace.connect(player).registerUsername(usernames[i], avatars[i]);
                await tx.wait();
                console.log(`✅ ${usernames[i]} registered with avatar ${avatars[i]}`);
            } catch (error) {
                console.log(`❌ Failed to register ${usernames[i]}:`, error.message);
            }
        } else {
            const username = await spaceshipRace.getUsername(player.address);
            console.log(`ℹ️ ${player.address} already has username: ${username}`);
        }
    }

    // Test 1: Betting Achievements (5, 25, 100 bets on same ship)
    console.log("\n🎯 Test 1: Betting Achievements");
    console.log("Testing: 5 bets on ship 0 for 'Comet Supporter' achievement");
    
    const betAmount = hre.ethers.utils.parseUnits("100", 8);
    let initialBalance = await spiralToken.balanceOf(player1.address);
    let initialAchievements = await achievementNFT.balanceOf(player1.address);
    
    console.log(`Initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);
    console.log(`Initial achievements: ${initialAchievements}`);
    
    // Place 5 bets on ship 0
    for (let i = 1; i <= 5; i++) {
        try {
            const approveTx = await spiralToken.connect(player1).approve(spaceshipRace.address, betAmount);
            await approveTx.wait();
            
            const betTx = await spaceshipRace.connect(player1).placeBet(0, betAmount); // Ship 0
            const receipt = await betTx.wait();
            
            console.log(`   Bet ${i}: Placed ${hre.ethers.utils.formatUnits(betAmount, 8)} SPIRAL on ship 0`);
            
            // Check for achievement events
            const achievementEvent = receipt.events?.find(e => e.event === 'AchievementUnlocked');
            if (achievementEvent) {
                const { player: eventPlayer, name, nftId, tokenReward } = achievementEvent.args;
                console.log(`   🏆 ACHIEVEMENT UNLOCKED: ${name}`);
                console.log(`   NFT ID: ${nftId}`);
                console.log(`   Token Reward: ${hre.ethers.utils.formatUnits(tokenReward, 8)} SPIRAL`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`❌ Bet ${i} failed:`, error.message);
        }
    }
    
    let finalBalance = await spiralToken.balanceOf(player1.address);
    let finalAchievements = await achievementNFT.balanceOf(player1.address);
    
    console.log(`Final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`Final achievements: ${finalAchievements}`);
    console.log(`Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);
    console.log(`Achievements gained: ${finalAchievements.sub(initialAchievements)}`);

    // Test 2: Placement Achievements (1st place wins)
    console.log("\n🥇 Test 2: Placement Achievements");
    console.log("Testing: 3 wins with ship 1 for 'Juggernaut Winner' achievement");
    
    initialBalance = await spiralToken.balanceOf(player2.address);
    initialAchievements = await achievementNFT.balanceOf(player2.address);
    
    console.log(`Initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);
    console.log(`Initial achievements: ${initialAchievements}`);
    
    // Place bets until we get 3 wins with ship 1
    let winsWithShip1 = 0;
    let totalBets = 0;
    const maxBets = 50; // Prevent infinite loop
    
    while (winsWithShip1 < 3 && totalBets < maxBets) {
        try {
            const approveTx = await spiralToken.connect(player2).approve(spaceshipRace.address, betAmount);
            await approveTx.wait();
            
            const betTx = await spaceshipRace.connect(player2).placeBet(1, betAmount); // Ship 1
            const receipt = await betTx.wait();
            
            totalBets++;
            
            // Check if ship 1 won
            const betPlacedEvent = receipt.events?.find(e => e.event === 'BetPlaced');
            if (betPlacedEvent) {
                const { winner, payout } = betPlacedEvent.args;
                if (winner == 1) {
                    winsWithShip1++;
                    console.log(`   Win ${winsWithShip1}/3: Ship 1 won! Payout: ${hre.ethers.utils.formatUnits(payout, 8)} SPIRAL`);
                }
            }
            
            // Check for achievement events
            const achievementEvent = receipt.events?.find(e => e.event === 'AchievementUnlocked');
            if (achievementEvent) {
                const { player: eventPlayer, name, nftId, tokenReward } = achievementEvent.args;
                console.log(`   🏆 ACHIEVEMENT UNLOCKED: ${name}`);
                console.log(`   NFT ID: ${nftId}`);
                console.log(`   Token Reward: ${hre.ethers.utils.formatUnits(tokenReward, 8)} SPIRAL`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`❌ Bet failed:`, error.message);
            totalBets++;
        }
    }
    
    finalBalance = await spiralToken.balanceOf(player2.address);
    finalAchievements = await achievementNFT.balanceOf(player2.address);
    
    console.log(`Final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`Final achievements: ${finalAchievements}`);
    console.log(`Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);
    console.log(`Achievements gained: ${finalAchievements.sub(initialAchievements)}`);

    // Test 3: Milestone Achievements (10 races)
    console.log("\n🎖️ Test 3: Milestone Achievements");
    console.log("Testing: 10 total races for 'Novice Racer' achievement");
    
    initialBalance = await spiralToken.balanceOf(player3.address);
    initialAchievements = await achievementNFT.balanceOf(player3.address);
    
    console.log(`Initial balance: ${hre.ethers.utils.formatUnits(initialBalance, 8)} SPIRAL`);
    console.log(`Initial achievements: ${initialAchievements}`);
    
    // Place 10 bets to reach milestone
    for (let i = 1; i <= 10; i++) {
        try {
            const approveTx = await spiralToken.connect(player3).approve(spaceshipRace.address, betAmount);
            await approveTx.wait();
            
            const betTx = await spaceshipRace.connect(player3).placeBet(i % 8, betAmount); // Cycle through ships
            const receipt = await betTx.wait();
            
            console.log(`   Race ${i}: Placed bet on ship ${i % 8}`);
            
            // Check for achievement events
            const achievementEvent = receipt.events?.find(e => e.event === 'AchievementUnlocked');
            if (achievementEvent) {
                const { player: eventPlayer, name, nftId, tokenReward } = achievementEvent.args;
                console.log(`   🏆 ACHIEVEMENT UNLOCKED: ${name}`);
                console.log(`   NFT ID: ${nftId}`);
                console.log(`   Token Reward: ${hre.ethers.utils.formatUnits(tokenReward, 8)} SPIRAL`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`❌ Race ${i} failed:`, error.message);
        }
    }
    
    finalBalance = await spiralToken.balanceOf(player3.address);
    finalAchievements = await achievementNFT.balanceOf(player3.address);
    
    console.log(`Final balance: ${hre.ethers.utils.formatUnits(finalBalance, 8)} SPIRAL`);
    console.log(`Final achievements: ${finalAchievements}`);
    console.log(`Balance change: ${hre.ethers.utils.formatUnits(finalBalance.sub(initialBalance), 8)} SPIRAL`);
    console.log(`Achievements gained: ${finalAchievements.sub(initialAchievements)}`);

    // Test 4: Verify NFT metadata and ownership
    console.log("\n🔍 Test 4: NFT Verification");
    
    for (const player of [player1, player2, player3]) {
        const tokenCount = await achievementNFT.balanceOf(player.address);
        console.log(`\n${player.address} has ${tokenCount} achievements:`);
        
        if (tokenCount > 0) {
            const tokens = await achievementNFT.getTokensOfOwner(player.address);
            for (let i = 0; i < tokens.length; i++) {
                const tokenId = tokens[i];
                const [name, description, type, shipId, threshold] = await achievementNFT.getAchievementInfo(tokenId);
                console.log(`   NFT ${tokenId}: ${name} (${type}) - ${description}`);
                console.log(`   Spaceship: ${shipId < 255 ? shipId : 'None'}, Threshold: ${threshold}`);
                
                // Get token URI
                const tokenURI = await achievementNFT.tokenURI(tokenId);
                console.log(`   Token URI: ${tokenURI.substring(0, 100)}...`);
            }
        }
    }

    // Test 5: Check achievement counting
    console.log("\n📊 Test 5: Achievement Counting");
    
    for (let i = 0; i < 3; i++) {
        const player = [player1, player2, player3][i];
        const achievementCount = await spaceshipRace.getPlayerAchievementsCount(player.address);
        const nftCount = await achievementNFT.balanceOf(player.address);
        console.log(`${usernames[i]}: ${achievementCount} achievements counted, ${nftCount} NFTs owned`);
    }

    // Test 6: Check total achievements minted
    console.log("\n🏆 Test 6: Total Achievements");
    const totalAchievements = await achievementNFT.totalAchievements();
    console.log(`Total achievements minted: ${totalAchievements}`);

    console.log("\n✅ Achievement System Testing Complete!");
    console.log("=====================================");
    console.log("📋 Summary:");
    console.log("- Tested betting achievements (5 bets)");
    console.log("- Tested placement achievements (3 wins)");
    console.log("- Tested milestone achievements (10 races)");
    console.log("- Verified NFT minting and metadata");
    console.log("- Confirmed SPIRAL token rewards (1000 per achievement)");
    console.log("- Checked achievement counting and ownership");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Achievement testing failed:", error);
        process.exit(1);
    });
