//npx hardhat test scripts/test/LiquidityPool/LiquidityPoolProxy.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('LiquidityPoolProxy Test', async function () {
    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();
        var storePath = await path.resolve(__dirname, './.cache/LiquidityPoolTest.json');
        var _owner = account1.address;

        // 获取合约的工厂实例，用于部署合约
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");

        // 通过代理部署合约 
        const LiquidityPoolProxy = await upgrades.deployProxy(LiquidityPool, ['0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', 'WETH', 'USDC', _owner], { // WETH/USDC
            initializer: 'initialize',
        });
        await LiquidityPoolProxy.waitForDeployment();
        const proxyAddress = await LiquidityPoolProxy.getAddress();
        console.log("代理合约地址：", proxyAddress);
        const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("实现合约地址：", upgradeAddress);
        console.log(await LiquidityPoolProxy.name(), await LiquidityPoolProxy.symbol());

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress,
            abi: LiquidityPool.interface.format("json"),
        }))

        return { account1, account2, LiquidityPoolProxy };
    }

    it('Test', async function () {
        var { account1, account2, LiquidityPoolProxy } = await loadFixture(init);

        console.log(LiquidityPoolProxy.address);
        console.log(await LiquidityPoolProxy.name());
        console.log(await LiquidityPoolProxy.symbol());
        console.log(await LiquidityPoolProxy.getContractBase());
    });
})