import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Tabs } from 'antd';
import Swap from './swap';
import Liquidity from './liquidity';
// import {} from "./mock.js";

export default function Dex() {
  const [tabsIndex, setTabsIndex] = useState<any>("1");

  const items = [
    {
      key: '1',
      label: 'Swap',
      children: <Swap />,
    },
    {
      key: '2',
      label: 'Liquidity',
      children: <Liquidity />,
    }
  ];

  const onChange = (key: string) => {
    setTabsIndex(key);
  };

  const TabsContent = useMemo(() => {
    return <Tabs activeKey={tabsIndex} items={items} onChange={onChange} />;
  }, [tabsIndex, items])

  return (
    <div className={styles["dex"]}>
      <div className={styles["dex-title"]}>Dex</div>
      <div className={styles["dex-type"]}>
        {TabsContent}
      </div>
    </div>
  );
}