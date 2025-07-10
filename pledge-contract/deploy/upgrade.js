const { deployments, upgrades, ethers } = require('hardhat');

const fs = require('fs');
const path = require('path');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { save } = deployments;
    const { deployer } = await getNamedAccounts();

    //读取 proxy.js文件
    const storePath = await path.resolve(__dirname, './.cache/NFTAuctionProxy.json');
    const storeData = await fs.readFileSync(storePath);
    const { proxyAddress, implAddress, abi } = JSON.parse(storeData);
    console.log(JSON.parse(storeData));

    //拿到升级合约
    const NFTAuctionV2 = await ethers.getContractFactory("NFTAuctionV2");

    //升级代理合约
    const NFTActionV2Proxy = await upgrades.upgradeProxy(proxyAddress, NFTAuctionV2);
    await NFTActionV2Proxy.waitForDeployment();
    const proxyAddressV2 = await NFTActionV2Proxy.getAddress();

    await save('NFTAuctionProxy', {
        address: proxyAddress,
        implementation: proxyAddressV2,
        abi: NFTAuctionV2.interface.format("json"),
    })
}

module.exports.tags = ['DeployNFTAuctionUpgrade'];