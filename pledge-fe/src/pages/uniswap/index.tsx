import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { mainnet } from 'viem/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Button, Space, message, Modal, Popconfirm, Tabs } from 'antd';
import TokenC from './tokenC';
import PoolC from './poolC';
import TranC from './tranC';
import WISEtranC from './WISEtranC';
import SwapDB from './SwapDB';

export default function UniswapDemo() {
  const [messageApi, contextHolder] = message.useMessage();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [UniswapContract, setUniswapContract] = useState<any>(null);
  const [tableData1, setTableData1] = useState<any>([]); // swap
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
  const [tabsIndex, setTabsIndex] = useState<any>("1");

  const items = [
    {
      key: '1',
      label: '代币',
      children: <TokenC />,
    },
    {
      key: '2',
      label: '资金池',
      children: <PoolC />,
    },
    {
      key: '3',
      label: 'WISE/ETH',
      children: <TranC />,
    },
    {
      key: '4',
      label: 'WISE交易',
      children: <WISEtranC />,
    },
    {
      key: '5',
      label: 'WISE/ETH DB',
      children: <SwapDB />,
    },
  ];

  const onChange = (key: string) => {
    setTabsIndex(key);
  };

  const TabsContent = useMemo(() => {
    return <Tabs activeKey={tabsIndex} items={items} onChange={onChange} />;
  }, [tabsIndex, items])

  return (
    <div className={styles["marketAll"]}>
      {/* <Space>
        <Button type="primary" onClick={() => { refreshPage() }}>refreshPage</Button>
      </Space> */}
      {TabsContent}
      {contextHolder}
    </div>
  );
}