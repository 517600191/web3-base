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
import { WISEAbi, WISEAddress } from "../../contractAbi/WISEInfo.js";

// 定义一个辅助函数，用于将 Unix 时间戳转换为日期时间字符串
const convertTimestampToDate = (timestamp: bigint | number) => {
  // 将时间戳转换为毫秒，因为 JavaScript 的 Date 对象接受毫秒级时间戳
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export default function WISEtranC() {
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [dataList, setDataList] = useState<any>([]);
  const [WISEContract, setWISEContract] = useState<any>(null);

  useEffect(() => {
    init();
  }, [])

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

    const WISEContract = await getContract({
      address: WISEAddress as `0x${string}`,
      abi: WISEAbi,
      client: {
        public: publicClient,
        // wallet: walletClient,
      }
    });
    await setWISEContract(WISEContract);
    console.log(WISEContract);
  }

  const fetchContractTransactions = async () => {
    try {
      let swapListTemp: any = [];
      // 查询的区块页数
      const numMax = 5n; //每页1000
      // 获取最新区块号
      const currentBlockNumber = await publicClient.getBlockNumber();
      const decimals = await WISEContract.read.decimals();
      console.log(decimals);

      for (let i = 1n; i <= numMax; i++) {
        // 查询 Transfer 事件
        const logs = await publicClient.getContractEvents({
          address: WISEAddress,
          abi: WISEAbi,
          eventName: 'Transfer',
          fromBlock: currentBlockNumber - (1000n * i), // 从创世区块开始
          toBlock: currentBlockNumber- (1000n * (i - 1n)), // 到最新区块号
        });

        // console.log(logs);
        swapListTemp = swapListTemp.concat(logs);
      }

      console.log(swapListTemp);

      // 处理日志
      const transactions = swapListTemp.map((log: any) => {
        return {
          args: {
            from: log.args.from,
            to: log.args.to,
            value: formatUnits(log.args.value, 18)
          },
          blockTimestamp: convertTimestampToDate(log.blockTimestamp),
          blockNumber: log.blockNumber,
          eventName: log.eventName,
        };
      });

      setDataList(transactions);
      console.log('所有交易数据:', transactions);
    } catch (error) {
      console.error('获取交易数据失败:', error);
    }
  };

  const tableColumns1 = [
    {
      title: 'blockTimestamp',
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
      title: 'blockNumber',
      dataIndex: 'blockNumber',
      key: 'blockNumber',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{value}</span>
          </>
        )
      }
    },
    {
      title: 'event',
      dataIndex: 'eventName',
      key: 'eventName',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{value}</span>
          </>
        )
      }
    },
    {
      title: 'amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.args.value}</span>
          </>
        )
      }
    },
    {
      title: 'form',
      dataIndex: 'from',
      key: 'form',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.args.from}</span>
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
    // {
    //   title: 'operation',
    //   render: function (value: any, record: any, index: any) {
    //     return (
    //       <Space>
    //         <Button type="primary" onClick={() => {

    //         }}>withdrawNFT</Button>
    //       </Space>
    //     )
    //   }
    // },
  ];

  return (
    <>
      <div className={styles["marketAll-table"]}>
        <Table
          columns={tableColumns1}
          dataSource={dataList}
        />
      </div>
    </>
  );
}