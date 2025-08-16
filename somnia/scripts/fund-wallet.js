const { ethers } = require('hardhat')

async function main() {
  // For Hardhat, we'll use environment variables instead of command line args
  const targetAddress = process.env.TARGET_ADDRESS
  const customAmount = process.env.AMOUNT

  if (!targetAddress) {
    console.log('❌ Please provide a wallet address to fund')
    console.log(
      'Usage: TARGET_ADDRESS=0x1234... npx hardhat run scripts/fund-wallet.js --network localhost'
    )
    console.log(
      'Optional: TARGET_ADDRESS=0x1234... AMOUNT=5 npx hardhat run scripts/fund-wallet.js --network localhost'
    )
    process.exit(1)
  }

  // Validate address format
  if (!ethers.utils.isAddress(targetAddress)) {
    console.log('❌ Invalid Ethereum address:', targetAddress)
    process.exit(1)
  }

  console.log('💰 Funding Wallet with Local ETH')
  console.log('================================')

  // Get deployer (has lots of ETH on localhost)
  const [deployer] = await ethers.getSigners()
  console.log('Funding from deployer:', deployer.address)
  console.log('Target wallet:', targetAddress)

  // Check deployer balance
  const deployerBalance = await deployer.getBalance()
  console.log('Deployer balance:', ethers.utils.formatEther(deployerBalance), 'ETH')

  // Check target balance before
  const balanceBefore = await ethers.provider.getBalance(targetAddress)
  console.log('Target balance before:', ethers.utils.formatEther(balanceBefore), 'ETH')

  // Amount to send (default: 10 ETH, or custom amount from environment)
  const amount = customAmount || '10'
  const amountWei = ethers.utils.parseEther(amount)

  console.log(`\n💸 Sending ${amount} ETH...`)

  try {
    // Send ETH transaction
    const tx = await deployer.sendTransaction({
      to: targetAddress,
      value: amountWei,
    })

    console.log('Transaction hash:', tx.hash)
    console.log('⏳ Waiting for confirmation...')

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

    // Check balance after
    const balanceAfter = await ethers.provider.getBalance(targetAddress)
    console.log('\n🎉 Funding complete!')
    console.log('Target balance after:', ethers.utils.formatEther(balanceAfter), 'ETH')
    console.log(
      'Amount received:',
      ethers.utils.formatEther(balanceAfter.sub(balanceBefore)),
      'ETH'
    )
  } catch (error) {
    console.log('❌ Transaction failed:', error.message)
    process.exit(1)
  }
}

// Handle command line execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { main }
