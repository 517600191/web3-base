const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// 定义多签合约的地址数组
let multiSignatureAddress = [
  "0xef7b473C547a4c5842c25C924E7513C0aE134Dc4",
  "0x224e6E44bC62e2af466ED9b0aF52d11D00c155a1",
  "0x3133810e08627ccE2bd4100dfFbE127F99823719"
];
// 定义多签合约的签名阈值，即需要多少个签名才能执行操作
let threshold = 2;

// 定义异步主函数，用于部署合约
async function main() {
  // 从 Hardhat 获取签名者列表，并解构赋值获取第一个和最后一个签名者
  const { save } = deployments;
  const [deployer] = await ethers.getSigners();
  var storePath = null;

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  // console.log(JSON.stringify(network));

  if (network.name == "localhost") {
    storePath = await path.resolve(__dirname, './.cache/MultiSignatureProxyLocalhost.json');
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/MultiSignatureProxySepolia.json');
  }

  // 获取合约的工厂实例，用于部署合约
  const MultiSignature = await ethers.getContractFactory("MultiSignature");

  console.log(multiSignatureAddress, threshold);

  // 通过代理部署合约 
  const MultiSignatureProxy = await upgrades.deployProxy(MultiSignature, [multiSignatureAddress, threshold], {
    initializer: 'initialize',
    // constructorArgs: [multiSignatureAddress, threshold],
  });
  await MultiSignatureProxy.waitForDeployment();
  const proxyAddress = await MultiSignatureProxy.getAddress();
  console.log("代理合约地址：", proxyAddress);
  const upgradeAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("实现合约地址：", upgradeAddress);

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    proxyAddress,
    upgradeAddress,
    abi: MultiSignature.interface.format("json"),
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
借助 Hardhat 部署 multiSignature 合约步骤说明：
1. 环境准备：
   - 确保已安装 Node.js 和 npm。
   - 在项目根目录下安装 Hardhat 及其依赖：`npm install --save-dev hardhat`。
   - 初始化 Hardhat 项目：`npx hardhat`，按照提示选择配置。
   - 将 multiSignature 合约的 Solidity 文件放置在 `contracts` 目录下。
2. 配置 Hardhat：
   - 编辑 `hardhat.config.js` 文件，配置网络、编译器等信息。
3. 运行部署脚本：
   - 在终端中执行 `npx hardhat run scripts/deploy/multiSignature.js --network <network-name>`，其中 `<network-name>` 是你要部署到的网络名称，如 `localhost`、`rinkeby` 等。
4. 查看结果：
   - 部署成功后，终端会输出部署账户地址、账户余额和合约地址。
*/