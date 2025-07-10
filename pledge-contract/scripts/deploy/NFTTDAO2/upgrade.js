const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// 定义异步主函数，用于部署合约
async function main() {
  const { save } = deployments;
  // const { deployer } = await getNamedAccounts();
  const [deployer, deployer2] = await ethers.getSigners();
  var storePath = null;

  //读取 proxy.js文件
  if (network.name == "localhost") {
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO2ProxyLocalhost.json');
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO2ProxySepolia.json');
  }

  const storeData = await fs.readFileSync(storePath);
  const { proxyAddress } = JSON.parse(storeData);
  // console.log(JSON.parse(storeData));

  //拿到升级合约
  const NFTTDAO2Upgrade = await ethers.getContractFactory("NFTTDAO2V2");

  //升级代理合约
  const NFTActionUpgradeProxy = await upgrades.upgradeProxy(proxyAddress, NFTTDAO2Upgrade);
  await NFTActionUpgradeProxy.waitForDeployment();
  const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("代理合约地址：", proxyAddress);
  console.log("实现合约地址：", upgradeAddress);

  if (network.name == "localhost") {
    // 测试 mint
    // const tx1 = await NFTActionUpgradeProxy.connect(deployer).safeMint(deployer.address, "./NFTTDAO2.json");
    // await tx1.wait();
    // const tx2 = await NFTActionUpgradeProxy.connect(deployer).safeBatchMint(deployer.address, 10, "./NFTTDAO2.json");
    // await tx2.wait();

    // 测试转移 nft
    // const tx3 = await NFTActionUpgradeProxy.connect(deployer).transferNFT(deployer.address, deployer2.address, 4);
    // await tx3.wait();

    // 测试批量转移 nft
    // const tx4 = await NFTActionUpgradeProxy.connect(deployer).batchTransferNFT(deployer.address, deployer2.address, [5, 6]);
    // await tx4.wait();
    
    // const info1 = await NFTActionUpgradeProxy.getNFTsByOwner(deployer.address);
    // const info2 = await NFTActionUpgradeProxy.getNFTsByOwner(deployer2.address);
    // const info3 = await NFTActionUpgradeProxy.getAllMintedNFTs();
    // console.log(info1, info2, info3);

    // 测试批量存入 nft
    // const tx5 = await NFTActionUpgradeProxy.connect(deployer2).batchDepositNFT(deployer2.address, [3]);
    // await tx5.wait();

    // const approvedAddress = await NFTActionUpgradeProxy.getApproved(10);
    // console.log("Approved address for tokenId", 1, ":", approvedAddress);

    // const tokenIdsToWithdraw = [2];
    // for (let i = 0; i < tokenIdsToWithdraw.length; i++) {
    //   const owner = await NFTActionUpgradeProxy.ownerOf(tokenIdsToWithdraw[i]);
    //     console.log(owner);
    //     const isApprovedForAll = await NFTActionUpgradeProxy.isApprovedForAll(owner, deployer2.address);
    //     console.log(isApprovedForAll);
        
    //     const contractOwner = await NFTActionUpgradeProxy.owner();
    //     console.log(contractOwner);
    //     await NFTActionUpgradeProxy.approve(deployer2.address, tokenIdsToWithdraw[i]);

    //     (deployer2.address, tokenIdsToWithdraw[i], deployer1.address, true)  proxyAddress
        // const approvedAddress = await NFTActionUpgradeProxy.getApproved(tokenIdsToWithdraw[i]);
        // console.log(approvedAddress);
        // if (approvedAddress !== deployer.address) {
        //     // Request approval if not approved
        //     await NFTActionUpgradeProxy.connect(deployer).approve(deployer.address, tokenIdsToWithdraw[i]);
        // }
    // }

    // console.log(deployer2.address);
    // await NFTActionUpgradeProxy.setApprovalForAll(proxyAddress, true);
    // await NFTActionUpgradeProxy.setApprovalForAll(deployer.address, true);
    
    // const isApproved = await NFTActionUpgradeProxy.isApprovedForAll(deployer.address, proxyAddress);
    // console.log("Is caller approved for all NFTs:", isApproved);

    // 测试批量取出 nft
    
    // const tx6 = await NFTActionUpgradeProxy.connect(deployer).batchWithdrawNFT(deployer.address, [3]);
    // await tx6.wait();

    // console.log(
    //   await NFTActionUpgradeProxy.getNFTsByOwner(deployer.address),
    //   await NFTActionUpgradeProxy.getNFTsByOwner(deployer2.address),
    //   await NFTActionUpgradeProxy.getNFTsByOwner(proxyAddress),
    //   await NFTActionUpgradeProxy.getNFTsByOwner(upgradeAddress)
    // );
  } else if (network.name == "sepolia") {

  }

  // 调用新的初始化函数
  // await NFTActionUpgradeProxy.reinitialize();

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    proxyAddress,
    upgradeAddress,
    abi: NFTTDAO2Upgrade.interface.format("json"),
  }))
}

// 调用主函数进行合约部署
main()
  // 部署成功后，正常退出进程
  .then(() => process.exit(0))
  // 部署失败时，打印错误信息并异常退出进程
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

/* 
借助 Hardhat 部署 NFTTDAO2 合约步骤说明：
1. 环境准备：
   - 确保已安装 Node.js 和 npm。
   - 在项目根目录下安装 Hardhat 及其依赖：`npm install --save-dev hardhat`。
   - 初始化 Hardhat 项目：`npx hardhat`，按照提示选择配置。
   - 将 NFTTDAO2 合约的 Solidity 文件放置在 `contracts` 目录下。
2. 配置 Hardhat：
   - 编辑 `hardhat.config.js` 文件，配置网络、编译器等信息。
3. 运行部署脚本：
   - 在终端中执行 `npx hardhat run scripts/deploy/NFTTDAO2.js --network <network-name>`，其中 `<network-name>` 是你要部署到的网络名称，如 `localhost`、`rinkeby` 等。
4. 查看结果：
   - 部署成功后，终端会输出部署账户地址、账户余额和合约地址。
*/