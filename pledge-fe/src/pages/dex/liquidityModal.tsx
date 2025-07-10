import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Modal, Tooltip, Input, InputNumber, Button } from 'antd';
import Image from 'next/image';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { tokenAddresses } from "./mock.js";
import { USDCAbi, USDCAddress } from "../../contractAbi/USDCInfo.js";
import { PledgePoolAbi, PledgePoolAddress } from "../../contractAbi/PledgePoolInfo.js";

export default function LiquidityModal(props: any) {
  const { liquidityModalOpen, setLiquidityModalOpen, liquidityModalCallBack } = props;
  const [loading, setLoading] = useState<any>(false);
  const [seletedToken, setSeletedToken] = useState<any>({
    imgUrl: "",
    coinName: "",
  });
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");

  const handleOk = () => {
    // AddLiquidity();
    // setLiquidityModalOpen(false);
  };

  const handleCancel = () => {
    setLiquidityModalOpen(false);
  };

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    // 创建一个连接到以太坊主网的公共客户端 eth-call
    const publicClient = createPublicClient({
      batch: {
        multicall: true,
      },
      chain: sepolia,
      transport: http(),
    });
    setPublicClient(publicClient);
    console.log(publicClient);

    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
    const walletClient = await createWalletClient({
      account,
      chain: sepolia,
      transport: custom(window.ethereum),
      // transport: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),
    });
    setwalletClient(walletClient);
  }

  // 转账函数
  const AddLiquidity = async (coin1: BigInt, coin2: BigInt) => {
    // 获取USDC合约实例
    const usdcContract = await getContract({
      address: tokenAddresses[0] as `0x${string}`,
      abi: USDCAbi,
      client: {
          public: publicClient,
          wallet: walletClient,
      }
    });

    const PledgePoolContract = await getContract({
      address: PledgePoolAddress as `0x${string}`,
      abi: PledgePoolAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    });

    try {
      // @ts-ignore
      await usdcContract.write.transfer([PledgePoolAddress as `0x${string}`, 1000000])
      const hash = await walletClient.writeContract({
        address: PledgePoolAddress as `0x${string}`,
        abi: PledgePoolAbi,
        functionName: "addLiquidity",
        value: 1000000, // 发送 0.1 ETH
      });

      // await PledgePoolContract.read.addLiquidity().send({
      //   from: walletClient.address, // 发送者的地址
      //   value: 1000000n, // 发送的 ETH 数量（以 wei 为单位）
      //   gas: '2000000', // 可选：设置 gas 限制
      // });
    } catch (error) {
      console.error('Error transferring USDC:', error);
    }
  }

  return (
    <Modal
      loading={loading}
      title="Add Liquidity"
      open={liquidityModalOpen}
      onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
    >
      <div className={styles["swap-2"]}>
        <div className={styles["swap-2-1"]}>
          <div>Input</div>
          <div>Balance: 0</div>
        </div>
        <div className={styles["swap-2-2"]}>
          <div>
            <InputNumber
              style={{ width: 200 }}
              defaultValue="0.0000"
              min="0"
              max="10000"
              step="0.0001"
              onChange={() => {

              }}
              stringMode
            />
          </div>
          {seletedToken.coinName ? <div onClick={() => {
            setLiquidityModalOpen(true);
          }}>
            <div className={styles["swap-2-2-coin"]}>
              <Image
                className={"mr-[10px]"}
                width={30}
                height={30}
                src={seletedToken.imgUrl}
                alt={seletedToken.coinName}
              />
              <div>{seletedToken.coinName}</div>
            </div>
          </div> : <Button type="primary" onClick={() => {
            setLiquidityModalOpen(true);
          }}>Select a Token</Button>}
        </div>
      </div>

      <div className={styles["swap-arrow"]}>
        <PlusOutlined />
      </div>

      <div className={styles["swap-2"]}>
        <div className={styles["swap-2-1"]}>
          <div>Input</div>
          <div>Balance: 0</div>
        </div>
        <div className={styles["swap-2-2"]}>
          <div>
            <InputNumber
              style={{ width: 200 }}
              defaultValue="0.0000"
              min="0"
              max="10000"
              step="0.0001"
              onChange={() => {

              }}
              stringMode
            />
          </div>
          {seletedToken.coinName ? <div onClick={() => {
            setLiquidityModalOpen(true);
          }}>
            <div className={styles["swap-2-2-coin"]}>
              <Image
                className={"mr-[10px]"}
                width={30}
                height={30}
                src={seletedToken.imgUrl}
                alt={seletedToken.coinName}
              />
              <div>{seletedToken.coinName}</div>
            </div>
          </div> : <Button type="primary" onClick={() => {
            setLiquidityModalOpen(true);
          }}>Select a Token</Button>}
        </div>
      </div>
    </Modal>
  );
}