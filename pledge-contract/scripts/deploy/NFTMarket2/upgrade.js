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
    storePath = await path.resolve(__dirname, './.cache/NFTMarket2ProxyLocalhost.json');
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/NFTMarket2ProxySepolia.json');
  }

  const storeData = await fs.readFileSync(storePath);
  const { proxyAddress } = JSON.parse(storeData);
  // console.log(JSON.parse(storeData));

  //拿到升级合约
  const NFTMarket2Upgrade = await ethers.getContractFactory("NFTMarket2V2");

  //升级代理合约
  const NFTActionUpgradeProxy = await upgrades.upgradeProxy(proxyAddress, NFTMarket2Upgrade);
  await NFTActionUpgradeProxy.waitForDeployment();
  const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("代理合约地址：", proxyAddress);
  console.log("实现合约地址：", upgradeAddress);

  // 调用新的初始化函数
  // await NFTActionUpgradeProxy.reinitialize();

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    proxyAddress,
    upgradeAddress,
    abi: NFTMarket2Upgrade.interface.format("json"),
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
借助 Hardhat 部署 NFTMarket2 合约步骤说明：
1. 环境准备：
   - 确保已安装 Node.js 和 npm。
   - 在项目根目录下安装 Hardhat 及其依赖：`npm install --save-dev hardhat`。
   - 初始化 Hardhat 项目：`npx hardhat`，按照提示选择配置。
   - 将 NFTMarket2 合约的 Solidity 文件放置在 `contracts` 目录下。
2. 配置 Hardhat：
   - 编辑 `hardhat.config.js` 文件，配置网络、编译器等信息。
3. 运行部署脚本：
   - 在终端中执行 `npx hardhat run scripts/deploy/NFTMarket2.js --network <network-name>`，其中 `<network-name>` 是你要部署到的网络名称，如 `localhost`、`rinkeby` 等。
4. 查看结果：
   - 部署成功后，终端会输出部署账户地址、账户余额和合约地址。
*/