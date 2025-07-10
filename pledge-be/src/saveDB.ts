import express from 'express';
import { createPublicClient, createWalletClient, http, custom, getContract, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
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

  await saveData();
}

// 调用 init 方法
init().catch((error) => {
  console.error('初始化失败:', error);
});

// 初始化数据库
const initDB = async () => {
  const db = await open({
    filename: './db/uniswap.db',
    driver: sqlite3.Database
  });
  // 创建表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS uniswapEvent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount0In TEXT,
      amount0Out TEXT,
      amount1In TEXT,
      amount1Out TEXT,
      formAddress TEXT,
      toAddress TEXT,
      blockTimestamp TEXT,
      blockNumber TEXT,
      eventName TEXT
    )
  `);
  return db;
};

//扫描数据
const saveData = async () => {
  // 查询的区块页数
  const numMax = 5n; //每页1000
  // 获取最新区块号
  var currentBlockNumber = await publicClient.getBlockNumber();
  // decimals
  const decimals = await UniswapContract.read.decimals();
  // console.log(decimals);

  const db = await initDB();
  var blockNumber = currentBlockNumber;

  //扫描区块设置
  while (blockNumber >= currentBlockNumber - 1000n * 100n) {
    let fromBlock = blockNumber - 1000n;
    fromBlock < 0n && (fromBlock = 0n);

    const logs = await publicClient.getContractEvents({
      address: uniswapAddress,
      abi: uniswapAbi,
      eventName: 'Swap',
      fromBlock: fromBlock, // 从创世区块开始
      toBlock: blockNumber, // 到最新区块号
    });

    blockNumber -= 1000n;

    var dbData = logs.map((log: any) => {
      return {
        amount0In: log.args.amount0In ? log.args.amount0In.toString() : "0",
        amount0Out: log.args.amount0Out ? log.args.amount0Out.toString() : "0",
        amount1In: log.args.amount1In ? log.args.amount1In.toString() : "0",
        amount1Out: log.args.amount1Out ? log.args.amount1Out.toString() : "0",
        formAddress: log.args.sender,
        toAddress: log.args.to,
        blockTimestamp: log.blockTimestamp ? parseInt(log.blockTimestamp) : "0",
        blockNumber: log.blockNumber ? log.blockNumber.toString() : "0",
        eventName: log.eventName,
      };
    });

    console.log(dbData);

    // 插入数据到数据库
    const insertQuery = `
      INSERT INTO uniswapEvent (
        amount0In, amount0Out, amount1In, amount1Out,
        formAddress, toAddress, blockTimestamp, blockNumber, eventName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    for (const data of dbData) {
      await db.run(insertQuery, [
        data.amount0In, data.amount0Out, data.amount1In, data.amount1Out,
        data.formAddress, data.toAddress, data.blockTimestamp, data.blockNumber, data.eventName
      ]);
    }
  }

  // 关闭数据库连接
  await db.close();
}