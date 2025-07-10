import express from 'express';
import { createPublicClient, createWalletClient, http, custom, getContract, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors'; // 引入 cors 中间件

const { uniswapAbi, uniswapAddress } = require("./abi/UniswapInfo.js");

const app = express();
const port = 9000;
// 使用 cors 中间件
app.use(cors());

// 定义获取 Swap 事件的路由
app.get('/getSwapData', async (req, res) => {
  try {
    const db = await open({
      filename: './db/uniswap.db',
      driver: sqlite3.Database
    });

    const rows = await db.all('SELECT * FROM uniswapEvent');
    console.log(rows);

    res.json(rows);
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