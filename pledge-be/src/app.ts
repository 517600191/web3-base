import express from 'express';
import { createPublicClient, createWalletClient, http, custom, getContract, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
const { uniswapAbi, uniswapAddress } = require("./abi/UniswapInfo.js");

const app = express();
const port = 9000;
var publicClient: any = null;
var UniswapContract: any = null;

const init = async () => {
  // 创建一个连接到以太坊主网的公共客户端 eth-call
  publicClient = createPublicClient({
    batch: {
      multicall: true,
    },
    chain: mainnet,
    transport: http(),
  });
  // console.log(publicClient);

  UniswapContract = await getContract({
    address: uniswapAddress as `0x${string}`,
    abi: uniswapAbi,
    client: {
      public: publicClient,
    }
  });
  // console.log(UniswapContract);
}

// 调用 init 方法
init().catch((error) => {
  console.error('初始化失败:', error);
});

// 定义一个辅助函数，用于将 Unix 时间戳转换为日期时间字符串
const convertTimestampToDate = (timestamp: bigint | number) => {
  // 将时间戳转换为毫秒，因为 JavaScript 的 Date 对象接受毫秒级时间戳
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

// 定义获取 Swap 事件的路由
app.get('/swapEvent', async (req, res) => {
  try {
    let swapListTemp: any = [];
    // 查询的区块页数
    const numMax = 5n; //每页1000
    // 获取最新区块号
    const currentBlockNumber = await publicClient.getBlockNumber();
    const decimals = await UniswapContract.read.decimals();
    console.log(decimals);

    for (let i = 1n; i <= numMax; i++) {
      // 查询 Transfer 事件
      const logs = await publicClient.getContractEvents({
        address: uniswapAddress,
        abi: uniswapAbi,
        eventName: 'Swap',
        fromBlock: currentBlockNumber - (1000n * i), // 从创世区块开始
        toBlock: currentBlockNumber - (1000n * (i - 1n)), // 到最新区块号
      });

      // console.log(logs);
      swapListTemp = swapListTemp.concat(logs);
    }

    console.log(swapListTemp);

    // 处理日志
    const transactions = swapListTemp.map((log: any) => {
      return {
        args: {
          amount0In: formatUnits(log.args.amount0In, 18),
          amount0Out: formatUnits(log.args.amount0Out, 18),
          amount1In: formatUnits(log.args.amount1In, 18),
          amount1Out: formatUnits(log.args.amount1Out, 18),
          sender: log.args.sender,
          to: log.args.to,
        },
        blockTimestamp: convertTimestampToDate(log.blockTimestamp),
        blockNumber: log.blockNumber.toString(),
        eventName: log.eventName,
        type: log.args.amount0In == 0n ? "SELL WISH" : "BUY WISH",
      };
    });
    console.log("transactions", transactions);

    res.json(transactions);
  } catch (error) {
    console.error('获取 Swap 事件失败:', error);
    res.status(500).json({ error: error });
  }
});

// 启动服务器
const server = app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
server.timeout = 1000 * 60;

// 导出 server 实例，方便测试结束后关闭服务器
export { server, app };