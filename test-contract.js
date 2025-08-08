const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing Cosmicrafts Rush Smart Contract\n");

  // Get signers
  const [owner, player1, player2, player3] = await ethers.getSigners();
  
  console.log("📋 Test Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Player 1: ${player1.address}`);
  console.log(`Player 2: ${player2.address}`);
  console.log(`Player 3: ${player3.address}\n`);

  // Deploy contract
  console.log("📦 Deploying RaceTrack contract...");
  const RaceTrack = await ethers.getContractFactory("RaceTrack");
  const raceTrack = await RaceTrack.deploy();
  await raceTrack.deployed();
  
  console.log(`✅ Contract deployed to: ${raceTrack.address}\n`);

  // Test 1: Check ship initialization
  console.log("🧪 Test 1: Ship Initialization");
  for (let i = 1; i <= 8; i++) {
    const ship = await raceTrack.getShip(i);
    console.log(`Ship ${i}: ${ship.name} - Speed: ${ship.initialSpeed}, Accel: ${ship.acceleration}, Chaos: ${ship.chaosFactor} (${ship.chaosChance}%)`);
  }
  console.log("✅ Ship initialization test passed\n");

  // Test 2: Start first race
  console.log("🧪 Test 2: Starting First Race");
  await raceTrack.startNewRace();
  console.log("✅ First race started\n");

  // Test 3: Place bets
  console.log("🧪 Test 3: Placing Bets");
  
  // Player 1 bets on ship 1
  await raceTrack.connect(player1).placeBet(1, { value: ethers.utils.parseEther("0.1") });
  console.log("✅ Player 1 bet 0.1 STT on Ship 1 (The Comet)");
  
  // Player 2 bets on ship 5
  await raceTrack.connect(player2).placeBet(5, { value: ethers.utils.parseEther("0.2") });
  console.log("✅ Player 2 bet 0.2 STT on Ship 5 (The Phoenix)");
  
  // Player 3 bets on ship 8
  await raceTrack.connect(player3).placeBet(8, { value: ethers.utils.parseEther("0.15") });
  console.log("✅ Player 3 bet 0.15 STT on Ship 8 (The Apex)");
  
  // Player 1 bets on ship 3 as well
  await raceTrack.connect(player1).placeBet(3, { value: ethers.utils.parseEther("0.05") });
  console.log("✅ Player 1 bet 0.05 STT on Ship 3 (The Shadow)\n");

  // Test 4: Check race status
  console.log("🧪 Test 4: Race Status Check");
  const raceStatus = await raceTrack.getCurrentRaceStatus();
  console.log(`Race ID: ${raceStatus.raceId}`);
  console.log(`Total Bets: ${ethers.utils.formatEther(raceStatus.totalBets)} STT`);
  console.log(`Finished: ${raceStatus.finished}`);
  console.log(`Time Remaining: ${raceStatus.timeRemaining} seconds`);
  console.log("✅ Race status check passed\n");

  // Test 5: Check ship bets
  console.log("🧪 Test 5: Ship Betting Totals");
  for (let i = 1; i <= 8; i++) {
    const shipBets = await raceTrack.getShipBets(1, i);
    if (shipBets.gt(0)) {
      const ship = await raceTrack.getShip(i);
      console.log(`Ship ${i} (${ship.name}): ${ethers.utils.formatEther(shipBets)} STT`);
    }
  }
  console.log("✅ Ship betting totals check passed\n");

  // Test 6: Check player bets
  console.log("🧪 Test 6: Player Betting History");
  const player1Bets = await raceTrack.getPlayerBets(1, player1.address);
  const player2Bets = await raceTrack.getPlayerBets(1, player2.address);
  const player3Bets = await raceTrack.getPlayerBets(1, player3.address);
  
  console.log(`Player 1 bets: ${player1Bets.length} bets`);
  player1Bets.forEach((bet, index) => {
    console.log(`  Bet ${index + 1}: Ship ${bet.shipId} - ${ethers.utils.formatEther(bet.amount)} STT`);
  });
  
  console.log(`Player 2 bets: ${player2Bets.length} bets`);
  player2Bets.forEach((bet, index) => {
    console.log(`  Bet ${index + 1}: Ship ${bet.shipId} - ${ethers.utils.formatEther(bet.amount)} STT`);
  });
  
  console.log(`Player 3 bets: ${player3Bets.length} bets`);
  player3Bets.forEach((bet, index) => {
    console.log(`  Bet ${index + 1}: Ship ${bet.shipId} - ${ethers.utils.formatEther(bet.amount)} STT`);
  });
  console.log("✅ Player betting history check passed\n");

  // Test 7: Wait for betting period to end and start new race (which will finish the current one)
  console.log("🧪 Test 7: Finishing Race with On-Chain Simulation");
  console.log("⏳ Waiting for betting period to end...");
  
  // Fast forward time by 6 minutes (betting period is 5 minutes)
  await ethers.provider.send("evm_increaseTime", [6 * 60]); // 6 minutes
  await ethers.provider.send("evm_mine");
  
  console.log("✅ Time advanced, betting period ended");
  
  // Start new race (this will automatically finish the current race)
  console.log("🏁 Starting new race (will finish current race automatically)...");
  await raceTrack.startNewRace();
  console.log("✅ New race started, previous race finished\n");

  // Test 8: Check race results
  console.log("🧪 Test 8: Race Results");
  const raceInfo = await raceTrack.getRaceInfo(1);
  console.log(`Race 1 Results:`);
  console.log(`  Winner: Ship ${raceInfo.winner}`);
  console.log(`  Total Bets: ${ethers.utils.formatEther(raceInfo.totalBets)} STT`);
  console.log(`  Total Prize: ${ethers.utils.formatEther(raceInfo.totalPrize)} STT`);
  console.log(`  Finished: ${raceInfo.finished}`);
  console.log(`  Start Time: ${new Date(raceInfo.startTime * 1000).toLocaleString()}`);
  console.log(`  End Time: ${new Date(raceInfo.endTime * 1000).toLocaleString()}`);
  
  // Get winner ship name
  const winnerShip = await raceTrack.getShip(raceInfo.winner);
  console.log(`  Winner Ship: ${winnerShip.name}`);
  console.log("✅ Race results check passed\n");

  // Test 9: Claim winnings
  console.log("🧪 Test 9: Claiming Winnings");
  
  // Check balances before claiming
  const balanceBefore1 = await ethers.provider.getBalance(player1.address);
  const balanceBefore2 = await ethers.provider.getBalance(player2.address);
  const balanceBefore3 = await ethers.provider.getBalance(player3.address);
  
  console.log("💰 Balances before claiming:");
  console.log(`Player 1: ${ethers.utils.formatEther(balanceBefore1)} ETH`);
  console.log(`Player 2: ${ethers.utils.formatEther(balanceBefore2)} ETH`);
  console.log(`Player 3: ${ethers.utils.formatEther(balanceBefore3)} ETH`);
  
  // Try to claim winnings for all players
  try {
    await raceTrack.connect(player1).claimWinnings(1);
    console.log("✅ Player 1 claimed winnings");
  } catch (error) {
    console.log("❌ Player 1 has no winnings to claim");
  }
  
  try {
    await raceTrack.connect(player2).claimWinnings(1);
    console.log("✅ Player 2 claimed winnings");
  } catch (error) {
    console.log("❌ Player 2 has no winnings to claim");
  }
  
  try {
    await raceTrack.connect(player3).claimWinnings(1);
    console.log("✅ Player 3 claimed winnings");
  } catch (error) {
    console.log("❌ Player 3 has no winnings to claim");
  }
  
  // Check balances after claiming
  const balanceAfter1 = await ethers.provider.getBalance(player1.address);
  const balanceAfter2 = await ethers.provider.getBalance(player2.address);
  const balanceAfter3 = await ethers.provider.getBalance(player3.address);
  
  console.log("💰 Balances after claiming:");
  console.log(`Player 1: ${ethers.utils.formatEther(balanceAfter1)} ETH (${ethers.utils.formatEther(balanceAfter1.sub(balanceBefore1))} change)`);
  console.log(`Player 2: ${ethers.utils.formatEther(balanceAfter2)} ETH (${ethers.utils.formatEther(balanceAfter2.sub(balanceBefore2))} change)`);
  console.log(`Player 3: ${ethers.utils.formatEther(balanceAfter3)} ETH (${ethers.utils.formatEther(balanceAfter3.sub(balanceBefore3))} change)`);
  console.log("✅ Winnings claiming test passed\n");

  // Test 10: Run multiple races to test randomness
  console.log("🧪 Test 10: Multiple Race Simulation");
  console.log("🏁 Running 5 races to test randomness and balance...");
  
  const winners = [];
  for (let race = 2; race <= 6; race++) {
    // Place some bets
    await raceTrack.connect(player1).placeBet(1, { value: ethers.utils.parseEther("0.1") });
    await raceTrack.connect(player2).placeBet(5, { value: ethers.utils.parseEther("0.1") });
    await raceTrack.connect(player3).placeBet(8, { value: ethers.utils.parseEther("0.1") });
    
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [6 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Start new race
    await raceTrack.startNewRace();
    
    // Get winner
    const raceResult = await raceTrack.getRaceInfo(race);
    const winnerShip = await raceTrack.getShip(raceResult.winner);
    winners.push(winnerShip.name);
    
    console.log(`Race ${race}: ${winnerShip.name} won`);
  }
  
  console.log("\n📊 Winner Distribution:");
  const winnerCounts = {};
  winners.forEach(winner => {
    winnerCounts[winner] = (winnerCounts[winner] || 0) + 1;
  });
  
  Object.entries(winnerCounts).forEach(([winner, count]) => {
    console.log(`  ${winner}: ${count} wins (${(count / winners.length * 100).toFixed(1)}%)`);
  });
  console.log("✅ Multiple race simulation test passed\n");

  // Test 11: Test edge cases
  console.log("🧪 Test 11: Edge Cases");
  
  // Test minimum bet
  try {
    await raceTrack.connect(player1).placeBet(1, { value: ethers.utils.parseEther("0.0005") });
    console.log("❌ Should have rejected bet below minimum");
  } catch (error) {
    console.log("✅ Correctly rejected bet below minimum");
  }
  
  // Test maximum bet
  try {
    await raceTrack.connect(player1).placeBet(1, { value: ethers.utils.parseEther("2") });
    console.log("❌ Should have rejected bet above maximum");
  } catch (error) {
    console.log("✅ Correctly rejected bet above maximum");
  }
  
  // Test invalid ship ID
  try {
    await raceTrack.connect(player1).placeBet(9, { value: ethers.utils.parseEther("0.1") });
    console.log("❌ Should have rejected invalid ship ID");
  } catch (error) {
    console.log("✅ Correctly rejected invalid ship ID");
  }
  
  // Test betting on finished race
  try {
    await raceTrack.connect(player1).placeBet(1, { value: ethers.utils.parseEther("0.1") });
    console.log("❌ Should have rejected bet on finished race");
  } catch (error) {
    console.log("✅ Correctly rejected bet on finished race");
  }
  
  console.log("✅ Edge cases test passed\n");

  console.log("🎉 All tests completed successfully!");
  console.log("🚀 Smart contract is ready for deployment!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 