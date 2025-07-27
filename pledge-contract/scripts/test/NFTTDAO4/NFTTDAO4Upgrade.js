//npx hardhat test scripts/test/NFTTDAO4/NFTTDAO4Upgrade.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTTDAO4Upgrade Test', async function () {
    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();
        var storePath = await path.resolve(__dirname, './.cache/NFTTDAO4Test.json');
        var _owner = account1.address;

        // 获取合约的工厂实例，用于部署合约
        const NFTTDAO4 = await ethers.getContractFactory("NFTTDAO4");

        // 通过代理部署合约 
        const NFTTDAO4Proxy = await upgrades.deployProxy(NFTTDAO4, ["NFTTDAO4", "NFTTDAO4S", _owner], {
            initializer: 'initialize',
        });
        await NFTTDAO4Proxy.waitForDeployment();
        const proxyAddress = await NFTTDAO4Proxy.getAddress();
        console.log("代理合约地址：", proxyAddress);
        const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("实现合约地址：", upgradeAddress);
        console.log(await NFTTDAO4Proxy.name(), await NFTTDAO4Proxy.symbol());

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress,
            abi: NFTTDAO4.interface.format("json"),
        }))

        // const storeData = await fs.readFileSync(storePath);
        // const { proxyAddress } = JSON.parse(storeData);
        // console.log(JSON.parse(storeData));

        //拿到升级合约
        const NFTTDAO4Upgrade = await ethers.getContractFactory("NFTTDAO4V2");

        //升级代理合约
        const NFTActionUpgradeProxy = await upgrades.upgradeProxy(proxyAddress, NFTTDAO4Upgrade);
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
            abi: NFTTDAO4Upgrade.interface.format("json"),
        }))

        return { account1, account2, NFTActionUpgradeProxy, proxyAddress };
    }

    it('Order NFT', async function () {
        var { account1, account2, NFTActionUpgradeProxy, proxyAddress } = await loadFixture(init);

        // 测试 mint
        const tx1 = await NFTActionUpgradeProxy.connect(account1).safeMint(account1.address, "https://ipfs.io/ipfs/bafkreihewruw5gpqii6lfia5f3blb6kjwwitsct2xpy2ldj5g4kf3mdqa4");
        await tx1.wait();
        const tx2 = await NFTActionUpgradeProxy.connect(account1).safeBatchMint(account1.address, 10, "https://ipfs.io/ipfs/bafkreihewruw5gpqii6lfia5f3blb6kjwwitsct2xpy2ldj5g4kf3mdqa4");
        await tx2.wait();
        console.log(
            "测试 mint",
            await NFTActionUpgradeProxy.getNFTsByOwner(account1.address),
            await NFTActionUpgradeProxy.getAllMintedNFTs()
        );

        // 测试转移 nft
        await NFTActionUpgradeProxy.connect(account1).approve(proxyAddress, 1n);
        const tx3 = await NFTActionUpgradeProxy.connect(account1).transferNFT(account1.address, proxyAddress, 1n);
        await tx3.wait();

        await NFTActionUpgradeProxy.connect(account1).approve(proxyAddress, 2n);
        const tx5 = await NFTActionUpgradeProxy.connect(account1).transferNFT(account1.address, account2.address, 2n);
        await tx5.wait();

        // 测试批量转移 nft
        await NFTActionUpgradeProxy.connect(account1).setApprovalForAll(proxyAddress, true);
        const tx4 = await NFTActionUpgradeProxy.connect(account1).batchTransferNFT(account1.address, proxyAddress, [3, 4]);
        await tx4.wait();
        
        const tx6 = await NFTActionUpgradeProxy.connect(account1).transferSelfOwnedNFT(account1.address, 3n);
        await tx6.wait();

        console.log(
            "测试批量转移 nft",
            await NFTActionUpgradeProxy.getNFTsByOwner(account1.address),
            await NFTActionUpgradeProxy.getNFTsByOwner(account2.address),
            await NFTActionUpgradeProxy.getNFTsByOwner(proxyAddress),
            await NFTActionUpgradeProxy.getAllMintedNFTs(),
        );

        // 等待 2 个区块确认
        await time.advanceBlock(2);

        const tx7 = await NFTActionUpgradeProxy.connect(account1).tokenURI(11n);
        console.log(111, tx7, 222);
    });
})