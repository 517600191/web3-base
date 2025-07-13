import { ConnectButton } from '@rainbow-me/rainbowkit';
import * as React from 'react';
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import styles from './index.module.scss';
import { useRouter } from 'next/router';

export default function Header(props: any) {
  const router = useRouter();
  // console.log(props);
  const [tabsIndex, setTabsIndex] = useState<any>(0);
  const [routerObj, setRouterObj] = useState<any>({
    0: "/", 
    1: "/market",
    2: "/lend",
    3: "/borrow",
    4: "/dex",
    5: "/nftMarket",
    6: "/nft",
    7: "/uniswap",
    8: "/dex2",
  });

  // 预取所有路由
  useEffect(() => {
    Object.values(routerObj).forEach((path: any) => {
      router.prefetch(path);
    });
  }, [routerObj]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabsIndex(newValue);
    router.push(routerObj[newValue]);
  };

  return (
    <div className={styles["header"]}>
      <div className={styles["header-name"]}>
        Pledge
      </div>
      <div className={styles["header-tabs"]}>
        <Tabs value={tabsIndex} onChange={handleChange} variant="scrollable">
          <Tab label="Home" value={0} />
          <Tab label="Market" value={1} />
          <Tab label="Lend" value={2} />
          <Tab label="Borrow" value={3} />
          <Tab label="Dex" value={4} />
          <Tab label="NFTMARKET" value={5} />
          <Tab label="NFT" value={6} />
          <Tab label="UNISWAP" value={7} />
          <Tab label="Dex2" value={8} />
        </Tabs>
      </div>
      <div className={styles["header-wallet"]}>
        <ConnectButton />
      </div>
    </div>
  );
}