require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.23',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1, // Aggressive optimization for size
      },
      viaIR: true,
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gas: 24000000, // 24 million gas limit for local testing
      gasPrice: 1000000000, // 1 gwei
    },

    // Sepolia Testnet (for initial testing)
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/70b7e4d32357459a9af10d6503eae303',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 20000000000, // 20 gwei default
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : 24000000, // 24 million gas limit
      timeout: 60000,
    },

    // Somnia Testnet (for final deployment)
    somniaTestnet: {
      url: 'https://dream-rpc.somnia.network/',
      chainId: 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 20000000000, // 20 gwei default (reduced)
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : 30000000, // 30 million gas limit (reduced)
      timeout: 120000, // 2 minutes timeout
    },

    // Push Chain Testnet (Donut) - universal cross-chain deployment
    pushChainTestnet: {
      url: process.env.PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/',
      chainId: 42101, // Push Chain Donut Testnet (from official docs)
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 1000000000, // 1 gwei
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : 30000000,
      timeout: 120000,
    },

    // Push Chain Testnet (Alternative RPC)
    pushChainTestnetAlt: {
      url: 'https://evm.rpc-testnet-donut-node2.push.org/',
      chainId: 42101,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      gas: 30000000,
      timeout: 120000,
    },

    // Push Chain Local Development
    pushChainLocal: {
      url: 'http://localhost:8545', // Local Push Chain node
      chainId: 42101, // Same chain ID as testnet for consistency
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      gas: 30000000,
      timeout: 60000,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      somniaTestnet: 'not-needed', // Somnia doesn't have Etherscan yet
      pushChainTestnet: 'blockscout', // Push Chain uses Blockscout
    },
    customChains: [
      {
        network: 'somniaTestnet',
        chainId: 50312,
        urls: {
          apiURL: 'https://shannon-explorer.somnia.network/api',
          browserURL: 'https://shannon-explorer.somnia.network',
        },
      },
      {
        network: 'pushChainTestnet',
        chainId: 42101,
        urls: {
          apiURL: 'https://donut.push.network/api/v2/verifyContract',
          browserURL: 'https://donut.push.network/',
        },
      },
    ],
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 5,
  },

  mocha: {
    timeout: 60000,
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}
