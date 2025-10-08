const hre = require('hardhat')

async function main() {
  console.log('🎲 Running 500 Individual Races with Block Separation')
  console.log('===================================================')

  // Deploy contracts
  console.log('🚀 Deploying contracts...')

  const ShipConfiguration = await hre.ethers.getContractFactory('ShipConfiguration')
  const shipConfig = await ShipConfiguration.deploy()
  await shipConfig.deployed()

  const ChaosManager = await hre.ethers.getContractFactory('ChaosManager')
  const chaosManager = await ChaosManager.deploy(shipConfig.address)
  await chaosManager.deployed()

  const MockToken = await hre.ethers.getContractFactory('SpiralToken')
  const spiralToken = await MockToken.deploy()
  await spiralToken.deployed()

  const MockNFT = await hre.ethers.getContractFactory('AchievementNFT')
  const achievementNFT = await MockNFT.deploy()
  await achievementNFT.deployed()

  // Deploy the refactored contracts
  const PlayerStatsManager = await hre.ethers.getContractFactory('PlayerStatsManager')
  const statsManager = await PlayerStatsManager.deploy()
  await statsManager.deployed()

  const PlayerProfileManager = await hre.ethers.getContractFactory('PlayerProfileManager')
  const profileManager = await PlayerProfileManager.deploy()
  await profileManager.deployed()

  const AchievementManager = await hre.ethers.getContractFactory('AchievementManager')
  const achievementManager = await AchievementManager.deploy(
    spiralToken.address,
    achievementNFT.address,
    statsManager.address
  )
  await achievementManager.deployed()

  const SpaceshipRaceCore = await hre.ethers.getContractFactory('SpaceshipRaceCore')
  const spaceshipRace = await SpaceshipRaceCore.deploy(
    spiralToken.address,
    shipConfig.address,
    chaosManager.address,
    statsManager.address,
    profileManager.address,
    achievementManager.address
  )
  await spaceshipRace.deployed()

  // Configure permissions
  await statsManager.authorizeCaller(spaceshipRace.address)
  await profileManager.authorizeCaller(spaceshipRace.address)
  await achievementManager.authorizeCaller(spaceshipRace.address)
  await statsManager.authorizeCaller(achievementManager.address)
  await achievementNFT.setSpaceshipRaceContract(achievementManager.address)

  // Fund the main contract with lots of tokens for payouts
  const fundAmount = hre.ethers.utils.parseUnits('1000000', 8) // 1M SPIRAL for payouts
  await spiralToken.transfer(spaceshipRace.address, fundAmount)
  
  console.log('✅ All contracts deployed and funded!')

  // Get ship names for reporting
  const shipNames = [
    'The Comet',
    'The Juggernaut',
    'The Shadow',
    'The Phantom',
    'The Phoenix',
    'The Vanguard',
    'The Wildcard',
    'The Apex',
  ]

  // Track results
  const winCounts = Array(8).fill(0)
  const placementCounts = Array(8)
    .fill(0)
    .map(() => Array(8).fill(0)) // [ship][placement]
  const raceResults = []
  const chaosEventSummary = {}

  console.log('\n🏁 Running 500 individual races...')

  for (let race = 1; race <= 500; race++) {
    try {
      // Use different signers to vary entropy
      const signers = await hre.ethers.getSigners()
      const signerIndex = race % signers.length
      const testUser = signers[signerIndex]
      const userSpaceshipRace = spaceshipRace.connect(testUser)

      // Mine a block to ensure different block properties for each race
      if (race > 1) {
        await hre.network.provider.send('evm_mine')
        // Small delay to ensure timestamp differences
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      if (race % 50 === 0 || race <= 5) {
        console.log(
          `   Race ${race}/500 - Using signer ${signerIndex} (${testUser.address.slice(-6)})`
        )
      }

      // Get some tokens for betting
      const betAmount = hre.ethers.utils.parseUnits('100', 8) // 100 SPIRAL
      await spiralToken.transfer(testUser.address, betAmount)
      await spiralToken.connect(testUser).approve(spaceshipRace.address, betAmount)
      
      // Pick a random spaceship to bet on (0-7)
      const randomSpaceship = race % 8
      
      // Run the race by placing a bet
      const tx = await userSpaceshipRace.placeBet(randomSpaceship, betAmount)
      const receipt = await tx.wait()
      
      // Get the race result from the debugRaceSimulation function
      const raceResult = await userSpaceshipRace.debugRaceSimulation()
      const winner = raceResult.winner
      const placements = raceResult.placements

      // Record winner
      winCounts[winner]++

      // Record all placements (0 = 1st place, 1 = 2nd place, etc.)
      for (let place = 0; place < 8; place++) {
        const shipAtThisPlace = placements[place]
        placementCounts[shipAtThisPlace][place]++
      }

      // Analyze chaos events in this race
      const raceEvents = []
      for (let i = 0; i < raceResult.totalEvents; i++) {
        const event = raceResult.turnEvents[i]
        if (event.chaosEventType.toString() !== '0') {
          const shipName = shipNames[event.shipId]
          const eventType = event.chaosEventType.toString()

          raceEvents.push({
            shipName,
            eventType,
            turn: event.turn.toString(),
          })

          // Track chaos event frequency
          if (!chaosEventSummary[shipName]) {
            chaosEventSummary[shipName] = {}
          }
          if (!chaosEventSummary[shipName][eventType]) {
            chaosEventSummary[shipName][eventType] = 0
          }
          chaosEventSummary[shipName][eventType]++
        }
      }

      // Store race details
      raceResults.push({
        race,
        winner,
        winnerName: shipNames[winner],
        placements: placements.map(p => shipNames[p]),
        chaosEvents: raceEvents,
        signerUsed: signerIndex,
        signerAddress: testUser.address.slice(-6),
      })

      // Show winner for first few races and every 50th race
      if (race % 50 === 0 || race <= 5) {
        console.log(`      Winner: ${shipNames[winner]} | Chaos Events: ${raceEvents.length}`)
      }
    } catch (error) {
      console.log(`❌ Race ${race} failed: ${error.message}`)
      break
    }
  }

  console.log('\n📊 Analysis Results:')
  console.log('===================')

  // Most successful ships
  const sortedResults = shipNames
    .map((name, index) => ({
      name,
      wins: winCounts[index],
      percentage: ((winCounts[index] / 500) * 100).toFixed(1),
    }))
    .sort((a, b) => b.wins - a.wins)

  console.log('\n🥇 Top Performers:')
  sortedResults.slice(0, 3).forEach((ship, index) => {
    const medal = ['🥇', '🥈', '🥉'][index]
    console.log(`${medal} ${ship.name}: ${ship.wins} wins (${ship.percentage}%)`)
  })

  // Chaos event summary
  console.log('\n⚡ Chaos Events Summary:')
  Object.entries(chaosEventSummary).forEach(([shipName, events]) => {
    const totalEvents = Object.values(events).reduce((sum, count) => sum + count, 0)
    console.log(`${shipName.padEnd(15)} | ${totalEvents} total chaos events`)
    Object.entries(events).forEach(([eventType, count]) => {
      console.log(`                  | Type ${eventType}: ${count} times`)
    })
  })

  // Consistency analysis
  console.log('\n📈 Consistency Analysis:')
  const variance =
    winCounts.reduce((sum, wins) => {
      const avgWins = 500 / 8 // 62.5 for perfect balance
      return sum + Math.pow(wins - avgWins, 2)
    }, 0) / 8
  const standardDeviation = Math.sqrt(variance).toFixed(2)

  console.log(`Standard Deviation: ${standardDeviation}`)
  if (standardDeviation < 12) {
    console.log('🟢 Results are well balanced')
  } else if (standardDeviation < 20) {
    console.log('🟡 Results are moderately balanced')
  } else {
    console.log('🔴 Results show significant imbalance')
  }

  // Individual race breakdown
  console.log('\n📋 Individual Race Results:')
  raceResults.forEach(result => {
    const chaosInfo =
      result.chaosEvents.length > 0
        ? `(${result.chaosEvents.length} chaos events)`
        : '(no chaos events)'
    console.log(
      `Race ${result.race.toString().padStart(2)}: ${result.winnerName.padEnd(15)} ${chaosInfo}`
    )
  })

  // Entropy analysis
  console.log('\n🎲 Entropy Analysis:')
  const signerUsage = {}
  raceResults.forEach(result => {
    signerUsage[result.signerUsed] = (signerUsage[result.signerUsed] || 0) + 1
  })
  console.log('Signer distribution:', signerUsage)

  const uniqueWinners = [...new Set(raceResults.map(r => r.winner))].length
  console.log(
    `Unique winners: ${uniqueWinners}/8 ships (${((uniqueWinners / 8) * 100).toFixed(1)}% diversity)`
  )

  return {
    winCounts,
    placementCounts,
    raceResults,
    chaosEventSummary,
    standardDeviation: parseFloat(standardDeviation),
  }
}

main()
  .then(results => {
    console.log('\n✅ Individual race analysis complete!')
    console.log(
      `🎯 Key finding: Standard deviation of ${results.standardDeviation} indicates ${results.standardDeviation < 12 ? 'good balance' : results.standardDeviation < 20 ? 'moderate balance' : 'poor balance'}`
    )

    // Final Win Distribution Summary
    console.log('\n' + '='.repeat(60))
    console.log('🏆 FINAL WIN DISTRIBUTION (500 RACES)')
    console.log('='.repeat(60))

    const shipNames = [
      'The Comet',
      'The Juggernaut',
      'The Shadow',
      'The Phantom',
      'The Phoenix',
      'The Vanguard',
      'The Wildcard',
      'The Apex',
    ]

    results.winCounts.forEach((wins, index) => {
      const percentage = ((wins / 500) * 100).toFixed(1)
      const bar = '█'.repeat(Math.floor(wins / 10)) // Scale for 500 races
      console.log(
        `${shipNames[index].padEnd(15)} | ${wins.toString().padStart(3)} wins (${percentage.padStart(5)}%) ${bar}`
      )
    })

    // 2nd Place Distribution
    console.log('\n' + '='.repeat(60))
    console.log('🥈 2ND PLACE DISTRIBUTION (500 RACES)')
    console.log('='.repeat(60))

    results.placementCounts.forEach((placements, index) => {
      const secondPlaces = placements[1] // Index 1 = 2nd place
      const percentage = ((secondPlaces / 500) * 100).toFixed(1)
      const bar = '█'.repeat(Math.floor(secondPlaces / 10))
      console.log(
        `${shipNames[index].padEnd(15)} | ${secondPlaces.toString().padStart(3)} 2nds (${percentage.padStart(5)}%) ${bar}`
      )
    })

    // 3rd Place Distribution
    console.log('\n' + '='.repeat(60))
    console.log('🥉 3RD PLACE DISTRIBUTION (500 RACES)')
    console.log('='.repeat(60))

    results.placementCounts.forEach((placements, index) => {
      const thirdPlaces = placements[2] // Index 2 = 3rd place
      const percentage = ((thirdPlaces / 500) * 100).toFixed(1)
      const bar = '█'.repeat(Math.floor(thirdPlaces / 10))
      console.log(
        `${shipNames[index].padEnd(15)} | ${thirdPlaces.toString().padStart(3)} 3rds (${percentage.padStart(5)}%) ${bar}`
      )
    })

    // 4th Place Distribution
    console.log('\n' + '='.repeat(60))
    console.log('🏁 4TH PLACE DISTRIBUTION (500 RACES)')
    console.log('='.repeat(60))

    results.placementCounts.forEach((placements, index) => {
      const fourthPlaces = placements[3] // Index 3 = 4th place
      const percentage = ((fourthPlaces / 500) * 100).toFixed(1)
      const bar = '█'.repeat(Math.floor(fourthPlaces / 10))
      console.log(
        `${shipNames[index].padEnd(15)} | ${fourthPlaces.toString().padStart(3)} 4ths (${percentage.padStart(5)}%) ${bar}`
      )
    })

    // Top 4 Summary (1st + 2nd + 3rd + 4th)
    console.log('\n' + '='.repeat(60))
    console.log('🏆 TOP 4 FINISHES SUMMARY (500 RACES)')
    console.log('='.repeat(60))

    const topFourData = results.placementCounts
      .map((placements, index) => {
        const top4Count = placements[0] + placements[1] + placements[2] + placements[3]
        const percentage = ((top4Count / 500) * 100).toFixed(1)
        return {
          name: shipNames[index],
          count: top4Count,
          percentage: parseFloat(percentage),
          first: placements[0],
          second: placements[1],
          third: placements[2],
          fourth: placements[3],
        }
      })
      .sort((a, b) => b.count - a.count)

    topFourData.forEach((ship, rank) => {
      const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`
      const bar = '█'.repeat(Math.floor(ship.count / 20))
      console.log(
        `${medal} ${ship.name.padEnd(13)} | ${ship.count.toString().padStart(3)} top-4s (${ship.percentage.toString().padStart(5)}%) | 1st:${ship.first.toString().padStart(2)} 2nd:${ship.second.toString().padStart(2)} 3rd:${ship.third.toString().padStart(2)} 4th:${ship.fourth.toString().padStart(2)} ${bar}`
      )
    })
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })
