import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Tabs, InputNumber, Button } from 'antd';
import Image from 'next/image';
import TransactionModal from './transactionModal';
import TokenListModal from './tokenListModal';
import {
  SettingOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import ethImage from './images/ETH.png';
import { tokenAddresses } from "./mock.js";
import { PledgeChainLinkAbi, PledgeChainLinkAddress } from "../../contractAbi/PledgeChainLinkInfo.js";
import { USDCAbi, USDCAddress } from "../../contractAbi/USDCInfo.js";
import { PledgePoolAbi, PledgePoolAddress } from "../../contractAbi/PledgePoolInfo.js";

export default function Borrow() {
  const [tabsIndex, setTabsIndex] = useState<any>("1");
  const [seletedToken, setSeletedToken] = useState<any>({
    imgUrl: "",
    coinName: "",
  });
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [ETHUSDArr, setETHUSDArr] = useState<any>([]);

  //modal
  const [transactionModalOpen, setTransactionModalOpen] = useState<any>(false);
  const transactionModalCallBack = () => {

  }

  const [tokenListModalOpen, setTokenListModalOpen] = useState<any>(false);
  const tokenListModalCallBack = () => {

  }
  //modal

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
    await setPublicClient(publicClient);
    console.log(publicClient);

    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
    const walletClient = await createWalletClient({
      account,
      chain: sepolia,
      transport: custom(window.ethereum),
      // transport: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),
    });
    await setwalletClient(walletClient);
    console.log(walletClient, await walletClient.getAddresses())

    setTimeout(function() {
      getChainlinkDataFeedLatestAnswer(publicClient);
    }, 500)
  }

  const onChange = (key: string) => {
    setTabsIndex(key);
  };

  //获取数据 eth-call
  const getChainlinkDataFeedLatestAnswer = async (publicClient: any) => {
    // const contract = await getContract({
    //   address: PledgeChainLinkAddress, abi: PledgeChainLinkAbi, client: {
    //     public: publicClient
    //   }
    // })

    // try {
    //   const [balance] = await Promise.all([
    //     contract!.read.getChainlinkDataFeedLatestAnswer(["ETH / USD"]),
    //   ])
    //   console.log(balance);
    //   setETHUSDArr(balance);
    // } catch (error) {
    //   console.log(error);
    // }
  }

  // 转账函数
async function Borrow() {
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
    address: PledgePoolAddress[0] as `0x${string}`,
    abi: PledgePoolAbi,
    client: {
        public: publicClient,
        wallet: walletClient,
    }
  });

  let num1: any = 10n ** 18n * 1n / ETHUSDArr[0];
  let numfee: any = num1 * 3n / 100n; // 3% fee
  let amount: any = num1 * 5n ; // 500% radio: 20%
  console.log(num1, numfee, amount);

  try {
    // 调用USDC合约的transfer函数
    const hash = await walletClient.writeContract({
      address: PledgePoolAddress as `0x${string}`,
      abi: PledgePoolAbi,
      functionName: "addFee",
      value: amount + numfee, // 20%
    });

    await walletClient.writeContract({
      address: PledgePoolAddress as `0x${string}`,
      abi: PledgePoolAbi,
      functionName: "transferUSDC",
      args: [(await walletClient.getAddresses())[0], 1],
    });
  } catch (error) {
    console.error('Error transferring USDC:', error);
  }
}

  return (
    <>
      <div className={styles["swap"]}>
        <div className={styles["swap-1"] + " text-[20px]"}>
          <div>Borrow</div>
        </div>

        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>From</div>
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
              setTokenListModalOpen(true);
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
              setTokenListModalOpen(true);
            }}>Select a Token</Button>}
          </div>
        </div>

        <div className={styles["swap-arrow"]}>
          <ArrowDownOutlined />
        </div>

        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>to</div>
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
              setTokenListModalOpen(true);
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
              setTokenListModalOpen(true);
            }}>Select a Token</Button>}
          </div>
        </div>

        <div className={styles["swap-3"] + " text-[16px] mt-[10px]"}>
          <div>radio</div>
          <div>500%</div>
        </div>

        <Button type="primary" className={"common-button-1"} onClick={() => {
          Borrow();
        }}>Borrow</Button>
      </div>

      <TransactionModal
        transactionModalOpen={transactionModalOpen}
        setTransactionModalOpen={setTransactionModalOpen}
        transactionModalCallBack={transactionModalCallBack}
      />

      <TokenListModal
        tokenListModalOpen={tokenListModalOpen}
        setTokenListModalOpen={setTokenListModalOpen}
        tokenListModalCallBack={tokenListModalCallBack}
      />
    </>
  );
}