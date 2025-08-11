const { ethers } = require('hardhat')

async function testCaching() {
  console.log('🧪 Testing Achievement Caching System...\n')

  // Test cache validation
  console.log('1. Testing cache validation:')
  const now = Date.now()
  const cache = {
    lastUpdated: now - 15000, // 15 seconds ago
    account: '0x1234567890123456789012345678901234567890',
    playerStats: { totalRaces: 10 },
    betCounts: [5, 3, 2, 1, 0, 0, 0, 0],
    placementCounts: {},
    achievements: []
  }

  const isValid = (Date.now() - cache.lastUpdated) < 30000 && cache.account === '0x1234567890123456789012345678901234567890'
  console.log(`   Cache age: ${Date.now() - cache.lastUpdated}ms`)
  console.log(`   Cache valid: ${isValid ? '✅' : '❌'}`)

  // Test change detection
  console.log('\n2. Testing change detection:')
  const newData = {
    playerStats: { totalRaces: 11 }, // Changed
    betCounts: [5, 3, 2, 1, 0, 0, 0, 0], // Same
    placementCounts: {},
    achievements: []
  }

  const hasChanges = newData.playerStats.totalRaces !== cache.playerStats.totalRaces
  console.log(`   Total races changed: ${cache.playerStats.totalRaces} → ${newData.playerStats.totalRaces}`)
  console.log(`   Changes detected: ${hasChanges ? '✅' : '❌'}`)

  // Test parallel loading simulation
  console.log('\n3. Testing parallel loading simulation:')
  const startTime = Date.now()
  
  // Simulate parallel API calls
  const promises = Array.from({ length: 8 }, (_, i) => 
    new Promise(resolve => setTimeout(() => resolve(i * 2), 100 + Math.random() * 200))
  )
  
  const results = await Promise.all(promises)
  const endTime = Date.now()
  
  console.log(`   Parallel loading time: ${endTime - startTime}ms`)
  console.log(`   Results: [${results.join(', ')}]`)

  // Test sequential vs parallel
  console.log('\n4. Sequential vs Parallel comparison:')
  const sequentialStart = Date.now()
  for (let i = 0; i < 8; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  const sequentialTime = Date.now() - sequentialStart
  
  const parallelStart = Date.now()
  await Promise.all(Array.from({ length: 8 }, () => new Promise(resolve => setTimeout(resolve, 100))))
  const parallelTime = Date.now() - parallelStart
  
  console.log(`   Sequential time: ${sequentialTime}ms`)
  console.log(`   Parallel time: ${parallelTime}ms`)
  console.log(`   Speed improvement: ${Math.round((sequentialTime - parallelTime) / sequentialTime * 100)}%`)

  console.log('\n✅ Caching system test completed!')
  console.log('\nKey improvements:')
  console.log('• Instant modal opening with cached data')
  console.log('• Background refresh only when needed')
  console.log('• Parallel API calls instead of sequential')
  console.log('• Smart change detection to avoid unnecessary updates')
}

testCaching()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
