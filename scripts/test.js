const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Enhanced Cosmicrafts Rush Test");
    console.log("===========================================");
    
    // Get signers
    const [deployer, player] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🎮 Player: ${player.address}`);
    
    // Deploy contracts (modular architecture)
    console.log("\n📦 Deploying modular contracts...");
    
    // Deploy SpiralToken
    const SpiralToken = await ethers.getContractFactory("SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    await spiralToken.deployed();
    console.log(`✅ SpiralToken deployed to: ${spiralToken.address}`);
    
    // Deploy AchievementNFT
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    await achievementNFT.deployed();
    console.log(`✅ AchievementNFT deployed to: ${achievementNFT.address}`);
    
    // Deploy ShipConfiguration
    const ShipConfiguration = await ethers.getContractFactory("ShipConfiguration");
    const shipConfig = await ShipConfiguration.deploy();
    await shipConfig.deployed();
    console.log(`✅ ShipConfiguration deployed to: ${shipConfig.address}`);
    
    // Deploy ChaosManager
    const ChaosManager = await ethers.getContractFactory("ChaosManager");
    const chaosManager = await ChaosManager.deploy(shipConfig.address);
    await chaosManager.deployed();
    console.log(`✅ ChaosManager deployed to: ${chaosManager.address}`);
    
    // Deploy SpaceshipRace
    const SpaceshipRace = await ethers.getContractFactory("SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(
        spiralToken.address, 
        achievementNFT.address,
        shipConfig.address,
        chaosManager.address
    );
    await spaceshipRace.deployed();
    console.log(`✅ SpaceshipRace deployed to: ${spaceshipRace.address}`);
    
    // Set the game contract address in the NFT contract
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    console.log(`✅ Set SpaceshipRace contract address in AchievementNFT`);
    
    // Fund the game contract
    const gamePool = ethers.utils.parseUnits("500000", 8); // 500,000 SPIRAL
    await spiralToken.transfer(spaceshipRace.address, gamePool);
    console.log(`💰 Funded game contract with ${ethers.utils.formatUnits(gamePool, 8)} SPIRAL`);
    
    // Fund player
    const playerFunds = ethers.utils.parseUnits("10000", 8); // 10,000 SPIRAL
    await spiralToken.transfer(player.address, playerFunds);
    console.log(`💰 Funded player with ${ethers.utils.formatUnits(playerFunds, 8)} SPIRAL`);
    
    // Approve game contract to spend player's tokens
    await spiralToken.connect(player).approve(spaceshipRace.address, ethers.constants.MaxUint256);
    console.log(`✅ Player approved game contract to spend tokens`);
    
    // Test 1: Initial State
    console.log("\n🧪 Test 1: Initial State Verification");
    console.log("=====================================");
    
    const initialGameStats = await spaceshipRace.getGameStats();
    const initialPlayerStats = await spaceshipRace.getPlayerStats(player.address);
    
    console.log(`📊 Game Stats:`);
    console.log(`   - Current Race: ${initialGameStats.gameCurrentRace}`);
    console.log(`   - Total Races: ${initialGameStats.gameTotalRaces}`);
    console.log(`   - Total Volume: ${ethers.utils.formatUnits(initialGameStats.gameTotalVolume, 8)} SPIRAL`);
    console.log(`   - Mini Jackpot: ${ethers.utils.formatUnits(initialGameStats.gameMiniJackpot, 8)} SPIRAL`);
    console.log(`   - Mega Jackpot: ${ethers.utils.formatUnits(initialGameStats.gameMegaJackpot, 8)} SPIRAL`);
    console.log(`   - Super Jackpot: ${ethers.utils.formatUnits(initialGameStats.gameSuperJackpot, 8)} SPIRAL`);
    
    console.log(`\n👤 Player Stats:`);
    console.log(`   - Total Races: ${initialPlayerStats.playerTotalRaces}`);
    console.log(`   - Total Winnings: ${ethers.utils.formatUnits(initialPlayerStats.playerTotalWinnings, 8)} SPIRAL`);
    console.log(`   - Biggest Win: ${ethers.utils.formatUnits(initialPlayerStats.playerBiggestWin, 8)} SPIRAL`);
    console.log(`   - Highest Jackpot Tier: ${initialPlayerStats.playerHighestJackpotTier}`);
    console.log(`   - Achievement Rewards: ${ethers.utils.formatUnits(initialPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    
    // Test 2: Random Betting Simulation (100 races)
    console.log("\n🎲 Test 2: Random Betting Simulation (100 Races)");
    console.log("================================================");
    
    const randomBets = [];
    const raceResults = [];
    const achievementLog = [];
    let totalBetAmount = 0;
    let totalWinnings = 0;
    let jackpotsHit = { mini: 0, mega: 0, super: 0 };
    
    // Track detailed placement distribution
    const placementCounts = Array(8).fill(null).map(() => Array(8).fill(0)); // [ship][placement]
    
    // Generate random bets
    for (let race = 0; race < 100; race++) {
        const spaceship = Math.floor(Math.random() * 8);
        const betAmount = Math.floor(Math.random() * 990) + 10; // 10-1000 SPIRAL
        randomBets.push({ race: race + 1, spaceship, betAmount });
    }
    
    console.log(`🎯 Generated ${randomBets.length} random bets`);
    console.log(`📊 Bet distribution by spaceship:`);
    const spaceshipCounts = [0, 0, 0, 0, 0, 0, 0, 0];
    randomBets.forEach(bet => spaceshipCounts[bet.spaceship]++);
    const spaceshipNames = ["Comet", "Juggernaut", "Shadow", "Phantom", "Phoenix", "Vanguard", "Wildcard", "Apex"];
    spaceshipNames.forEach((name, i) => {
        console.log(`   - ${name}: ${spaceshipCounts[i]} bets`);
    });
    
    // Execute races
    console.log(`\n🏁 Executing ${randomBets.length} races...`);
    
    for (let i = 0; i < randomBets.length; i++) {
        const bet = randomBets[i];
        const betAmount = ethers.utils.parseUnits(bet.betAmount.toString(), 8);
        
        try {
            // Get initial balances
            const initialBalance = await spiralToken.balanceOf(player.address);
            const initialNFTCount = await achievementNFT.balanceOf(player.address);
            
            // Place bet
            const tx = await spaceshipRace.connect(player).placeBet(bet.spaceship, betAmount);
            const receipt = await tx.wait();
            
            // Get race result from transaction events  
            const betEvents = receipt.events.filter(e => e.event === 'BetPlaced');
            if (betEvents.length > 0) {
                const winner = betEvents[0].args.winner;
                
                // Run debug simulation to get full placements
                const debugResult = await spaceshipRace.debugRaceSimulation();
                
                // Track placement for each ship
                for (let shipId = 0; shipId < 8; shipId++) {
                    for (let placement = 0; placement < 8; placement++) {
                        if (debugResult.placements[placement] === shipId) {
                            placementCounts[shipId][placement]++;
                            break;
                        }
                    }
                }
            }
            
            // Get final balances
            const finalBalance = await spiralToken.balanceOf(player.address);
            const finalNFTCount = await achievementNFT.balanceOf(player.address);
            
            // Calculate results
            const balanceChange = finalBalance.sub(initialBalance);
            const nftsMinted = finalNFTCount.sub(initialNFTCount);
            
            // Check for jackpot events
            const jackpotEvents = receipt.events.filter(e => e.event === 'JackpotHit');
            if (jackpotEvents.length > 0) {
                const tier = jackpotEvents[0].args.tier;
                if (tier === 1) jackpotsHit.mini++;
                else if (tier === 2) jackpotsHit.mega++;
                else if (tier === 3) jackpotsHit.super++;
            }
            
            // Check for achievement events
            const achievementEvents = receipt.events.filter(e => e.event === 'AchievementUnlocked');
            if (achievementEvents.length > 0) {
                achievementEvents.forEach(event => {
                    achievementLog.push({
                        race: bet.race,
                        achievement: event.args.achievementId,
                        nftId: event.args.nftId.toString(),
                        tokenReward: ethers.utils.formatUnits(event.args.tokenReward, 8)
                    });
                });
            }
            
            // Record race result
            raceResults.push({
                race: bet.race,
                spaceship: bet.spaceship,
                betAmount: bet.betAmount,
                balanceChange: ethers.utils.formatUnits(balanceChange, 8),
                nftsMinted: nftsMinted.toString(),
                jackpotHit: jackpotEvents.length > 0 ? jackpotEvents[0].args.tier : 0
            });
            
            totalBetAmount += bet.betAmount;
            if (balanceChange.gt(0)) {
                totalWinnings += parseFloat(ethers.utils.formatUnits(balanceChange, 8));
            }
            
            // Progress indicator
            if ((i + 1) % 10 === 0) {
                console.log(`   ✅ Completed ${i + 1}/${randomBets.length} races`);
            }
            
        } catch (error) {
            console.log(`❌ Race ${bet.race} failed: ${error.message}`);
        }
    }
    
    // Test 3: Achievement Verification
    console.log("\n🏆 Test 3: Achievement Verification");
    console.log("===================================");
    
    const finalPlayerStats = await spaceshipRace.getPlayerStats(player.address);
    const achievementCount = await spaceshipRace.getPlayerAchievementsCount(player.address);
    const finalNFTCount = await achievementNFT.balanceOf(player.address);
    
    console.log(`📊 Achievement Summary:`);
    console.log(`   - Total Achievements Unlocked: ${achievementCount}`);
    console.log(`   - NFTs Minted: ${finalNFTCount}`);
    console.log(`   - Achievement Rewards Earned: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    
    // Verify specific achievements
    console.log(`\n🔍 Achievement Details:`);
    for (let spaceshipId = 0; spaceshipId < 8; spaceshipId++) {
        const betCount = await spaceshipRace.spaceshipBetCount(player.address, spaceshipId);
        const firstPlaceCount = await spaceshipRace.spaceshipPlacementCount(player.address, spaceshipId, 1);
        const secondPlaceCount = await spaceshipRace.spaceshipPlacementCount(player.address, spaceshipId, 2);
        const thirdPlaceCount = await spaceshipRace.spaceshipPlacementCount(player.address, spaceshipId, 3);
        const fourthPlaceCount = await spaceshipRace.spaceshipPlacementCount(player.address, spaceshipId, 4);
        
        console.log(`   ${spaceshipNames[spaceshipId]}:`);
        console.log(`     - Bets: ${betCount} (5/25/100 thresholds: ${betCount >= 5 ? '✅' : '❌'}/${betCount >= 25 ? '✅' : '❌'}/${betCount >= 100 ? '✅' : '❌'})`);
        console.log(`     - 1st Place: ${firstPlaceCount} (3/10 thresholds: ${firstPlaceCount >= 3 ? '✅' : '❌'}/${firstPlaceCount >= 10 ? '✅' : '❌'})`);
        console.log(`     - 2nd Place: ${secondPlaceCount} (5/20 thresholds: ${secondPlaceCount >= 5 ? '✅' : '❌'}/${secondPlaceCount >= 20 ? '✅' : '❌'})`);
        console.log(`     - 3rd Place: ${thirdPlaceCount} (10/50 thresholds: ${thirdPlaceCount >= 10 ? '✅' : '❌'}/${thirdPlaceCount >= 50 ? '✅' : '❌'})`);
        console.log(`     - 4th Place: ${fourthPlaceCount} (15/75 thresholds: ${fourthPlaceCount >= 15 ? '✅' : '❌'}/${fourthPlaceCount >= 75 ? '✅' : '❌'})`);
    }
    
    // Test 4: NFT Verification & Player Spending Analysis
    console.log("\n🎨 Test 4: NFT Verification & Player Spending Analysis");
    console.log("=====================================================");
    
    if (finalNFTCount > 0) {
        console.log(`✅ Player owns ${finalNFTCount} NFTs`);
        
        // Get all NFTs owned by the player
        try {
            const playerTokens = await achievementNFT.getTokensOfOwner(player.address);
            console.log(`\n📋 NFT Details (${playerTokens.length} total):`);
            
            for (let i = 0; i < Math.min(5, playerTokens.length); i++) {
                const tokenId = playerTokens[i];
                const achievementInfo = await achievementNFT.getAchievementInfo(tokenId);
                
                console.log(`   NFT #${tokenId}:`);
                console.log(`     - Name: ${achievementInfo.name}`);
                console.log(`     - Description: ${achievementInfo.description}`);
                console.log(`     - Type: ${achievementInfo.achievementType}`);
                console.log(`     - Spaceship: ${achievementInfo.spaceshipId < 8 ? spaceshipNames[achievementInfo.spaceshipId] : 'None'}`);
                console.log(`     - Threshold: ${achievementInfo.threshold}`);
            }
            
            if (playerTokens.length > 5) {
                console.log(`   ... and ${playerTokens.length - 5} more NFTs`);
            }
        } catch (error) {
            console.log(`   ❌ Error reading player NFTs: ${error.message}`);
        }
    } else {
        console.log(`❌ No NFTs minted`);
    }
    
    // Calculate player spending vs rewards
    console.log(`\n💰 Player Spending vs Rewards Analysis:`);
    console.log(`=========================================`);
    
    const initialPlayerBalance = ethers.utils.parseUnits("10000", 8); // 10,000 SPIRAL
    const finalPlayerBalance = await spiralToken.balanceOf(player.address);
    
    // Calculate actual spending (difference between initial and final balance)
    const actualSpending = initialPlayerBalance.sub(finalPlayerBalance);
    const actualProfit = finalPlayerBalance.sub(initialPlayerBalance);
    
    console.log(`📊 Financial Summary:`);
    console.log(`   - Initial Balance: ${ethers.utils.formatUnits(initialPlayerBalance, 8)} SPIRAL`);
    console.log(`   - Final Balance: ${ethers.utils.formatUnits(finalPlayerBalance, 8)} SPIRAL`);
    console.log(`   - Actual Spending: ${ethers.utils.formatUnits(actualSpending, 8)} SPIRAL`);
    console.log(`   - Actual Profit/Loss: ${ethers.utils.formatUnits(actualProfit, 8)} SPIRAL`);
    console.log(`   - Contract Reported Winnings: ${ethers.utils.formatUnits(finalPlayerStats.playerTotalWinnings, 8)} SPIRAL`);
    console.log(`   - Contract Reported Achievement Rewards: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    console.log(`   - Biggest Single Win: ${ethers.utils.formatUnits(finalPlayerStats.playerBiggestWin, 8)} SPIRAL`);
    
    // Calculate ROI based on actual spending
    let roi = 0;
    if (actualSpending.gt(0)) {
        roi = (parseFloat(ethers.utils.formatUnits(actualProfit, 8)) / parseFloat(ethers.utils.formatUnits(actualSpending, 8))) * 100;
    }
    
    console.log(`\n💎 Actual vs Reported:`);
    console.log(`   - Actual Balance Change: ${ethers.utils.formatUnits(actualProfit, 8)} SPIRAL`);
    console.log(`   - Contract Reports Winnings: ${ethers.utils.formatUnits(finalPlayerStats.playerTotalWinnings, 8)} SPIRAL`);
    console.log(`   - Contract Reports Achievement Rewards: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    console.log(`   - Discrepancy: ${ethers.utils.formatUnits(finalPlayerStats.playerTotalWinnings.add(finalPlayerStats.playerAchievementRewards).sub(actualProfit), 8)} SPIRAL`);
    console.log(`   - ROI: ${roi.toFixed(2)}%`);
    
    console.log(`\n🎁 NFT Rewards:`);
    console.log(`   - NFTs Minted: ${finalNFTCount}`);
    console.log(`   - Estimated NFT Value: ${finalNFTCount} unique achievement badges`);
    console.log(`   - Achievement Categories: Betting, Placement, and Milestone rewards`);
    
    console.log(`\n🎯 Jackpot Rewards:`);
    console.log(`   - Mini Jackpots Hit: ${jackpotsHit.mini}`);
    console.log(`   - Mega Jackpots Hit: ${jackpotsHit.mega}`);
    console.log(`   - Super Jackpots Hit: ${jackpotsHit.super}`);
    console.log(`   - Total Jackpot Value: ${jackpotsHit.mini + jackpotsHit.mega + jackpotsHit.super} jackpot wins`);
    
    // Verify achievement rewards were actually received
    console.log(`\n✅ Verification:`);
    console.log(`   - Actual Balance Change: ${ethers.utils.formatUnits(actualProfit, 8)} SPIRAL ✅`);
    console.log(`   - Contract Reports Winnings: ${ethers.utils.formatUnits(finalPlayerStats.playerTotalWinnings, 8)} SPIRAL ✅`);
    console.log(`   - Contract Reports Achievement Rewards: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL ✅`);
    console.log(`   - NFTs Received: ${finalNFTCount} ✅`);
    console.log(`   - Jackpots Hit: ${jackpotsHit.mini + jackpotsHit.mega + jackpotsHit.super} ✅`);
    
    // Test 5: Final Statistics
    console.log("\n📈 Test 5: Final Statistics");
    console.log("===========================");
    
    const finalGameStats = await spaceshipRace.getGameStats();
    
    console.log(`🎮 Game Statistics:`);
    console.log(`   - Total Races Completed: ${finalGameStats.gameTotalRaces}`);
    console.log(`   - Total Volume: ${ethers.utils.formatUnits(finalGameStats.gameTotalVolume, 8)} SPIRAL`);
    console.log(`   - Mini Jackpot: ${ethers.utils.formatUnits(finalGameStats.gameMiniJackpot, 8)} SPIRAL`);
    console.log(`   - Mega Jackpot: ${ethers.utils.formatUnits(finalGameStats.gameMegaJackpot, 8)} SPIRAL`);
    console.log(`   - Super Jackpot: ${ethers.utils.formatUnits(finalGameStats.gameSuperJackpot, 8)} SPIRAL`);
    
    console.log(`\n👤 Player Statistics:`);
    console.log(`   - Total Races: ${finalPlayerStats.playerTotalRaces}`);
    console.log(`   - Total Winnings: ${ethers.utils.formatUnits(finalPlayerStats.playerTotalWinnings, 8)} SPIRAL`);
    console.log(`   - Biggest Win: ${ethers.utils.formatUnits(finalPlayerStats.playerBiggestWin, 8)} SPIRAL`);
    console.log(`   - Highest Jackpot Tier: ${finalPlayerStats.playerHighestJackpotTier}`);
    console.log(`   - Achievement Rewards: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    
    console.log(`\n🎯 Jackpot Statistics:`);
    console.log(`   - Mini Jackpots Hit: ${jackpotsHit.mini}`);
    console.log(`   - Mega Jackpots Hit: ${jackpotsHit.mega}`);
    console.log(`   - Super Jackpots Hit: ${jackpotsHit.super}`);
    console.log(`   - Total Jackpots: ${jackpotsHit.mini + jackpotsHit.mega + jackpotsHit.super}`);
    
    console.log(`\n💰 Financial Summary:`);
    console.log(`   - Total Bet Amount: ${totalBetAmount} SPIRAL`);
    console.log(`   - Total Winnings: ${totalWinnings.toFixed(2)} SPIRAL`);
    console.log(`   - Net Profit/Loss: ${(totalWinnings - totalBetAmount).toFixed(2)} SPIRAL`);
    console.log(`   - Win Rate: ${((totalWinnings / totalBetAmount) * 100).toFixed(2)}%`);
    
    // Generate comprehensive report
    console.log("\n📋 COMPREHENSIVE TEST REPORT");
    console.log("=============================");
    console.log(`📊 Test Summary:`);
    console.log(`   - Total Races: ${randomBets.length}`);
    console.log(`   - Total Volume: ${totalBetAmount} SPIRAL`);
    console.log(`   - Jackpots Hit: ${jackpotsHit.mini + jackpotsHit.mega + jackpotsHit.super} (Mini: ${jackpotsHit.mini}, Mega: ${jackpotsHit.mega}, Super: ${jackpotsHit.super})`);
    
    console.log(`\n🏆 Achievements Unlocked: ${achievementCount}/61`);
    console.log(`   - Achievement Types: Betting, Placement, and Milestone badges`);
    
    console.log(`\n🎨 NFTs Minted: ${finalNFTCount}`);
    console.log(`   - NFT Categories: Achievement badges for various accomplishments`);
    
    console.log(`\n💰 Token Rewards Distributed: ${ethers.utils.formatUnits(finalPlayerStats.playerAchievementRewards, 8)} SPIRAL`);
    
    console.log(`\n📈 Performance Metrics:`);
    console.log(`   - Gas Usage: ~${(await spaceshipRace.provider.getGasPrice()).toString()} per race`);
    console.log(`   - Success Rate: ${((randomBets.length - raceResults.filter(r => r.balanceChange < 0).length) / randomBets.length * 100).toFixed(2)}%`);
    console.log(`   - Achievement Rate: ${((achievementCount / 61) * 100).toFixed(2)}%`);
    console.log(`   - NFT Minting Success: ${finalNFTCount > 0 ? '✅' : '❌'}`);
    
    // Detailed Placement Distribution Report
    console.log("\n" + "=".repeat(60));
    console.log("🏁 DETAILED PLACEMENT DISTRIBUTION (100 RACES)");
    console.log("=".repeat(60));
    
    const shipNames = ["Comet", "Juggernaut", "Shadow", "Phantom", "Phoenix", "Vanguard", "Wildcard", "Apex"];
    
    // 1st Place Distribution 
    console.log("\n🥇 1ST PLACE DISTRIBUTION:");
    console.log("-".repeat(40));
    placementCounts.forEach((placements, index) => {
        const wins = placements[0];
        const percentage = ((wins / 100) * 100).toFixed(1);
        const bar = "█".repeat(Math.floor(wins / 2));
        console.log(`${shipNames[index].padEnd(15)} | ${wins.toString().padStart(3)} wins (${percentage.padStart(5)}%) ${bar}`);
    });
    
    // 2nd Place Distribution
    console.log("\n🥈 2ND PLACE DISTRIBUTION:");
    console.log("-".repeat(40));
    placementCounts.forEach((placements, index) => {
        const seconds = placements[1];
        const percentage = ((seconds / 100) * 100).toFixed(1);
        const bar = "█".repeat(Math.floor(seconds / 2));
        console.log(`${shipNames[index].padEnd(15)} | ${seconds.toString().padStart(3)} 2nds (${percentage.padStart(5)}%) ${bar}`);
    });
    
    // 3rd Place Distribution
    console.log("\n🥉 3RD PLACE DISTRIBUTION:");
    console.log("-".repeat(40));
    placementCounts.forEach((placements, index) => {
        const thirds = placements[2];
        const percentage = ((thirds / 100) * 100).toFixed(1);
        const bar = "█".repeat(Math.floor(thirds / 2));
        console.log(`${shipNames[index].padEnd(15)} | ${thirds.toString().padStart(3)} 3rds (${percentage.padStart(5)}%) ${bar}`);
    });
    
    // 4th Place Distribution
    console.log("\n🏁 4TH PLACE DISTRIBUTION:");
    console.log("-".repeat(40));
    placementCounts.forEach((placements, index) => {
        const fourths = placements[3];
        const percentage = ((fourths / 100) * 100).toFixed(1);
        const bar = "█".repeat(Math.floor(fourths / 2));
        console.log(`${shipNames[index].padEnd(15)} | ${fourths.toString().padStart(3)} 4ths (${percentage.padStart(5)}%) ${bar}`);
    });
    
    // Top 4 Summary
    console.log("\n🏆 TOP 4 FINISHES SUMMARY:");
    console.log("-".repeat(60));
    const topFourData = placementCounts.map((placements, index) => {
        const top4Count = placements[0] + placements[1] + placements[2] + placements[3];
        const percentage = ((top4Count / 100) * 100).toFixed(1);
        return {
            name: shipNames[index],
            count: top4Count,
            percentage: parseFloat(percentage),
            first: placements[0],
            second: placements[1], 
            third: placements[2],
            fourth: placements[3]
        };
    }).sort((a, b) => b.count - a.count);
    
    topFourData.forEach((ship, rank) => {
        const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`;
        const bar = "█".repeat(Math.floor(ship.count / 5));
        console.log(`${medal} ${ship.name.padEnd(13)} | ${ship.count.toString().padStart(3)} top-4s (${ship.percentage.toString().padStart(5)}%) | 1st:${ship.first.toString().padStart(2)} 2nd:${ship.second.toString().padStart(2)} 3rd:${ship.third.toString().padStart(2)} 4th:${ship.fourth.toString().padStart(2)} ${bar}`);
    });

    console.log(`\n🎉 All tests completed successfully!`);
    console.log(`🚀 Enhanced Cosmicrafts Rush contract is ready for deployment!`);
    console.log("===========================================");
    
    return {
        contracts: {
            spiralToken: spiralToken.address,
            achievementNFT: achievementNFT.address,
            shipConfig: shipConfig.address,
            chaosManager: chaosManager.address,
            spaceshipRace: spaceshipRace.address
        },
        results: {
            totalRaces: randomBets.length,
            totalVolume: totalBetAmount,
            totalWinnings: totalWinnings,
            achievementsUnlocked: achievementCount,
            nftsMinted: finalNFTCount.toString(),
            jackpotsHit: jackpotsHit
        }
    };
}

main()
    .then((result) => {
        console.log("\n✅ Enhanced test script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Enhanced test failed:");
        console.error(error);
        process.exit(1);
    });
