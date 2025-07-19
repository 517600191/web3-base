//npx hardhat test scripts/test/NFTMarket2/NFTMarket2Proxy.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTMarket2Proxy Test', async function () {
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

        return { account1, account2, NFTMarket2Proxy, proxyAddress, ERC721Mock1 };
    }

    it('Mint NFT', async function () {
        var { account1, account2, NFTMarket2Proxy, proxyAddress, ERC721Mock1 } = await loadFixture(init);
        const mockNFT1Address = await ERC721Mock1.getAddress();
        const fee = await NFTMarket2Proxy.fee();
        const FEE_DENOMINATOR = await NFTMarket2Proxy.FEE_DENOMINATOR();
        console.log(mockNFT1Address, fee, FEE_DENOMINATOR);

        await ERC721Mock1.safeBatchMint(account1.address, 10, "");
        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];

        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("创建订单");
        await ERC721Mock1.connect(account1).approve(proxyAddress, 2);
        (await NFTMarket2Proxy.connect(account1).sellNFT(
            account1.address, mockNFT1Address, 2, 5000,
        )).wait();

        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];
        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("查询订单");
        const tx1 = await NFTMarket2Proxy.getAllNFT(account1.address, 2);
        console.log(tx1);

        console.log("查询自己订单");
        const tx2 = await NFTMarket2Proxy.connect(account1).getAllStatusNFT(1n, account1.address);
        console.log(tx2);

        console.log("修改订单");
        (await NFTMarket2Proxy.connect(account1).modifyNFT(
            10000,
            6000
        )).wait();
        const tx3 = await NFTMarket2Proxy.connect(account1).getAllStatusNFT(1n, account1.address);
        console.log(tx3);

        NFTMarket2Proxy.on('OrderCancelled', (NFTOrderInfo, event) => {
            console.log('Order cancelled:', NFTOrderInfo);
        });

        console.log("取消订单");
        (await NFTMarket2Proxy.connect(account1).cancelSellNFT(
            10000,
            mockNFT1Address
        )).wait();
        const tx4 = await NFTMarket2Proxy.getAllNFT(account1.address, 2);
        console.log(tx4);

        var balance = await ERC721Mock1.balanceOf(account1.address);
        var tokenIds = [];
        for (i = 0; i < balance; i++) {
            tokenIds[i] = await ERC721Mock1.tokenOfOwnerByIndex(account1.address, i);
        }
        console.log(tokenIds);

        console.log("再次创建订单");
        await ERC721Mock1.connect(account1).approve(proxyAddress, 2);
        (await NFTMarket2Proxy.connect(account1).sellNFT(
            account1.address, mockNFT1Address, 2, 7000,
        )).wait();
        const tx5 = await NFTMarket2Proxy.getAllNFT(account1.address, 2);
        console.log(tx5);

        console.log("成交订单");
        (await NFTMarket2Proxy.connect(account2).buyNFT(
            10001,
            account2.address,
            { value: 7000n + 7000n * fee / FEE_DENOMINATOR }
        )).wait();
        const tx6 = await NFTMarket2Proxy.getAllNFT(account2.address, 2);
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
    });
})