//npx hardhat test scripts/test/NFTMarket/NFTMarketProxy.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTMarketProxy Test', async function () {
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

        return { account1, account2, NFTTDAO2Proxy };
    }

    it('Mint NFT', async function () {
        var { account1, account2, NFTTDAO2Proxy } = await loadFixture(init);

        // 测试 mint
        const tx1 = await NFTTDAO2Proxy.connect(account1).safeMint(account1.address, "./NFTTDAO2.json");
        await tx1.wait();
        const tx2 = await NFTTDAO2Proxy.connect(account1).safeBatchMint(account1.address, 10, "./NFTTDAO2.json");
        await tx2.wait();
        console.log(
            await NFTTDAO2Proxy.getNFTsByOwner(account1.address),
            await NFTTDAO2Proxy.getAllMintedNFTs()
        );

        // 测试转移 nft
        const tx3 = await NFTTDAO2Proxy.connect(account1).transferNFT(account1.address, account2.address, 0);
        await tx3.wait();

        // 测试批量转移 nft
        const tx4 = await NFTTDAO2Proxy.connect(account1).batchTransferNFT(account1.address, account2.address, [2, 3]);
        await tx4.wait();

        console.log(
            await NFTTDAO2Proxy.getNFTsByOwner(account1.address),
            await NFTTDAO2Proxy.getNFTsByOwner(account2.address)
        );
    });
})