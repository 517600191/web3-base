//npx hardhat test scripts/test/NFTMarket/NFTMarketUpgrade.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTMarketUpgrade Test', async function () {
    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();
        var storePath = await path.resolve(__dirname, './.cache/NFTMarketTest.json');
        var _owner = account1.address;

        // 获取合约的工厂实例，用于部署合约
        const NFTTDAO2 = await ethers.getContractFactory("NFTTDAO2");

        // 通过代理部署合约 
        const NFTTDAO2Proxy = await upgrades.deployProxy(NFTTDAO2, ["NFTTDAO2", "NFTTDAO2S", _owner], {
            initializer: 'initialize',
        });
        await NFTTDAO2Proxy.waitForDeployment();
        const proxyAddress = await NFTTDAO2Proxy.getAddress();
        console.log("代理合约地址：", proxyAddress);
        const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("实现合约地址：", upgradeAddress);
        console.log(await NFTTDAO2Proxy.name(), await NFTTDAO2Proxy.symbol());

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress,
            abi: NFTTDAO2.interface.format("json"),
        }))

        // const storeData = await fs.readFileSync(storePath);
        // const { proxyAddress } = JSON.parse(storeData);
        // console.log(JSON.parse(storeData));

        //拿到升级合约
        const NFTTDAO2Upgrade = await ethers.getContractFactory("NFTTDAO2V2");

        //升级代理合约
        const NFTActionUpgradeProxy = await upgrades.upgradeProxy(proxyAddress, NFTTDAO2Upgrade);
        await NFTActionUpgradeProxy.waitForDeployment();
        const upgradeAddress2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("代理合约地址：", proxyAddress);
        console.log("实现合约地址：", upgradeAddress2);

        // 调用新的初始化函数
        // await NFTActionUpgradeProxy.reinitialize();

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress: upgradeAddress2,
            abi: NFTTDAO2Upgrade.interface.format("json"),
        }))

        return { account1, account2, NFTActionUpgradeProxy };
    }

    it('Order NFT', async function () {
        var { account1, account2, NFTActionUpgradeProxy } = await loadFixture(init);

        // 测试 mint
        const tx1 = await NFTActionUpgradeProxy.connect(account1).safeMint(account1.address, "./NFTTDAO2.json");
        await tx1.wait();
        const tx2 = await NFTActionUpgradeProxy.connect(account1).safeBatchMint(account1.address, 10, "./NFTTDAO2.json");
        await tx2.wait();
        console.log(
            await NFTActionUpgradeProxy.getNFTsByOwner(account1.address),
            await NFTActionUpgradeProxy.getAllMintedNFTs()
        );

        // 测试转移 nft
        const tx3 = await NFTActionUpgradeProxy.connect(account1).transferNFT(account1.address, account2.address, 1);
        await tx3.wait();

        // 测试批量转移 nft
        const tx4 = await NFTActionUpgradeProxy.connect(account1).batchTransferNFT(account1.address, account2.address, [2, 3]);
        await tx4.wait();

        console.log(
            await NFTActionUpgradeProxy.getNFTsByOwner(account1.address),
            await NFTActionUpgradeProxy.getNFTsByOwner(account2.address)
        );

        // 创建订单
        (await NFTActionUpgradeProxy.connect(account1).sellNFT(
            account1.address, 10, 5000,
        )).wait();

        // 查询订单
        const tx5 = await NFTActionUpgradeProxy.connect(account1).getAllStatusNFT(1n);

        // 修改订单
        (await NFTActionUpgradeProxy.connect(account1).modifyNFT(
            10000,
            6000
        )).wait();
        const tx6 = await NFTActionUpgradeProxy.connect(account1).getAllStatusNFT(1n);

        NFTActionUpgradeProxy.on('OrderCancelled', (NFTOrderInfo, event) => {
            console.log('Order cancelled:', NFTOrderInfo);
        });

        // 取消订单
        (await NFTActionUpgradeProxy.connect(account1).cancelSellNFT(
            10000
        )).wait();
        const tx7 = await NFTActionUpgradeProxy.connect(account1).getAllStatusNFT(1n);

        //再次创建订单
        (await NFTActionUpgradeProxy.connect(account1).sellNFT(
            account1.address, 10, 5000,
        )).wait();
        const tx8 = await NFTActionUpgradeProxy.connect(account1).getAllStatusNFT(1n);

        // 成交订单
        (await NFTActionUpgradeProxy.connect(account2).buyNFT(
            10001,
            account2.address,
            { value: 5000 + 5000 * 0.02 } //2%
        )).wait();
        const tx9 = await NFTActionUpgradeProxy.connect(account1).getAllStatusNFT(1n);

        const tx10 = await NFTActionUpgradeProxy.connect(account1).getAllNFT();

        console.log(
            await NFTActionUpgradeProxy.getNFTsByOwner(account1.address),
            await NFTActionUpgradeProxy.getNFTsByOwner(account2.address),
            "tx5", tx5,
            "tx6", tx6,
            "tx7", tx7,
            "tx8", tx8,
            "tx9", tx9,
            "tx10", tx10,
        );
    });
})