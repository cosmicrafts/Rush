const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🚀 Deploying Refactored Spaceship Race Contracts...')
  console.log('====================================================')

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deploying with account:', deployer.address)
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString())

  // 1. Deploy ShipConfiguration contract first
  console.log('\n📋 1. Deploying ShipConfiguration...')
  const ShipConfiguration = await hre.ethers.getContractFactory('ShipConfiguration')
  const shipConfig = await ShipConfiguration.deploy()
  await shipConfig.deployed()
  const shipConfigAddress = shipConfig.address
  console.log('✅ ShipConfiguration deployed to:', shipConfigAddress)

  // 2. Deploy ChaosManager contract
  console.log('\n⚡ 2. Deploying ChaosManager...')
  const ChaosManager = await hre.ethers.getContractFactory('ChaosManager')
  const chaosManager = await ChaosManager.deploy(shipConfigAddress)
  await chaosManager.deployed()
  const chaosManagerAddress = chaosManager.address
  console.log('✅ ChaosManager deployed to:', chaosManagerAddress)

  // 3. Deploy SPIRAL token
  console.log('\n🪙 3. Deploying SPIRAL Token...')
  const SpiralToken = await hre.ethers.getContractFactory('SpiralToken')
  const spiralToken = await SpiralToken.deploy()
  await spiralToken.deployed()
  const spiralTokenAddress = spiralToken.address
  console.log('✅ SPIRAL Token deployed to:', spiralTokenAddress)

  // 4. Deploy Achievement NFT
  console.log('\n🏆 4. Deploying Achievement NFT...')
  const AchievementNFT = await hre.ethers.getContractFactory('AchievementNFT')
  const achievementNFT = await AchievementNFT.deploy()
  await achievementNFT.deployed()
  const achievementNFTAddress = achievementNFT.address
  console.log('✅ Achievement NFT deployed to:', achievementNFTAddress)

  // 5. Deploy PlayerStatsManager
  console.log('\n📊 5. Deploying PlayerStatsManager...')
  const PlayerStatsManager = await hre.ethers.getContractFactory('PlayerStatsManager')
  const statsManager = await PlayerStatsManager.deploy()
  await statsManager.deployed()
  const statsManagerAddress = statsManager.address
  console.log('✅ PlayerStatsManager deployed to:', statsManagerAddress)

  // 6. Deploy PlayerProfileManager
  console.log('\n👤 6. Deploying PlayerProfileManager...')
  const PlayerProfileManager = await hre.ethers.getContractFactory('PlayerProfileManager')
  const profileManager = await PlayerProfileManager.deploy()
  await profileManager.deployed()
  const profileManagerAddress = profileManager.address
  console.log('✅ PlayerProfileManager deployed to:', profileManagerAddress)

  // 7. Deploy AchievementManager
  console.log('\n🎖️ 7. Deploying AchievementManager...')
  const AchievementManager = await hre.ethers.getContractFactory('AchievementManager')
  const achievementManager = await AchievementManager.deploy(
    spiralTokenAddress,
    achievementNFTAddress,
    statsManagerAddress
  )
  await achievementManager.deployed()
  const achievementManagerAddress = achievementManager.address
  console.log('✅ AchievementManager deployed to:', achievementManagerAddress)

  // 8. Deploy SpaceshipRaceCore (Main Contract)
  console.log('\n🚀 8. Deploying SpaceshipRaceCore (Main Contract)...')
  const SpaceshipRaceCore = await hre.ethers.getContractFactory('SpaceshipRaceCore')
  const spaceshipRaceCore = await SpaceshipRaceCore.deploy(
    spiralTokenAddress,
    shipConfigAddress,
    chaosManagerAddress,
    statsManagerAddress,
    profileManagerAddress,
    achievementManagerAddress
  )
  await spaceshipRaceCore.deployed()
  const spaceshipRaceCoreAddress = spaceshipRaceCore.address
  console.log('✅ SpaceshipRaceCore deployed to:', spaceshipRaceCoreAddress)

  // 9. Configure permissions between contracts
  console.log('\n🔗 9. Configuring Contract Permissions...')
  
  // Authorize SpaceshipRaceCore to update stats
  console.log('   - Authorizing SpaceshipRaceCore in PlayerStatsManager...')
  await statsManager.authorizeCaller(spaceshipRaceCoreAddress)
  
  // Authorize SpaceshipRaceCore to update profiles
  console.log('   - Authorizing SpaceshipRaceCore in PlayerProfileManager...')
  await profileManager.authorizeCaller(spaceshipRaceCoreAddress)
  
  // Authorize SpaceshipRaceCore to trigger achievements
  console.log('   - Authorizing SpaceshipRaceCore in AchievementManager...')
  await achievementManager.authorizeCaller(spaceshipRaceCoreAddress)
  
  // Authorize AchievementManager to update stats (for achievement rewards)
  console.log('   - Authorizing AchievementManager in PlayerStatsManager...')
  await statsManager.authorizeCaller(achievementManagerAddress)
  
  // Configure AchievementNFT permissions
  console.log('   - Configuring AchievementNFT permissions...')
  await achievementNFT.setSpaceshipRaceContract(achievementManagerAddress)
  
  console.log('✅ All permissions configured!')

  // 10. Fund contracts with initial tokens
  console.log('\n💰 10. Funding Contracts...')
  
  // Transfer tokens to AchievementManager for rewards and faucet
  const fundAmount = hre.ethers.utils.parseUnits('100000', 8) // 100,000 SPIRAL
  console.log('   - Transferring tokens to AchievementManager for rewards...')
  await spiralToken.transfer(achievementManagerAddress, fundAmount)
  
  // Transfer tokens to SpaceshipRaceCore for jackpots
  const jackpotFund = hre.ethers.utils.parseUnits('50000', 8) // 50,000 SPIRAL
  console.log('   - Transferring tokens to SpaceshipRaceCore for jackpots...')
  await spiralToken.transfer(spaceshipRaceCoreAddress, jackpotFund)
  
  console.log('✅ Contracts funded!')

  // 11. Verify contract sizes
  console.log('\n📏 11. Verifying Contract Sizes...')
  const contracts = [
    { name: 'SpaceshipRaceCore', address: spaceshipRaceCoreAddress },
    { name: 'PlayerStatsManager', address: statsManagerAddress },
    { name: 'PlayerProfileManager', address: profileManagerAddress },
    { name: 'AchievementManager', address: achievementManagerAddress }
  ]
  
  for (const contract of contracts) {
    const code = await hre.ethers.provider.getCode(contract.address)
    const sizeInBytes = (code.length - 2) / 2 // Remove '0x' and convert hex to bytes
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)
    const isUnderLimit = sizeInBytes <= 24576
    const status = isUnderLimit ? '✅' : '❌'
    console.log(`   ${status} ${contract.name}: ${sizeInKB} KB (${sizeInBytes} bytes)`)
  }

  // 12. Save deployment addresses
  console.log('\n💾 12. Saving Deployment Addresses...')
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      SpaceshipRaceCore: spaceshipRaceCoreAddress,
      PlayerStatsManager: statsManagerAddress,
      PlayerProfileManager: profileManagerAddress,
      AchievementManager: achievementManagerAddress,
      ShipConfiguration: shipConfigAddress,
      ChaosManager: chaosManagerAddress,
      SpiralToken: spiralTokenAddress,
      AchievementNFT: achievementNFTAddress
    }
  }

  const deploymentPath = path.join(__dirname, '..', 'deployments', `${hre.network.name}-refactored.json`)
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true })
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
  console.log('✅ Deployment info saved to:', deploymentPath)

  // 13. Display summary
  console.log('\n🎉 DEPLOYMENT COMPLETE!')
  console.log('========================')
  console.log('Main Contract (SpaceshipRaceCore):', spaceshipRaceCoreAddress)
  console.log('PlayerStatsManager:', statsManagerAddress)
  console.log('PlayerProfileManager:', profileManagerAddress)
  console.log('AchievementManager:', achievementManagerAddress)
  console.log('SPIRAL Token:', spiralTokenAddress)
  console.log('Achievement NFT:', achievementNFTAddress)
  console.log('')
  console.log('🔗 Next Steps:')
  console.log('1. Update frontend to use SpaceshipRaceCore address')
  console.log('2. Test all functionality with the new modular system')
  console.log('3. Verify contracts on block explorer if needed')
  console.log('')
  console.log('📝 Frontend Integration:')
  console.log(`VITE_SPACESHIP_RACE_ADDRESS=${spaceshipRaceCoreAddress}`)
  console.log(`VITE_SPIRAL_TOKEN_ADDRESS=${spiralTokenAddress}`)
  console.log(`VITE_ACHIEVEMENT_NFT_ADDRESS=${achievementNFTAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
