const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// 定义异步主函数，用于部署合约
async function main() {
  // 从 Hardhat 获取签名者列表，并解构赋值获取第一个和最后一个签名者
  const { save } = deployments;
  const [deployer, deployer2] = await ethers.getSigners();
  var storePath = null;
  var _owner = null;

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  // console.log(JSON.stringify(network));

  if (network.name == "localhost") {
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO4ProxyLocalhost.json');
    _owner = deployer.address;
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO4ProxySepolia.json');
    _owner = process.env.OWNER_ADDRESS;
  }

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

  if (network.name == "localhost") {
    
  } else if (network.name == "sepolia") {
    // const tx1 = await NFTTDAO4Proxy.safeMint("0xef7b473C547a4c5842c25C924E7513C0aE134Dc4", "./NFTTDAO4.json");
    // await tx1.wait();
    // const tx2 = await NFTTDAO4Proxy.safeBatchMint("0xef7b473C547a4c5842c25C924E7513C0aE134Dc4", 2, "./NFTTDAO4.json");
    // await tx2.wait();
  }

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    proxyAddress,
    upgradeAddress,
    abi: NFTTDAO4.interface.format("json"),
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
借助 Hardhat 部署 NFTTDAO4 合约步骤说明：
1. 环境准备：
   - 确保已安装 Node.js 和 npm。
   - 在项目根目录下安装 Hardhat 及其依赖：`npm install --save-dev hardhat`。
   - 初始化 Hardhat 项目：`npx hardhat`，按照提示选择配置。
   - 将 NFTTDAO4 合约的 Solidity 文件放置在 `contracts` 目录下。
2. 配置 Hardhat：
   - 编辑 `hardhat.config.js` 文件，配置网络、编译器等信息。
3. 运行部署脚本：
   - 在终端中执行 `npx hardhat run scripts/deploy/NFTTDAO4.js --network <network-name>`，其中 `<network-name>` 是你要部署到的网络名称，如 `localhost`、`rinkeby` 等。
4. 查看结果：
   - 部署成功后，终端会输出部署账户地址、账户余额和合约地址。
*/