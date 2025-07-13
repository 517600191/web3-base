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
import { WETHAbi, WETHAddress } from "../../contractAbi/WETHInfo.js";
import { USDCAbi, USDCAddress } from "../../contractAbi/USDCInfo.js";
import { LiquidityPoolAbi, LiquidityPoolAddress } from "../../contractAbi/LiquidityPoolInfo.js";
import TokenListModal from './tokenListModal';

export default function LiquidityModal(props: any) {
  const { liquidityModalOpen, setLiquidityModalOpen, liquidityModalCallBack } = props;
  const [loading, setLoading] = useState<any>(false);
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [Input0, setInput0] = useState<any>("0.0000");
  const [Input1, setInput1] = useState<any>("0.0000");
  const [InputData0, setInputData0] = useState<any>({});
  const [InputData1, setInputData1] = useState<any>({});

  //modal
  const [tokenListModalOpen, setTokenListModalOpen] = useState<any>(false);
  const [tokenListModalData, setTokenListModalData] = useState<any>({});
  const tokenListModalCallBack = (data: any) => {
    console.log(data);
    if (data.type == "Input0") {
      setInputData0(data.data);
    } else {
      setInputData1(data.data);
    }
  }
  //modal

  const handleOk = async () => {
    if (!(await addLiquidity())) {
      return;
    }
    liquidityModalCallBack();
    setLiquidityModalOpen(false);
  };

  const handleCancel = () => {
    setLiquidityModalOpen(false);
  };

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    setPublicClient("");
    setwalletClient("");
    setInput0("0.0000");
    setInput1("0.0000");
    setInputData0({});
    setInputData1({});
    setTokenListModalOpen(false);
    setTokenListModalData({});

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

  //添加流动性
  const addLiquidity = async () => {
    if (!InputData0.tokenName || !InputData1.tokenName) {
      return false;
    }

    if (InputData0.tokenName == InputData1.tokenName) {
      return false;
    }

    if (!InputData0.decimals || !InputData1.decimals) {
      return false;
    }

    let Input0Num = parseFloat(Input0) * 10 ** Number(InputData0.decimals);
    let Input1Num = parseFloat(Input1) * 10 ** Number(InputData1.decimals);

    if (Input0Num == 0 || Input0Num == 0) {
      return false;
    }

    let Input0NumTemp, Input1NumTemp;
    if (InputData0.tokenName === "WETH" && InputData1.tokenName === "USDC") {
      Input0NumTemp = Input0Num;
      Input1NumTemp = Input1Num;
    } else if (InputData0.tokenName === "USDC" && InputData1.tokenName === "WETH") {
      Input0NumTemp = Input1Num;
      Input1NumTemp = Input0Num;
    } else {
      return false;
    }

    console.log(Input0NumTemp, Input1NumTemp);

    try {
      const hash1 = await walletClient.writeContract({
        address: WETHAddress as `0x${string}`,
        abi: WETHAbi,
        functionName: "approve",
        args: [LiquidityPoolAddress as `0x${string}`, BigInt(Input0NumTemp)],
      });
      const transactio1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });

      const hash2 = await walletClient.writeContract({
        address: USDCAddress as `0x${string}`,
        abi: USDCAbi,
        functionName: "approve",
        args: [LiquidityPoolAddress as `0x${string}`, BigInt(Input1NumTemp)],
      });
      const transactio2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const hash3 = await walletClient.writeContract({
        address: LiquidityPoolAddress as `0x${string}`,
        abi: LiquidityPoolAbi,
        functionName: "addLiquidity",
        args: [BigInt(Input0NumTemp), BigInt(Input1NumTemp)],
      });
      const transactio3 = await publicClient.waitForTransactionReceipt({ hash: hash3 });

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
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
            <div>Balance: {InputData0.amount ? InputData0.amount : 0}</div>
          </div>
          <div className={styles["swap-2-2"]}>
            <div>
              <InputNumber
                style={{ width: 200 }}
                defaultValue="0.0000"
                value={Input0}
                min="0"
                max="10000"
                step="0.0001"
                onChange={(e) => {
                  setInput0(e);
                }}
                stringMode
              />
            </div>
            {InputData0.tokenName ? <div onClick={() => {
              setTokenListModalOpen(true);
            }}>
              <div className={styles["swap-2-2-coin"]}>
                <Image
                  className={"mr-[10px]"}
                  width={30}
                  height={30}
                  src={InputData0.imgUrl}
                  alt={InputData0.tokenName}
                />
                <div>{InputData0.tokenName}</div>
              </div>
            </div> : <Button type="primary" onClick={() => {
              setTokenListModalData({
                type: "Input0",
              })
              setTokenListModalOpen(true);
            }}>Select a Token</Button>}
          </div>
        </div>

        <div className={styles["swap-arrow"]}>
          <PlusOutlined />
        </div>

        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>Input</div>
            <div>Balance: {InputData1.amount ? InputData1.amount : 0}</div>
          </div>
          <div className={styles["swap-2-2"]}>
            <div>
              <InputNumber
                style={{ width: 200 }}
                defaultValue="0.0000"
                value={Input1}
                min="0"
                max="10000"
                step="0.0001"
                onChange={(e) => {
                  setInput1(e);
                }}
                stringMode
              />
            </div>
            {InputData1.tokenName ? <div onClick={() => {
              setTokenListModalOpen(true);
            }}>
              <div className={styles["swap-2-2-coin"]}>
                <Image
                  className={"mr-[10px]"}
                  width={30}
                  height={30}
                  src={InputData1.imgUrl}
                  alt={InputData1.tokenName}
                />
                <div>{InputData1.tokenName}</div>
              </div>
            </div> : <Button type="primary" onClick={() => {
              setTokenListModalData({
                type: "Input1",
              })
              setTokenListModalOpen(true);
            }}>Select a Token</Button>}
          </div>
        </div>
      </Modal>

      <TokenListModal
        tokenListModalOpen={tokenListModalOpen}
        setTokenListModalOpen={setTokenListModalOpen}
        tokenListModalCallBack={tokenListModalCallBack}
        tokenListModalData={tokenListModalData}
      />
    </>
  );
}