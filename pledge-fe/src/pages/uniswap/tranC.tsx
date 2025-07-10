import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { mainnet } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther, formatUnits } from 'viem';
import { Button, Table } from 'antd';
import {
} from '@ant-design/icons';
import { uniswapAbi, uniswapAddress } from "../../contractAbi/UniswapInfo.js";

// 定义一个辅助函数，用于将 Unix 时间戳转换为日期时间字符串
const convertTimestampToDate = (timestamp: bigint | number) => {
  // 将时间戳转换为毫秒，因为 JavaScript 的 Date 对象接受毫秒级时间戳
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export default function TranC() {
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [tokenList, setTokenList] = useState<any>([]);
  const [UniswapContract, setUniswapContract] = useState<any>(null);

  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    if (publicClient && UniswapContract) {
      console.log(1111);
      const unwatch = publicClient.watchContractEvent({
        address: uniswapAddress,
        abi: uniswapAbi,
        eventName: 'Swap',
        onLogs: (logs: any) => {
          console.log("Swap", logs);
        },
        onError: (error: any) => console.log(error),
        pollingInterval: 1_000,
      })

      // 组件卸载时停止监听
      return () => unwatch();
    }
  }, [publicClient, UniswapContract]);

  useEffect(() => {
    if (publicClient) {
      fetchContractTransactions();
    }
  }, [publicClient])

  const init = async () => {
    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })

    // 创建一个连接到以太坊主网的公共客户端 eth-call
    const publicClient = createPublicClient({
      batch: {
        multicall: true,
      },
      chain: mainnet,
      transport: http(),
    });
    await setPublicClient(publicClient);
    console.log(publicClient);


    // const walletClient = await createWalletClient({
    //   account,
    //   chain: mainnet,
    //   transport: custom(window.ethereum),
    //   // transport: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),
    // });
    // await setwalletClient(walletClient);
    // console.log(walletClient, (await walletClient.getAddresses())[0]);

    const UniswapContract = await getContract({
      address: uniswapAddress as `0x${string}`,
      abi: uniswapAbi,
      client: {
        public: publicClient,
        // wallet: walletClient,
      }
    });
    await setUniswapContract(UniswapContract);
    console.log(UniswapContract);
  }

  const fetchContractTransactions = async () => {
    try {
      let swapListTemp: any = [];
      // 查询的区块页数
      const numMax = 10n; //每页1000
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
          blockNumber: log.blockNumber,
          eventName: log.eventName,
          type: log.args.amount0In == 0n ? "SELL WISH" : "BUY WISH",
        };
      });

      setTokenList(transactions);
      console.log('所有交易数据:', transactions);
    } catch (error) {
      console.error('获取交易数据失败:', error);
    }
  };

  const tableColumns1 = [
    {
      title: '时间',
      dataIndex: 'blockTimestamp',
      key: 'blockTimestamp',
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{value}</span>
          </>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{value}</span>
          </>
        )
      }
    },
    {
      title: 'WISH',
      dataIndex: 'WISH',
      key: 'WISH',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.type == "SELL WISH" ? "-" + record.args.amount0Out : "+" + record.args.amount0In}</span>
          </>
        )
      }
    },
    {
      title: 'ETH',
      dataIndex: 'ETH',
      key: 'ETH',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.type == "SELL WISH" ? "+" + record.args.amount1In : "-" + record.args.amount1Out}</span>
          </>
        )
      }
    },
    {
      title: 'form',
      dataIndex: 'sender',
      key: 'sender',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.args.sender}</span>
          </>
        )
      }
    },
    {
      title: 'to',
      dataIndex: 'to',
      key: 'to',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.args.to}</span>
          </>
        )
      }
    },
  ];

  return (
    <>
      <div className={styles["marketAll-table"]}>
        <Table
          columns={tableColumns1}
          dataSource={tokenList}
        />
      </div>
    </>
  );
}