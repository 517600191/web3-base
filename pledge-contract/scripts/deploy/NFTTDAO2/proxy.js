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
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO2ProxyLocalhost.json');
    _owner = deployer.address;
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/NFTTDAO2ProxySepolia.json');
    _owner = process.env.OWNER_ADDRESS;
  }

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

  // 获取实现合约的实例
  // const implementationContract = await ethers.getContractAt("NFTTDAO2", upgradeAddress);
  // 调用 owner 方法获取实现合约的 owner 地址
  // const implementationOwner = await implementationContract.owner();
  // const proxyOwner = await NFTTDAO2Proxy.owner();
  // console.log("代理合约的 owner 地址：", proxyOwner);

  // NFTTDAO2Proxy.on("LogMessage", (arg1, arg2, event) => {
  //   console.log("Event emitted:");
  //   console.log("  arg1:", arg1);
  //   console.log("  arg2:", arg2);
  //   console.log("  event:", event);
  // });

  if (network.name == "localhost") {
    // 测试 mint
    // const tx1 = await NFTTDAO2Proxy.connect(deployer).safeMint(deployer.address, "./NFTTDAO2.json");
    // await tx1.wait();
    // const tx2 = await NFTTDAO2Proxy.connect(deployer).safeBatchMint(deployer.address, 10, "./NFTTDAO2.json");
    // await tx2.wait();
    // const info1 = await NFTTDAO2Proxy.getNFTsByOwner(deployer.address);
    // const info2 = await NFTTDAO2Proxy.getAllMintedNFTs();
    // console.log(info1, info2);

    // // 测试转移 nft
    // const tx3 = await NFTTDAO2Proxy.connect(deployer).transferNFT(deployer.address, deployer2.address, 0);
    // await tx3.wait();

    // // 测试批量转移 nft
    // const tx4 = await NFTTDAO2Proxy.connect(deployer).batchTransferNFT(deployer.address, deployer2.address, [2, 3]);
    // await tx4.wait();
    // console.log(await NFTTDAO2Proxy.getNFTsByOwner(deployer.address), await NFTTDAO2Proxy.getNFTsByOwner(deployer2.address));
  } else if (network.name == "sepolia") {
    const tx1 = await NFTTDAO2Proxy.safeMint("0xef7b473C547a4c5842c25C924E7513C0aE134Dc4", "./NFTTDAO2.json");
    await tx1.wait();
    const tx2 = await NFTTDAO2Proxy.safeBatchMint("0xef7b473C547a4c5842c25C924E7513C0aE134Dc4", 2, "./NFTTDAO2.json");
    await tx2.wait();
  }

  // const tx2 = await NFTTDAO2Proxy.connect(deployer).getAllMintedNFTs(deployer.address);
  // const info1 = await tx2.wait();
  // console.log(info1);

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    proxyAddress,
    upgradeAddress,
    abi: NFTTDAO2.interface.format("json"),
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