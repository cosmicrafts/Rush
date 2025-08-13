const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🚀 Deploying Modular Spaceship Race Contracts...')
  console.log('================================================')

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

  // 2. Deploy ChaosManager contract (needs ShipConfiguration address)
  console.log('\n⚡ 2. Deploying ChaosManager...')
  const ChaosManager = await hre.ethers.getContractFactory('ChaosManager')
  const chaosManager = await ChaosManager.deploy(shipConfigAddress)
  await chaosManager.deployed()
  const chaosManagerAddress = chaosManager.address
  console.log('✅ ChaosManager deployed to:', chaosManagerAddress)

  // 3. Deploy mock SPIRAL token for testing
  console.log('\n🪙 3. Deploying Mock SPIRAL Token...')
  const MockToken = await hre.ethers.getContractFactory('SpiralToken')
  const spiralToken = await MockToken.deploy()
  await spiralToken.deployed()
  const spiralTokenAddress = spiralToken.address
  console.log('✅ SPIRAL Token deployed to:', spiralTokenAddress)

  // 4. Deploy mock Achievement NFT
  console.log('\n🏆 4. Deploying Mock Achievement NFT...')
  const MockNFT = await hre.ethers.getContractFactory('AchievementNFT')
  const achievementNFT = await MockNFT.deploy()
  await achievementNFT.deployed()
  const achievementNFTAddress = achievementNFT.address
  console.log('✅ Achievement NFT deployed to:', achievementNFTAddress)

  // Verify the NFT contract actually has code
  console.log('🔍 Verifying NFT contract deployment...')
  const nftCode = await hre.ethers.provider.getCode(achievementNFTAddress)
  console.log('NFT contract code length:', nftCode.length)
  console.log('NFT contract has code:', nftCode !== '0x')

  if (nftCode === '0x') {
    throw new Error('NFT contract deployment failed - no code at address')
  }

  // Test basic NFT functions
  try {
    const name = await achievementNFT.name()
    const symbol = await achievementNFT.symbol()
    const owner = await achievementNFT.owner()
    console.log('✅ NFT contract verification successful:')
    console.log('  Name:', name)
    console.log('  Symbol:', symbol)
    console.log('  Owner:', owner)
  } catch (error) {
    throw new Error(`NFT contract verification failed: ${error.message}`)
  }

  // 5. Deploy main SpaceshipRace contract
  console.log('\n🚀 5. Deploying Main SpaceshipRace Contract...')
  const SpaceshipRace = await hre.ethers.getContractFactory('SpaceshipRace')

  // Estimate gas for deployment
  console.log('🔍 Estimating gas for SpaceshipRace deployment...')
  const deploymentData = SpaceshipRace.getDeployTransaction(
    spiralTokenAddress,
    achievementNFTAddress,
    shipConfigAddress,
    chaosManagerAddress
  )

  const estimatedDeploymentGas = await hre.ethers.provider.estimateGas(deploymentData)
  console.log('Estimated deployment gas:', estimatedDeploymentGas.toString())

  // Add 50% buffer for deployment
  const deploymentGasWithBuffer = estimatedDeploymentGas.mul(150).div(100)
  console.log('Deployment gas with 50% buffer:', deploymentGasWithBuffer.toString())

  const spaceshipRace = await SpaceshipRace.deploy(
    spiralTokenAddress,
    achievementNFTAddress,
    shipConfigAddress,
    chaosManagerAddress,
    { gasLimit: deploymentGasWithBuffer }
  )
  await spaceshipRace.deployed()
  const spaceshipRaceAddress = spaceshipRace.address
  console.log('✅ SpaceshipRace deployed to:', spaceshipRaceAddress)

  // Verify the SpaceshipRace contract actually has code
  console.log('🔍 Verifying SpaceshipRace contract deployment...')
  const raceCode = await hre.ethers.provider.getCode(spaceshipRaceAddress)
  console.log('SpaceshipRace contract code length:', raceCode.length)
  console.log('SpaceshipRace contract has code:', raceCode !== '0x')

  if (raceCode === '0x') {
    throw new Error('SpaceshipRace contract deployment failed - no code at address')
  }

  // 6. Configure AchievementNFT permissions
  console.log('\n🔗 6. Configuring AchievementNFT Permissions...')
  const setContractTx = await achievementNFT.setSpaceshipRaceContract(spaceshipRaceAddress)
  await setContractTx.wait()
  console.log('✅ AchievementNFT configured to allow SpaceshipRace contract to mint')

  // Test NFT minting immediately after deployment...
  console.log('\n🧪 Testing NFT minting immediately after deployment...')
  try {
    // First estimate the gas required
    console.log('🔍 Estimating gas for NFT minting...')
    const estimatedGas = await achievementNFT.estimateGas.mintAchievement(
      deployer.address,
      'Test Achievement',
      'Test Description',
      'Test',
      0,
      10
    )

    console.log('Estimated gas:', estimatedGas.toString())

    // Add 100% buffer to the estimated gas for safety (doubled)
    const gasWithBuffer = estimatedGas.mul(200).div(100)
    console.log('Gas with 100% buffer:', gasWithBuffer.toString())

    // Check if gas exceeds network limits
    const maxGas = 30000000 // 30 million (reduced from 64M)
    const finalGas = gasWithBuffer.gt(maxGas) ? maxGas : gasWithBuffer
    console.log('Final gas limit:', finalGas.toString())

    const mintTx = await achievementNFT.mintAchievement(
      deployer.address,
      'Test Achievement',
      'Test Description',
      'Test',
      0,
      10,
      { gasLimit: finalGas }
    )
    const receipt = await mintTx.wait()
    console.log('✅ NFT minting test successful!')
    console.log('Gas used:', receipt.gasUsed.toString())

    const totalAchievements = await achievementNFT.totalAchievements()
    console.log('Total achievements after test mint:', totalAchievements.toString())
  } catch (mintError) {
    console.log('❌ NFT minting test failed:', mintError.message)
    if (mintError.reason) {
      console.log('Revert reason:', mintError.reason)
    }
    if (mintError.data) {
      console.log('Error data:', mintError.data)
    }
    if (mintError.message.includes('gas')) {
      console.log('⚠️  Gas-related error - consider optimizing contract or increasing gas limit')
    }
    console.log('⚠️  This might be expected if the contract has access restrictions')
  }

  // 7. Update .env file with contract addresses
  console.log('\n📝 7. Updating .env file with contract addresses...')
  const envPath = path.join(__dirname, '..', '.env')
  const envContent = `# Contract Addresses (auto-updated by deploy script)
SPACESHIP_RACE_ADDRESS=${spaceshipRaceAddress.toLowerCase()}
SPIRAL_TOKEN_ADDRESS=${spiralTokenAddress.toLowerCase()}
ACHIEVEMENT_NFT_ADDRESS=${achievementNFTAddress.toLowerCase()}
SHIP_CONFIGURATION_ADDRESS=${shipConfigAddress.toLowerCase()}
CHAOS_MANAGER_ADDRESS=${chaosManagerAddress.toLowerCase()}

# Network Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=0xc478
SOMNIA_CHAIN_NAME=Somnia Testnet
`

  try {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env file updated successfully')
  } catch (error) {
    console.log('⚠️  Warning: Could not write to .env file:', error.message)
    console.log('   You may need to manually create the .env file with these addresses:')
    console.log(`   SPACESHIP_RACE_ADDRESS=${spaceshipRaceAddress}`)
    console.log(`   SPIRAL_TOKEN_ADDRESS=${spiralTokenAddress}`)
    console.log(`   ACHIEVEMENT_NFT_ADDRESS=${achievementNFTAddress}`)
    console.log(`   SHIP_CONFIGURATION_ADDRESS=${shipConfigAddress}`)
    console.log(`   CHAOS_MANAGER_ADDRESS=${chaosManagerAddress}`)
  }

  // Verify all contracts are working
  console.log('\n🔍 8. Verifying Contract Integration...')

  // Test ship config
  const ship0Stats = await shipConfig.getShipStats(0)
  console.log('Ship 0 (The Comet) stats:', {
    initialSpeed: ship0Stats.initialSpeed.toString(),
    acceleration: ship0Stats.acceleration.toString(),
    chaosFactor: ship0Stats.chaosFactor.toString(),
    chaosChance: ship0Stats.chaosChance.toString(),
  })

  // Test chaos manager
  const chaosName = await chaosManager.getChaosFactorName(0)
  console.log('Chaos Factor 0 name:', chaosName)

  // Test main contract
  const spaceshipInfo = await spaceshipRace.getSpaceshipInfo(0)
  console.log('Spaceship 0 info from main contract:', {
    initialSpeed: spaceshipInfo[0].toString(),
    acceleration: spaceshipInfo[1].toString(),
    chaosFactor: spaceshipInfo[2].toString(),
    chaosChance: spaceshipInfo[3].toString(),
  })

  // Test debug race simulation (only works after a bet has been placed)
  console.log('\n🏁 9. Testing Race Simulation...')
  try {
    const raceResult = await spaceshipRace.debugRaceSimulation()
    console.log('Race winner:', raceResult.winner.toString())
    console.log(
      'Race placements:',
      raceResult.placements.map(p => p.toString())
    )
  } catch (error) {
    console.log('ℹ️  No race result available yet (this is expected before any bets are placed)')
    console.log('   Race simulation will be available after the first bet is placed')
  }

  // 10. Fund the faucet with SPIRAL tokens
  console.log('\n💰 10. Funding Faucet...')
  try {
    // Check SPIRAL token decimals
    const decimals = await spiralToken.decimals()
    console.log('SPIRAL Token decimals:', decimals)

    // Fund faucet with 100,000,000 SPIRAL tokens (enough for massive payouts and jackpots)
    const faucetFunding = hre.ethers.utils.parseUnits('100000000', decimals)
    console.log(
      'Transferring',
      hre.ethers.utils.formatUnits(faucetFunding, decimals),
      'SPIRAL to game contract...'
    )

    const fundTx = await spiralToken.transfer(spaceshipRaceAddress, faucetFunding)
    await fundTx.wait()

    // Verify the transfer
    const gameBalance = await spiralToken.balanceOf(spaceshipRaceAddress)
    console.log(
      '✅ Game contract now has:',
      hre.ethers.utils.formatUnits(gameBalance, decimals),
      'SPIRAL tokens'
    )

    // Test faucet claim
    console.log('🧪 Testing faucet claim...')
    const claimTx = await spaceshipRace.claimFaucet()
    await claimTx.wait()

    const deployerBalance = await spiralToken.balanceOf(deployer.address)
    console.log(
      '✅ Deployer claimed from faucet! New balance:',
      hre.ethers.utils.formatUnits(deployerBalance, decimals),
      'SPIRAL'
    )
  } catch (error) {
    console.log('❌ Error funding faucet:', error.message)
  }

  console.log('\n✅ All contracts deployed and verified successfully!')
  console.log('================================================')
  console.log('📋 Contract Addresses:')
  console.log('- ShipConfiguration:', shipConfigAddress)
  console.log('- ChaosManager:', chaosManagerAddress)
  console.log('- SPIRAL Token:', spiralTokenAddress)
  console.log('- Achievement NFT:', achievementNFTAddress)
  console.log('- SpaceshipRace:', spaceshipRaceAddress)

  // Save deployment info
  const deployment = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      ShipConfiguration: shipConfigAddress,
      ChaosManager: chaosManagerAddress,
      SpiralToken: spiralTokenAddress,
      AchievementNFT: achievementNFTAddress,
      SpaceshipRace: spaceshipRaceAddress,
    },
  }

  console.log('\n💾 Deployment complete! Ready for testing.')
  console.log('🌐 Frontend will automatically use the new contract addresses from .env file.')
  return deployment
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
