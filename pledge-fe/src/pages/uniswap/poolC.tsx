import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { mainnet } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Button, Table } from 'antd';
import {
} from '@ant-design/icons';
import axios from 'axios';

export default function PoolC() {
  const [tokenList, setTokenList] = useState<any>([]);

  useEffect(() => {
    getTokenList();
  }, [])

  const getTokenList = () => {
    axios.get('https://interface.gateway.uniswap.org/v2/uniswap.explore.v1.ExploreStatsService/ExploreStats', {
      params: {
        connect: "v1",
        encoding: "json",
        message: JSON.stringify({ "chainId": "ALL_NETWORKS" }),
      }
    }).then((res) => {
      console.log(res);
      setTokenList(res.data.stats.poolStats);
    })
  }

  const tableColumns1 = [
    {
      title: '资金池',
      dataIndex: 'poolName',
      key: 'poolName',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.token0.symbol}</span>/<span>{record.token1.symbol}</span>
          </>
        )
      }
    },
    {
      title: '协议',
      dataIndex: 'price',
      key: 'price',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.protocolVersion}</span>
          </>
        )
      }
    },
    {
      title: '费用等级',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>-</span>
          </>
        )
      }
    },
    {
      title: 'TVL',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.totalLiquidity.value}</span>
          </>
        )
      }
    },
    {
      title: '资金池年利率',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>-</span>
          </>
        )
      }
    },
    {
      title: 'APR',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>-</span>
          </>
        )
      }
    },
    {
      title: '1天交易量',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>${record.volume1Day?.value}</span>
          </>
        )
      }
    },
    {
      title: '30天交易量',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>${record.volume30Day?.value}</span>
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
          rowKey="poolId"
        />
      </div>
    </>
  );
}