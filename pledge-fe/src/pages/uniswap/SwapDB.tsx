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
import axios from 'axios';

// 定义一个辅助函数，用于将 Unix 时间戳转换为日期时间字符串
const convertTimestampToDate = (timestamp: bigint | number) => {
  // 将时间戳转换为毫秒，因为 JavaScript 的 Date 对象接受毫秒级时间戳
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export default function SwapDB() {
  const [dataList, setDataList] = useState<any>([]);

  useEffect(() => {
    getSwapData();
  }, [])

  const getSwapData = async () => {
    axios.get('http://localhost:9000/getSwapData', {
      params: {
        
      }
    }).then((res) => {
      console.log(res);
      setDataList(res.data.map((item: any) => {
        item.blockTimestamp2 = convertTimestampToDate(item.blockTimestamp);
        item.amount0In = (Number(formatUnits(item.amount0In, 18))).toFixed(4);
        item.amount0Out = (Number(formatUnits(item.amount0Out, 18))).toFixed(4);
        item.amount1In = (Number(formatUnits(item.amount1In, 18))).toFixed(4);
        item.amount1Out = (Number(formatUnits(item.amount1Out, 18))).toFixed(4);
        return item;
      }));
    })
  }

  const tableColumns1 = [
    {
      title: 'blockTimestamp',
      dataIndex: 'blockTimestamp2',
      key: 'blockTimestamp2',
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
      title: 'WISH',
      dataIndex: 'WISH',
      key: 'WISH',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.amount0In == 0 ? "-" + record.amount0Out : "+" + record.amount0In}</span>
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
            <span>{record.amount1Out == 0 ? "+" + record.amount1In : "-" + record.amount1Out}</span>
          </>
        )
      }
    },
    {
      title: 'formAddress',
      dataIndex: 'formAddress',
      key: 'formAddress',
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
      title: 'toAddress',
      dataIndex: 'toAddress',
      key: 'toAddress',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{value}</span>
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