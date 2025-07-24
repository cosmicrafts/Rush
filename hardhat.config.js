require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    somniaTestnet: {
      url: "https://dream-rpc.somnia.network/",
      chainId: 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      somniaTestnet: "not-needed", // Somnia doesn't have Etherscan yet
    },
    customChains: [
      {
        network: "somniaTestnet",
        chainId: 80085,
        urls: {
          apiURL: "https://testnet-rpc.somnia.network",
          browserURL: "https://testnet.somnia.network",
        },
      },
    ],
  },
}; 