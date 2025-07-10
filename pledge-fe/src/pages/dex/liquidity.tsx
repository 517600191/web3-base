import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Tabs, Button } from 'antd';
import Image from 'next/image';
import LiquidityModal from './liquidityModal';
// import {} from "./mock.js";

export default function Liquidity() {
  const [tabsIndex, setTabsIndex] = useState<any>("1");

  const coinList = [
    {
      coinName: "ETH/BTC",
      amount: "100/1000",
    },
    {
      coinName: "ETH/USDC",
      amount: "200/2000",
    },
    {
      coinName: "BTC/USDC",
      amount: "300/3000",
    },
  ]

  //modal
  const [liquidityModalOpen, setLiquidityModalOpen] = useState<any>(false);
  const liquidityModalCallBack = () => {

  }
  //modal

  return (
    <>
      <div className={styles["liquidity"]}>
        <div className={styles["liquidity-1"] + " text-[20px]"}>
          <div>Your Liquidity</div>
          <Button type="primary" onClick={() => {
            setLiquidityModalOpen(true);
          }}>Add Liquidity</Button>
        </div>

        <div>
          {coinList.map((item, index) => (
            <div className={styles["liquidity-list"]} key={index}>
              <div className={styles["liquidity-list-2"]}>{item.coinName}</div>
              <div className={styles["liquidity-list-3"]}>{item.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <LiquidityModal
        liquidityModalOpen={liquidityModalOpen}
        setLiquidityModalOpen={setLiquidityModalOpen}
        liquidityModalCallBack={liquidityModalCallBack}
      />
    </>
  );
}