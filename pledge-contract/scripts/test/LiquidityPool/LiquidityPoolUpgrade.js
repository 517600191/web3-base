//npx hardhat test scripts/test/LiquidityPool/LiquidityPoolUpgrade.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('LiquidityPoolUpgrade Test', async function () {
    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();
        var storePath = await path.resolve(__dirname, './.cache/LiquidityPoolTest.json');
        var _owner = account1.address;

        const MockToken = await hre.ethers.getContractFactory("MockToken");
        const mockWETH = await MockToken.deploy("Mock WETH", "WETH");
        const mockUSDC = await MockToken.deploy("Mock USDC", "USDC");

        // 获取合约的工厂实例，用于部署合约
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");

        // 通过代理部署合约 
        const LiquidityPoolProxy = await upgrades.deployProxy(LiquidityPool, [await mockWETH.getAddress(), await mockUSDC.getAddress(), 'WETH', 'USDC', _owner], { // WETH/USDC
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

        // const storeData = await fs.readFileSync(storePath);
        // const { proxyAddress } = JSON.parse(storeData);
        // console.log(JSON.parse(storeData));

        //拿到升级合约
        const LiquidityPoolUpgrade = await ethers.getContractFactory("LiquidityPoolV2");

        //升级代理合约
        const LiquidityPoolUpgradeProxy = await upgrades.upgradeProxy(proxyAddress, LiquidityPoolUpgrade);
        await LiquidityPoolUpgradeProxy.waitForDeployment();
        const upgradeAddress2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("代理合约地址：", proxyAddress);
        console.log("实现合约地址：", upgradeAddress2);

        // 调用新的初始化函数
        // await LiquidityPoolUpgradeProxy.reinitialize();

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress: upgradeAddress2,
            abi: LiquidityPoolUpgrade.interface.format("json"),
        }))

        return { account1, account2, LiquidityPoolUpgradeProxy, mockWETH, mockUSDC };
    }

    it('Test', async function () {
        var { account1, account2, LiquidityPoolUpgradeProxy, mockWETH, mockUSDC } = await loadFixture(init);

        console.log(await LiquidityPoolUpgradeProxy.getAddress());
        console.log(await LiquidityPoolUpgradeProxy.name());
        console.log(await LiquidityPoolUpgradeProxy.symbol());
        console.log(await LiquidityPoolUpgradeProxy.getContractBase());
        console.log(await mockWETH.name(), await mockWETH.symbol(), await mockWETH.balanceOf(account1.address));
        console.log(await mockUSDC.name(), await mockUSDC.symbol(), await mockUSDC.balanceOf(account1.address));

        await mockWETH.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), 100n);
        await mockUSDC.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), 10000n);
        (await LiquidityPoolUpgradeProxy.connect(account1).addLiquidity(100n, 10000n)).wait();

        console.log(await LiquidityPoolUpgradeProxy.totalSupply(), await LiquidityPoolUpgradeProxy.balanceOf(account1.address));

        await mockWETH.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), 100n);
        await mockUSDC.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), 1000n);
        (await LiquidityPoolUpgradeProxy.connect(account1).addLiquidity(100n, 1000n)).wait();

        console.log(await LiquidityPoolUpgradeProxy.totalSupply(), await LiquidityPoolUpgradeProxy.balanceOf(account1.address));
        
        (await LiquidityPoolUpgradeProxy.connect(account1).removeLiquidity(100n, account1.address)).wait();
        console.log(
            await LiquidityPoolUpgradeProxy.totalSupply(), 
            await LiquidityPoolUpgradeProxy.balanceOf(account1.address),
            await LiquidityPoolUpgradeProxy.balanceOf(account2.address),
            await mockWETH.balanceOf(account1.address),
            await mockUSDC.balanceOf(account1.address),
            await mockWETH.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
            await mockUSDC.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
        );

        const t1 = await LiquidityPoolUpgradeProxy.connect(account1).getContractBase();
        const t2 = await LiquidityPoolUpgradeProxy.connect(account1).getLiquidityToken(account1.address);
        (await LiquidityPoolUpgradeProxy.connect(account1).setFee(5n)).wait();
        console.log(
            t1, t2, await LiquidityPoolUpgradeProxy.connect(account1).fee(),
        );
        
        console.log("WETH -> USDC") //200000000000000 5405
        var x1 = 100n;
        var fee1 = t1.fee;
        var fee = x1 * fee1 / (t1.FEE_DENOMINATOR + fee1) + ((x1 * fee1) % (t1.FEE_DENOMINATOR + fee1) > 0n ? 1n : 0n);
        fee == 0n && (fee = 1n);
        var x2 = x1 - fee;  // 输入 x
        var y1 = (t1.reserve0 * t1.reserve1) / (t1.reserve0 + x2) + (((t1.reserve0 * t1.reserve1) % (t1.reserve0 + x2)) > 0n ? 1n : 0n);
        var y2 = t1.reserve1 - y1;
        console.log(x1, x2, y1, y2, fee);

        await mockWETH.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), x1);
        (await LiquidityPoolUpgradeProxy.connect(account1).swap(x1, y2, await mockWETH.getAddress(), await mockUSDC.getAddress(), account1.address)).wait();

        console.log(
            await LiquidityPoolUpgradeProxy.totalSupply(), 
            await LiquidityPoolUpgradeProxy.balanceOf(account1.address),
            await LiquidityPoolUpgradeProxy.balanceOf(account2.address),
            await mockWETH.balanceOf(account1.address),
            await mockUSDC.balanceOf(account1.address),
            await mockWETH.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
            await mockUSDC.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
        );

        console.log("USDC -> WETH")
        var x1 = 100n;
        var fee1 = t1.fee;
        var fee = x1 * fee1 / (t1.FEE_DENOMINATOR + fee1) + ((x1 * fee1) % (t1.FEE_DENOMINATOR + fee1) > 0n ? 1n : 0n);
        fee == 0n && (fee = 1n);
        var x2 = x1 - fee;  // 输入 x
        var y1 = (t1.reserve0 * t1.reserve1) / (t1.reserve1 + x2) + (((t1.reserve0 * t1.reserve1) % (t1.reserve1 + x2)) > 0n ? 1n : 0n);
        var y2 = t1.reserve0 - y1;
        console.log(x1, x2, y1, y2, fee);

        await mockUSDC.connect(account1).approve(await LiquidityPoolUpgradeProxy.getAddress(), x1);
        (await LiquidityPoolUpgradeProxy.connect(account1).swap(x1, y2, await mockUSDC.getAddress(), await mockWETH.getAddress(), account1.address)).wait();

        console.log(
            await LiquidityPoolUpgradeProxy.totalSupply(), 
            await LiquidityPoolUpgradeProxy.balanceOf(account1.address),
            await LiquidityPoolUpgradeProxy.balanceOf(account2.address),
            await mockWETH.balanceOf(account1.address),
            await mockUSDC.balanceOf(account1.address),
            await mockWETH.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
            await mockUSDC.balanceOf(await LiquidityPoolUpgradeProxy.getAddress()),
        );

        //
    });
})