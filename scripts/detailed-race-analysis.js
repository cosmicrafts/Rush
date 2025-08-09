const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("📊 Detailed 100-Race Analysis & Report Generation");
    console.log("================================================");

    // Deploy contracts
    console.log("🚀 Deploying contracts...");
    
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

    console.log("✅ All contracts deployed!");

    // Get ship data for reporting
    const shipData = [];
    for (let i = 0; i < 8; i++) {
        const name = await shipConfig.getShipName(i);
        const stats = await shipConfig.getShipStats(i);
        const chaosName = await chaosManager.getChaosFactorName(stats.chaosFactor);
        shipData.push({
            index: i,
            name,
            stats: {
                initialSpeed: stats.initialSpeed.toString(),
                acceleration: stats.acceleration.toString(),
                chaosFactor: stats.chaosFactor.toString(),
                chaosChance: stats.chaosChance.toString()
            },
            chaosName
        });
    }

    console.log("\n📋 Ship Configuration:");
    shipData.forEach(ship => {
        console.log(`${ship.index}: ${ship.name} - Speed: ${ship.stats.initialSpeed}, Accel: ${ship.stats.acceleration}, ${ship.chaosName}: ${ship.stats.chaosChance}%`);
    });

    // Run detailed analysis
    console.log("\n🎲 Running 1000 detailed races...");
    
    const raceCount = 1000;
    const detailedResults = [];
    const placementStats = Array(8).fill(0).map(() => Array(8).fill(0)); // [ship][placement]
    const chaosEventDetails = [];
    const winCounts = Array(8).fill(0);

    for (let race = 1; race <= raceCount; race++) {
        try {
            // Use different signers for entropy variation
            const signers = await hre.ethers.getSigners();
            const mockUserIndex = race % signers.length;
            const testUser = signers[mockUserIndex];
            const userSpaceshipRace = spaceshipRace.connect(testUser);

            const raceResult = await userSpaceshipRace.debugRaceSimulation();
            const winner = raceResult.winner;
            const placements = raceResult.placements;
            
            winCounts[winner]++;

            // Record placements (0 = 1st place, 1 = 2nd place, etc.)
            for (let place = 0; place < 8; place++) {
                const shipAtThisPlace = placements[place];
                placementStats[shipAtThisPlace][place]++;
            }

            // Analyze chaos events in this race
            const raceEvents = [];
            for (let i = 0; i < raceResult.totalEvents; i++) {
                const event = raceResult.turnEvents[i];
                if (event.chaosEventType.toString() !== "0") {
                    const eventData = {
                        shipIndex: event.shipId.toString(),
                        shipName: shipData[event.shipId].name,
                        turn: event.turn.toString(),
                        eventType: event.chaosEventType.toString(),
                        moveAmount: event.moveAmount.toString(),
                        distance: event.distance.toString()
                    };
                    raceEvents.push(eventData);
                    chaosEventDetails.push({
                        race,
                        ...eventData
                    });
                }
            }

            // Store detailed race result
            detailedResults.push({
                race,
                winner,
                winnerName: shipData[winner].name,
                placements: placements.map(p => ({
                    shipIndex: p,
                    shipName: shipData[p].name
                })),
                chaosEvents: raceEvents,
                userAddress: testUser.address.slice(-6)
            });

            if (race % 100 === 0) {
                console.log(`   Completed ${race}/${raceCount} races (${(race/10).toFixed(1)}%)`);
            }

        } catch (error) {
            console.log(`❌ Race ${race} failed: ${error.message}`);
            break;
        }
    }

    // Generate comprehensive analysis
    const analysis = {
        timestamp: new Date().toISOString(),
        totalRaces: raceCount,
        contractAddresses: {
            shipConfig: shipConfig.address,
            chaosManager: chaosManager.address,
            spaceshipRace: spaceshipRace.address
        },
        shipConfiguration: shipData,
        results: {
            winDistribution: shipData.map((ship, index) => ({
                shipIndex: index,
                shipName: ship.name,
                wins: winCounts[index],
                winPercentage: ((winCounts[index] / raceCount) * 100).toFixed(2)
            })),
            placementAnalysis: shipData.map((ship, shipIndex) => ({
                shipIndex,
                shipName: ship.name,
                placements: {
                    first: placementStats[shipIndex][0],
                    second: placementStats[shipIndex][1],
                    third: placementStats[shipIndex][2],
                    fourth: placementStats[shipIndex][3],
                    fifth: placementStats[shipIndex][4],
                    sixth: placementStats[shipIndex][5],
                    seventh: placementStats[shipIndex][6],
                    eighth: placementStats[shipIndex][7]
                },
                averageFinish: calculateAverageFinish(placementStats[shipIndex]),
                topThreeFinishes: placementStats[shipIndex][0] + placementStats[shipIndex][1] + placementStats[shipIndex][2]
            })),
            chaosEventSummary: analyzeChaosEvents(chaosEventDetails, shipData),
            balanceMetrics: calculateBalanceMetrics(winCounts, placementStats)
        },
        detailedRaceData: detailedResults,
        chaosEventDetails: chaosEventDetails
    };

    // Write detailed report to file
    const reportPath = 'race-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

    // Generate human-readable summary
    const summaryPath = 'race-analysis-summary.txt';
    const summary = generateTextSummary(analysis);
    fs.writeFileSync(summaryPath, summary);

    console.log("\n📊 Analysis Results:");
    console.log("===================");

    // Display key findings
    console.log("\n🏆 Win Distribution:");
    analysis.results.winDistribution.forEach(ship => {
        const bar = "█".repeat(Math.floor(ship.winPercentage / 2));
        console.log(`${ship.shipName.padEnd(15)} | ${ship.wins.toString().padStart(2)} wins (${ship.winPercentage.padStart(5)}%) ${bar}`);
    });

    console.log("\n📈 Average Finish Positions:");
    analysis.results.placementAnalysis
        .sort((a, b) => a.averageFinish - b.averageFinish)
        .forEach(ship => {
            console.log(`${ship.shipName.padEnd(15)} | Avg: ${ship.averageFinish.toFixed(2)} | Top 3: ${ship.topThreeFinishes}`);
        });

    console.log("\n⚡ Chaos Event Trigger Rates:");
    Object.entries(analysis.results.chaosEventSummary.triggerRates).forEach(([shipName, data]) => {
        const actual = ((data.triggered / data.opportunities) * 100).toFixed(1);
        const expected = data.expectedRate;
        const status = Math.abs(actual - expected) < 5 ? "✅" : "⚠️";
        console.log(`${shipName.padEnd(15)} | ${actual.padStart(5)}% (expected ${expected}%) ${status}`);
    });

    console.log(`\n📝 Detailed reports saved:`);
    console.log(`📄 JSON Report: ${reportPath}`);
    console.log(`📋 Text Summary: ${summaryPath}`);

    console.log(`\n🔍 Key Insights:`);
    console.log(`- Phoenix dominance: ${analysis.results.winDistribution[4].winPercentage}% wins`);
    console.log(`- Balance score: ${analysis.results.balanceMetrics.balanceScore}`);
    console.log(`- Most consistent: ${analysis.results.placementAnalysis.find(s => s.averageFinish === Math.min(...analysis.results.placementAnalysis.map(p => p.averageFinish))).shipName}`);
    console.log(`- Most chaos events: ${Object.entries(analysis.results.chaosEventSummary.totalEvents).reduce((a, b) => a[1] > b[1] ? a : b)[0]}`);

    return analysis;
}

function calculateAverageFinish(placements) {
    let total = 0;
    let races = 0;
    for (let place = 0; place < 8; place++) {
        total += (place + 1) * placements[place];
        races += placements[place];
    }
    return races > 0 ? total / races : 8;
}

function analyzeChaosEvents(events, shipData) {
    const eventsByShip = {};
    const triggerRates = {};
    
    shipData.forEach(ship => {
        eventsByShip[ship.name] = 0;
        // Estimate opportunities (turns per race * 1000 races, assuming ~7 turns average per ship)
        const opportunities = 1000 * 7;
        const expectedRate = parseInt(ship.stats.chaosChance);
        
        triggerRates[ship.name] = {
            triggered: 0,
            opportunities,
            expectedRate
        };
    });

    events.forEach(event => {
        const shipName = event.shipName;
        eventsByShip[shipName]++;
        triggerRates[shipName].triggered++;
    });

    return {
        totalEvents: eventsByShip,
        triggerRates
    };
}

function calculateBalanceMetrics(winCounts, placementStats) {
    const avgWins = 1000 / 8; // 125 for perfect balance
    const winVariance = winCounts.reduce((sum, wins) => sum + Math.pow(wins - avgWins, 2), 0) / 8;
    const winStdDev = Math.sqrt(winVariance);
    
    // Calculate average finishing position variance
    const avgFinishes = placementStats.map(calculateAverageFinish);
    const avgFinishPosition = 4.5; // Perfect balance average
    const finishVariance = avgFinishes.reduce((sum, avg) => sum + Math.pow(avg - avgFinishPosition, 2), 0) / 8;
    
    let balanceScore;
    if (winStdDev < 30) balanceScore = "🟢 Well Balanced";
    else if (winStdDev < 50) balanceScore = "🟡 Moderately Balanced";
    else balanceScore = "🔴 Needs Rebalancing";

    return {
        winStandardDeviation: winStdDev.toFixed(2),
        finishPositionVariance: finishVariance.toFixed(2),
        balanceScore,
        mostDominant: winCounts.indexOf(Math.max(...winCounts)),
        leastSuccessful: winCounts.indexOf(Math.min(...winCounts))
    };
}

function generateTextSummary(analysis) {
    return `
SPACESHIP RACE CONTRACT ANALYSIS REPORT
=======================================
Generated: ${analysis.timestamp}
Total Races Analyzed: ${analysis.totalRaces}

SHIP CONFIGURATION:
${analysis.shipConfiguration.map(ship => 
    `${ship.index}: ${ship.name}
    - Initial Speed: ${ship.stats.initialSpeed}
    - Acceleration: ${ship.stats.acceleration}  
    - Chaos Factor: ${ship.chaosName} (${ship.stats.chaosChance}% chance)`
).join('\n')}

WIN DISTRIBUTION:
${analysis.results.winDistribution.map(ship => 
    `${ship.shipName}: ${ship.wins} wins (${ship.winPercentage}%)`
).join('\n')}

PLACEMENT ANALYSIS:
${analysis.results.placementAnalysis.map(ship =>
    `${ship.shipName}:
    - 1st: ${ship.placements.first}, 2nd: ${ship.placements.second}, 3rd: ${ship.placements.third}
    - Average Finish: ${ship.averageFinish.toFixed(2)}
    - Top 3 Finishes: ${ship.topThreeFinishes}`
).join('\n')}

CHAOS EVENT ANALYSIS:
${Object.entries(analysis.results.chaosEventSummary.triggerRates).map(([name, data]) =>
    `${name}: ${data.triggered} triggers / ${data.opportunities} opportunities (${((data.triggered/data.opportunities)*100).toFixed(1)}% actual vs ${data.expectedRate}% expected)`
).join('\n')}

BALANCE METRICS:
- Win Standard Deviation: ${analysis.results.balanceMetrics.winStandardDeviation}
- Balance Score: ${analysis.results.balanceMetrics.balanceScore}
- Most Dominant: Ship ${analysis.results.balanceMetrics.mostDominant}
- Least Successful: Ship ${analysis.results.balanceMetrics.leastSuccessful}

RECOMMENDATIONS:
${analysis.results.balanceMetrics.balanceScore.includes('🔴') 
    ? '- Rebalance ship stats or chaos factor chances\n- Consider reducing dominant ship advantages\n- Boost underperforming ships' 
    : '- System appears well balanced\n- Monitor for consistent performance'}

DATA FILES:
- Detailed JSON: race-analysis-report.json
- Race-by-race data available in detailedRaceData array
- Individual chaos events in chaosEventDetails array
`;
}

main()
    .then((analysis) => {
        console.log("\n✅ Detailed analysis complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Analysis failed:", error);
        process.exit(1);
    });
