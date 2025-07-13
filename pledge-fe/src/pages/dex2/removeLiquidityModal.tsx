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
import { LiquidityPoolAbi, LiquidityPoolAddress } from "../../contractAbi/LiquidityPoolInfo.js";

export default function LiquidityModal(props: any) {
  const { removeliquidityModalOpen, setRemoveLiquidityModalOpen, removeliquidityModalCallBack } = props;
  const [loading, setLoading] = useState<any>(false);
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [LiquidityPoolContract, setLiquidityPoolContract] = useState<any>("");
  const [Input0, setInput0] = useState<any>("0");
  const [tokenObj, setTokenObj] = useState<any>({});

  useEffect(() => {
    if (removeliquidityModalOpen) {
      setInput0("0");
      setTokenObj({});
      getLiquidityToken();
    }
  }, [removeliquidityModalOpen])

  //获取自己的代币
  const getLiquidityToken = async () => {
    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
    try {
      const [tokenObj] = await Promise.all([
        LiquidityPoolContract.read.getLiquidityToken([account]),
      ])
      console.log(tokenObj);
      setTokenObj(tokenObj);
    } catch (error) {
      console.log(error);
    }
  }


  const handleOk = async () => {
    if (!(await removeLiquidity())) {
      return;
    }
    removeliquidityModalCallBack();
    setRemoveLiquidityModalOpen(false);
  };

  const handleCancel = () => {
    setRemoveLiquidityModalOpen(false);
  };

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    setPublicClient("");
    setwalletClient("");
    setInput0("0");

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

    const LiquidityPoolContract = await getContract({
      address: LiquidityPoolAddress,
      abi: LiquidityPoolAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    })
    await setLiquidityPoolContract(LiquidityPoolContract);
  }

  //添加流动性
  const removeLiquidity = async () => {
    if (Input0 == "0") {
      return false;
    }

    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })

    console.log(BigInt(Input0), account);

    try {
      const hash = await walletClient.writeContract({
        address: LiquidityPoolAddress as `0x${string}`,
        abi: LiquidityPoolAbi,
        functionName: "removeLiquidity",
        args: [BigInt(Input0), account],
      });
      const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Modal
        loading={loading}
        title="Remove Liquidity"
        open={removeliquidityModalOpen}
        onOk={handleOk}
        onCancel={() => {
          handleCancel();
        }}
      >
        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>Input</div>
            <div>Balance: {tokenObj.tokenNum ? tokenObj.tokenNum : 0}</div>
          </div>
          <div className={styles["swap-2-2"]}>
            <div>
              <InputNumber
                style={{ width: 200 }}
                defaultValue="0"
                value={Input0}
                min="0"
                step="1"
                onChange={(e) => {
                  setInput0(e);
                }}
                stringMode
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}