import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();  // 获取env数据插件
require("@nomicfoundation/hardhat-verify");  // hardhat verify 插件

const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  //预计这个合约使用的次数，根据合约复杂度调整
      },
      // viaIR: true,
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_RPC_API_KEY}`, // Infura API Key
      accounts: [process.env.PRIVATE_KEY], // 钱包私钥
      // 全局设置 Gas Price 和 Gas Limit
      // gasPrice: 5000000000, // 10 Gwei 这里定多少就会按这个数量交易
      // gas: 5000000, // Gas Limit
      timeout: 1000 * 60 * 10, // 3 minutes
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,  //验证合约
  },
  sourcify: {
    enabled: true
  }
  // namedAccounts: {
  //   deployer: 0,
  //   user: 1,
  // },
};

export default config;