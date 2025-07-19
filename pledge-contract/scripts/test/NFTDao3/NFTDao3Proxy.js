//npx hardhat test scripts/test/NFTDao3/NFTDao3Proxy.js

const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('NFTDao3Proxy Test', async function () {
    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();
        var storePath = await path.resolve(__dirname, './.cache/NFTDao3Test.json');
        var _owner = account1.address;

        // 获取合约的工厂实例，用于部署合约
        const NFTDao3 = await ethers.getContractFactory("NFTDao3");

        // 通过代理部署合约 
        const NFTDao3Proxy = await upgrades.deployProxy(NFTDao3, ["NFTDao3", "NFTDao3S", _owner], {
            initializer: 'initialize',
        });
        await NFTDao3Proxy.waitForDeployment();
        const proxyAddress = await NFTDao3Proxy.getAddress();
        console.log("代理合约地址：", proxyAddress);
        const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("实现合约地址：", upgradeAddress);
        console.log(await NFTDao3Proxy.name(), await NFTDao3Proxy.symbol());

        // 存储合约信息
        await fs.writeFileSync(storePath, JSON.stringify({
            proxyAddress,
            upgradeAddress,
            abi: NFTDao3.interface.format("json"),
        }))

        return { account1, account2, NFTDao3Proxy, proxyAddress };
    }

    it('Mint NFT', async function () {
        var { account1, account2, NFTDao3Proxy, proxyAddress } = await loadFixture(init);

        // 测试 mint
        const tx1 = await NFTDao3Proxy.connect(account1).safeMint(account1.address, "./NFTDao3.json");
        await tx1.wait();
        const tx2 = await NFTDao3Proxy.connect(account1).safeBatchMint(account1.address, 10, "./NFTDao3.json");
        await tx2.wait();
        console.log(
            "测试 mint",
            await NFTDao3Proxy.getNFTsByOwner(account1.address),
            await NFTDao3Proxy.getAllMintedNFTs()
        );

        // 测试转移 nft
        await NFTDao3Proxy.connect(account1).approve(proxyAddress, 1n);
        const tx3 = await NFTDao3Proxy.connect(account1).transferNFT(account1.address, proxyAddress, 1n);
        await tx3.wait();

        // 测试批量转移 nft
        await NFTDao3Proxy.connect(account1).setApprovalForAll(proxyAddress, true);
        const tx4 = await NFTDao3Proxy.connect(account1).batchTransferNFT(account1.address, proxyAddress, [3, 4]);
        await tx4.wait();

        console.log(
            "测试批量转移 nft",
            await NFTDao3Proxy.getNFTsByOwner(account1.address),
            await NFTDao3Proxy.getNFTsByOwner(account2.address),
            await NFTDao3Proxy.getNFTsByOwner(proxyAddress),
            await NFTDao3Proxy.getAllMintedNFTs(),
        );
    });
})