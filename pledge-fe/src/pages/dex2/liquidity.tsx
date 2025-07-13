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
import RemoveLiquidityModal from './removeLiquidityModal';
import { LiquidityPoolAbi, LiquidityPoolAddress } from "../../contractAbi/LiquidityPoolInfo.js";
// import {} from "./mock.js";

export default function Liquidity() {
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [LiquidityPoolContract, setLiquidityPoolContract] = useState<any>("");
  const [ContractBase, setContractBase] = useState<any>("");
  const [tokenList, setTokenList] = useState<any>([])

  //modal
  const [liquidityModalOpen, setLiquidityModalOpen] = useState<any>(false);
  const liquidityModalCallBack = () => {
    getLiquidityToken(LiquidityPoolContract);
  }

  const [removeliquidityModalOpen, setRemoveLiquidityModalOpen] = useState<any>(false);
  const removeliquidityModalCallBack = () => {
    getLiquidityToken(LiquidityPoolContract);
  }
  //modal

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
    const currentChainId = await window.ethereum!.request({ method: 'eth_chainId' });
    console.log(currentChainId);

    // 创建一个连接到以太坊主网的公共客户端
    const publicClient = createPublicClient({
      batch: {
        multicall: true,
      },
      chain: sepolia,
      transport: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),
    });
    await setPublicClient(publicClient);
    console.log(publicClient);

    const walletClient = await createWalletClient({
      account,
      chain: sepolia,
      transport: custom(window.ethereum),
    });
    await setwalletClient(walletClient);
    console.log(walletClient, await walletClient.getAddresses())

    const LiquidityPoolContract = await getContract({
      address: LiquidityPoolAddress,
      abi: LiquidityPoolAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    })
    await setLiquidityPoolContract(LiquidityPoolContract);

    getContractBase(LiquidityPoolContract);
    getLiquidityToken(LiquidityPoolContract);
  }

  //获取合约基本数据
  const getContractBase = async (LiquidityPoolContract?: any) => {
    try {
      const [baseInfo] = await Promise.all([
        LiquidityPoolContract.read.getContractBase(),
      ])
      console.log(baseInfo);

      baseInfo.fee = Number(baseInfo.fee);
      baseInfo.FEE_DENOMINATOR = Number(baseInfo.FEE_DENOMINATOR);
      baseInfo.ratio0To1 = Number(baseInfo.ratio0To1);
      baseInfo.ratio1To0 = Number(baseInfo.ratio1To0);
      baseInfo.actualRatio0To1 = baseInfo.ratio0To1 == 0 ? 0 : baseInfo.ratio1To0 / 1e18;
      baseInfo.actualRatio1To0 = baseInfo.ratio1To0 == 0 ? 0 : baseInfo.ratio0To1 / 1e18;
      setContractBase(baseInfo);
    } catch (error) {
      console.log(error);
    }
  }

  //获取自己的代币
  const getLiquidityToken = async (LiquidityPoolContract?: any) => {
    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
    try {
      const [liquidityToken] = await Promise.all([
        LiquidityPoolContract.read.getLiquidityToken([account]),
      ])
      console.log(liquidityToken);
      setTokenList([liquidityToken].map((item: any) => {
        return {
          tokenName: item.tokenName,
          tokenNum: item.tokenNum,
        }
      }));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className={styles["liquidity"]}>
        <div className={styles["liquidity-1"] + " text-[20px]"}>
          <div>Your Liquidity</div>
          <Button type="primary" onClick={() => {
            setLiquidityModalOpen(true);
          }}>Add Liquidity</Button>
          <Button type="primary" onClick={() => {
            setRemoveLiquidityModalOpen(true);
          }}>Remove Liquidity</Button>
        </div>

        <div>
          {tokenList.map((item: any, index: any) => (
            <div className={styles["liquidity-list"]} key={index}>
              <div className={styles["liquidity-list-2"]}>{item.tokenName}</div>
              <div className={styles["liquidity-list-3"]}>{item.tokenNum}</div>
            </div>
          ))}
        </div>
      </div>

      <LiquidityModal
        liquidityModalOpen={liquidityModalOpen}
        setLiquidityModalOpen={setLiquidityModalOpen}
        liquidityModalCallBack={liquidityModalCallBack}
      />

      <RemoveLiquidityModal
        removeliquidityModalOpen={removeliquidityModalOpen}
        setRemoveLiquidityModalOpen={setRemoveLiquidityModalOpen}
        removeliquidityModalCallBack={removeliquidityModalCallBack}
      />
    </>
  );
}