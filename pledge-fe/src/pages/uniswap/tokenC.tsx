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

export default function TokenC() {
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
      setTokenList(res.data.stats.tokenStats);
    })
  }

  const tableColumns1 = [
    {
      title: '代币名称',
      dataIndex: 'name',
      key: 'name',
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.name}</span><span>({record.symbol})</span>
          </>
        )
      }
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{record.price?.currency}$ </span><span>({(record.price?.value).toFixed(2)})</span>
          </>
        )
      }
    },
    {
      title: '1小时',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{(record.pricePercentChange1Hour?.value)}%</span>
          </>
        )
      }
    },
    {
      title: '1天',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>{(record.pricePercentChange1Day?.value)}%</span>
          </>
        )
      }
    },
    {
      title: 'FDV',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <>
            <span>${record.fullyDilutedValuation?.value}</span>
          </>
        )
      }
    },
    {
      title: '交易量(1天)',
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
          dataSource={tokenList}
          rowKey="tokenId"
        />
      </div>
    </>
  );
}