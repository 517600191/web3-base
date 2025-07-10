import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Tabs, InputNumber, Button } from 'antd';
import Image from 'next/image';
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

export default function Lend() {
  const { writeContractAsync } = useWriteContract();
  const [tabsIndex, setTabsIndex] = useState<any>("1");
  const [seletedToken, setSeletedToken] = useState<any>({
    imgUrl: "",
    coinName: "",
  });
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [ETHUSDArr, setETHUSDArr] = useState<any>([]);

  //modal
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
  async function Lend() {
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

    let num1: any = 10n ** 18n * 10n / ETHUSDArr[0];
    let numfee: any = num1 * 2n / 100n;
    console.log(num1, numfee);

    try {
      // 调用USDC合约的transfer函数
      // @ts-ignore
      await usdcContract?.write.transfer([PledgePoolAddress, 10])

      const hash = await walletClient.writeContract({
        address: PledgePoolAddress as `0x${string}`,
        abi: PledgePoolAbi,
        functionName: "addFee",
        value: numfee, // fee 2%
      });
    } catch (error) {
      console.error('Error transferring USDC:', error);
    }
  }

  //获取数据 eth-call
  const getChainlinkDataFeedLatestAnswer = async () => {
    // const contract = await getContract({
    //   address: PledgeChainLinkAddress, abi: PledgeChainLinkAbi, client: {
    //     public: publicClient
    //   }
    // })

    // try {
    //   const [balance] = await Promise.all([
    //     contract.read.getChainlinkDataFeedLatestAnswer(["ETH / USD"]),
    //   ])
    //   console.log(balance);
    //   setETHUSDArr(balance);
    // } catch (error) {
    //   console.log(error);
  }

  const onChange = (key: string) => {
    setTabsIndex(key);
  };

  // const data = useReadContract({
  //   abi: PledgeChainLinkAbi,
  //   address: PledgeChainLinkAddress,
  //   functionName: "getChainlinkDataFeedLatestAnswer",
  //   args: [
  //     "ETH / USD",
  //   ],
  // })

  // console.log(data, 112222);

  // 设置价格对
  const setPriceFeed = async () => {
    // if (!checkLogin()) {
    //   return;
    // }

    // if (!stakeETH) {
    //   setToastMessage({
    //     open: true,
    //     message: "请输入ETH数量",
    //     type: "error",
    //   })
    //   return;
    // }

    // if (parseFloat(hasETH.data?.formatted2) < parseFloat(stakeETH)) {
    //   setToastMessage({
    //     open: true,
    //     message: "余额不足",
    //     type: "error",
    //   })
    //   return;
    // }

    // setLoading(true);

    try {
      const hash = await writeContractAsync({
        abi: PledgeChainLinkAbi,
        address: PledgeChainLinkAddress,
        functionName: 'setPriceETHFeed',
        args: [
          "ETH / USD",
          "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        ],
        // value: parseEther(stakeETH),
      })
      // setHash(hash);
      // setStakeETH("");
      // setLoading(false);
      // setToastMessage({
      //   open: true,
      //   message: "交易成功",
      //   type: "success",
      // })
    } catch (error) {
      console.log(error);
      // setLoading(false);
      // setToastMessage({
      //   open: true,
      //   message: "交易失败",
      //   type: "error",
      // })
    }
  }

  return (
    <>
      <div className={styles["swap"]}>
        <div className={styles["swap-1"] + " text-[20px]"}>
          <div>Lend (2% fee)</div>
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

        <Button type="primary" className={"common-button-1"} onClick={() => {
          Lend();
        }}>Lend</Button>

        <Button type="primary" className={"common-button-1"} onClick={() => {
          setPriceFeed();
        }}>setPriceFeed</Button>

        <Button type="primary" className={"common-button-1"} onClick={() => {
          getChainlinkDataFeedLatestAnswer();
        }}>getChainlinkDataFeedLatestAnswer</Button>
      </div>

      <TokenListModal
        tokenListModalOpen={tokenListModalOpen}
        setTokenListModalOpen={setTokenListModalOpen}
        tokenListModalCallBack={tokenListModalCallBack}
      />
    </>
  );
}