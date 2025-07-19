//npx hardhat test scripts/test/NFTMarket2/NFTMarket2Upgrade.js

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
        var storePath = await path.resolve(__dirname, './.cache/NFTMarket2Test.json');
        var _owner = account1.address;

        const ERC721Mock = await hre.ethers.getContractFactory("ERC721Mock");
        const ERC721Mock1 = await upgrades.deployProxy(ERC721Mock, ["NFTmock1", "NFTmock1S", _owner], {
            initializer: 'initialize',
        });
        const ERC721Mock2 = await upgrades.deployProxy(ERC721Mock, ["NFTmock2", "NFTmock2S", _owner], {
            initializer: 'initialize',
        });

        // 获取合约的工厂实例，用于部署合约
        const NFTMarket2 = await ethers.getContractFactory("NFTMarket2");

        // 通过代理部署合约 
        const NFTMarket2Proxy = await upgrades.deployProxy(NFTMarket2, [_owner], {
            initializer: 'initialize',
        });
        await NFTMarket2Proxy.waitForDeployment();
        const proxyAddress = await NFTMarket2Proxy.getAddress();
        console.log("代理合约地址：", proxyAddress);
        const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("实现合约地址：", upgradeAddress);

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress,
            abi: NFTMarket2.interface.format("json"),
        }))

        // const storeData = await fs.readFileSync(storePath);
        // const { proxyAddress } = JSON.parse(storeData);
        // console.log(JSON.parse(storeData));

        //拿到升级合约
        const NFTMarket2V2 = await ethers.getContractFactory("NFTMarket2V2");

        //升级代理合约
        const NFTMarket2UpgradeProxy = await upgrades.upgradeProxy(proxyAddress, NFTMarket2V2);
        await NFTMarket2UpgradeProxy.waitForDeployment();
        const upgradeAddress2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("代理合约地址：", proxyAddress);
        console.log("实现合约地址：", upgradeAddress2);

        // 调用新的初始化函数
        // await NFTMarket2UpgradeProxy.reinitialize();

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress: upgradeAddress2,
            abi: NFTMarket2V2.interface.format("json"),
        }))

        return { account1, account2, NFTMarket2UpgradeProxy, proxyAddress, ERC721Mock1, ERC721Mock2 };
    }

    it('Mint NFT', async function () {
        var { account1, account2, NFTMarket2UpgradeProxy, proxyAddress, ERC721Mock1, ERC721Mock2 } = await loadFixture(init);
        const mockNFT1Address = await ERC721Mock1.getAddress();
        const fee = await NFTMarket2UpgradeProxy.fee();
        const FEE_DENOMINATOR = await NFTMarket2UpgradeProxy.FEE_DENOMINATOR();
        const mockNFT2Address = await ERC721Mock2.getAddress();
        console.log(mockNFT1Address, fee, FEE_DENOMINATOR);

        await ERC721Mock1.safeBatchMint(account1.address, 10, "");
        await ERC721Mock2.safeBatchMint(account1.address, 10, "");
        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];

        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("创建订单");
        await ERC721Mock1.connect(account1).approve(proxyAddress, 2);
        (await NFTMarket2UpgradeProxy.connect(account1).sellNFT(
            account1.address, mockNFT1Address, 2, 5000,
        )).wait();

        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];
        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("查询订单");
        const tx1 = await NFTMarket2UpgradeProxy.getAllNFT(account1.address, 2);
        console.log(tx1);

        console.log("查询自己订单");
        const tx2 = await NFTMarket2UpgradeProxy.connect(account1).getAllStatusNFT(1n, account1.address);
        console.log(tx2);

        console.log("修改订单");
        (await NFTMarket2UpgradeProxy.connect(account1).modifyNFT(
            10000,
            6000
        )).wait();
        const tx3 = await NFTMarket2UpgradeProxy.connect(account1).getAllStatusNFT(1n, account1.address);
        console.log(tx3);

        NFTMarket2UpgradeProxy.on('OrderCancelled', (NFTOrderInfo, event) => {
            console.log('Order cancelled:', NFTOrderInfo);
        });

        console.log("取消订单");
        (await NFTMarket2UpgradeProxy.connect(account1).cancelSellNFT(
            10000,
            mockNFT1Address
        )).wait();
        const tx4 = await NFTMarket2UpgradeProxy.getAllNFT(account1.address, 2);
        console.log(tx4);

        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];
        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("再次创建订单");
        await ERC721Mock1.connect(account1).approve(proxyAddress, 2);
        (await NFTMarket2UpgradeProxy.connect(account1).sellNFT(
            account1.address, mockNFT1Address, 2, 7000,
        )).wait();
        const tx5 = await NFTMarket2UpgradeProxy.getAllNFT(account1.address, 2);
        console.log(tx5);

        console.log("成交订单");
        (await NFTMarket2UpgradeProxy.connect(account2).buyNFT(
            10001,
            account2.address,
            { value: 7000n + 7000n * fee / FEE_DENOMINATOR }
        )).wait();
        const tx6 = await NFTMarket2UpgradeProxy.getAllNFT(account2.address, 2);
        console.log(tx6);

        var balance = await ERC721Mock1.balanceOf(account2.address);
        var tokenIds = [];
        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account2.address, i);
        }
        console.log(tokenIds);

        console.log(
            await ethers.provider.getBalance(account1.address),
            await ethers.provider.getBalance(account2.address),
            await ethers.provider.getBalance(proxyAddress),
        );

        console.log("创建订单");
        await ERC721Mock1.connect(account1).approve(proxyAddress, 7);
        (await NFTMarket2UpgradeProxy.connect(account1).sellNFT(
            account1.address, mockNFT1Address, 7, 7000,
        )).wait();
        await ERC721Mock2.connect(account1).approve(proxyAddress, 2);
        (await NFTMarket2UpgradeProxy.connect(account1).sellNFT(
            account1.address, mockNFT2Address, 2, 5000,
        )).wait();

        const tx7 = await NFTMarket2UpgradeProxy.getAllNFTList();
        console.log(tx7);

        const tx8 = await NFTMarket2UpgradeProxy.getNFTAllOrderList(mockNFT1Address);
        const tx9 = await NFTMarket2UpgradeProxy.getNFTAllOrderList(mockNFT2Address);
        console.log(tx8, tx9);
    });
})