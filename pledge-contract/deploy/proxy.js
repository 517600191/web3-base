const { deployments, upgrades, ethers } = require('hardhat');

const fs = require('fs');
const path = require('path');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { save } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("部署用户地址：", deployer);
    const NFTAuction = await ethers.getContractFactory("NFTAuction");

    //通过代理部署合约 
    const NFTAuctionProxy = await upgrades.deployProxy(NFTAuction, [], {
        initializer: 'initialize'
    });
    await NFTAuctionProxy.waitForDeployment();

    const proxyAddress = await NFTAuctionProxy.getAddress();
    console.log("代理合约地址：", proxyAddress);
    const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("实现合约地址：", upgradeAddress);

    const storePath = await path.resolve(__dirname, './.cache/NFTAuctionProxy.json');

    await fs.writeFileSync(storePath, JSON.stringify({
        proxyAddress,
        upgradeAddress,
        abi: NFTAuction.interface.format("json"),
    }))

    await save('NFTAuctionProxy', {
        address: proxyAddress,
        implementation: upgradeAddress,
        abi: NFTAuction.interface.format("json"),
    })
}

module.exports.tags = ['DeployNFTAuctionProxy'];