import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther, formatUnits } from 'viem';
import { Modal, Tooltip, Input } from 'antd';
import Image from 'next/image';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';
import ETHImage from './images/ETH.png';
import USDCImage from './images/USDC.png';
import WETHImage from './images/WETH.png';
import {tokenAddresses} from "./mock.js";
import { HandleReadContract, HandleReadContracts } from '@/hooks/handleContract';

export default function TokenListModal(props: any) {
  const { tokenListModalOpen, setTokenListModalOpen, tokenListModalCallBack } = props;
  const [loading, setLoading] = useState<any>(false);
  const [tokenName, setTokenName] = useState<any>("");
  const { address } = useAccount()

  const abi1 = [{
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }];

  const coinList = [
    {
      imgUrl: ETHImage,
      coinName: "ETH",
      amount: "0",
    },
    {
      imgUrl: USDCImage,
      coinName: "USDC",
      amount: "0",
    },
    {
      imgUrl: WETHImage,
      coinName: "WETH",
      amount: "0",
    }
  ]

  // 获取代币余额
  const { data: ethBalance } = useBalance({
    address: address
  });

  const { data: usdcBalance } = useBalance({
    address: address,
    token: tokenAddresses[0] as `0x${string}`, // USDC 合约地址
  })
  
  const { data: wethBalance } = useBalance({
    address: address,
    token: tokenAddresses[1] as `0x${string}`, // WETH 合约地址
  })
  // 获取代币余额

  console.log(ethBalance, usdcBalance, wethBalance);
  coinList[0].amount = ethBalance?.value ? formatUnits(ethBalance?.value, ethBalance?.decimals) : "0";
  coinList[1].amount = usdcBalance?.value ? formatUnits(usdcBalance?.value, usdcBalance?.decimals) : "0";
  coinList[2].amount = wethBalance?.value ? formatUnits(wethBalance?.value, wethBalance?.decimals) : "0";

  const handleOk = () => {
    setTokenListModalOpen(false);
  };

  const handleCancel = () => {
    setTokenListModalOpen(false);
  };



  return (
    <Modal
      loading={loading}
      title="Select a token"
      open={tokenListModalOpen}
      onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
    >
      <div>
        <Input
          placeholder="Token name"
          className={styles["tokenListModal-2-input"]}
          value={tokenName}
          onChange={(e) => {
            setTokenName(e.target.value);
          }}
        />
      </div>

      <div className={styles["tokenListModal-1"]}>
        <div>Token name</div>
        <Tooltip title="Find a token by searching for its name or symbol or by pasting its address below.">
          <div className={styles["tokenListModal-1-icon"] + " poi"}><QuestionCircleOutlined /></div>
        </Tooltip>
      </div>

      <div>
        {coinList.map((item, index) => (
          <div className={styles["tokenListModal-list"]} key={index}>
            <Image
              className={styles["tokenListModal-list-1"] + " mr-[10px]"}
              width={30}
              height={30}
              src={item.imgUrl}
              alt={item.coinName}
            />
            <div className={styles["tokenListModal-list-2"]}>{item.coinName}</div>
            <div className={styles["tokenListModal-list-3"]}>{item.amount}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}