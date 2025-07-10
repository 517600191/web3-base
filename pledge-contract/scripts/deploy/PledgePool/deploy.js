const { deployments, upgrades, ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

let oracleAddress = "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3";
let swapRouter = "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3";
let feeAddress = "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3";

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
    storePath = await path.resolve(__dirname, './.cache/PledgePoolProxyLocalhost.json');
  } else if (network.name == "sepolia") {
    storePath = await path.resolve(__dirname, './.cache/PledgePoolProxySepolia.json');
  }

  // 获取合约的工厂实例，用于部署合约
  const PledgePool = await ethers.getContractFactory("PledgePool");
  const PledgePoolcontract = await PledgePool.deploy(oracleAddress, swapRouter, feeAddress); //部署合约
  await PledgePoolcontract.waitForDeployment(); //等待合约部署完成
  const contractAddress = await PledgePoolcontract.getAddress();
  console.log("实现合约地址：", contractAddress);

  // 存储合约信息
  await fs.writeFileSync(storePath, JSON.stringify({
    contractAddress,
    abi: PledgePool.interface.format("json"),
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
借助 Hardhat 部署 PledgePool 合约步骤说明：
1. 环境准备：
   - 确保已安装 Node.js 和 npm。
   - 在项目根目录下安装 Hardhat 及其依赖：`npm install --save-dev hardhat`。
   - 初始化 Hardhat 项目：`npx hardhat`，按照提示选择配置。
   - 将 PledgePool 合约的 Solidity 文件放置在 `contracts` 目录下。
2. 配置 Hardhat：
   - 编辑 `hardhat.config.js` 文件，配置网络、编译器等信息。
3. 运行部署脚本：
   - 在终端中执行 `npx hardhat run scripts/deploy/PledgePool.js --network <network-name>`，其中 `<network-name>` 是你要部署到的网络名称，如 `localhost`、`rinkeby` 等。
4. 查看结果：
   - 部署成功后，终端会输出部署账户地址、账户余额和合约地址。
*/