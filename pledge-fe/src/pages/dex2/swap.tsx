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
import { WETHAbi, WETHAddress } from "../../contractAbi/WETHInfo.js";
import { USDCAbi, USDCAddress } from "../../contractAbi/USDCInfo.js";
import { LiquidityPoolAbi, LiquidityPoolAddress } from "../../contractAbi/LiquidityPoolInfo.js";

export default function Swap() {
  const [seletedToken, setSeletedToken] = useState<any>({
    imgUrl: "",
    coinName: "",
  });
  const [publicClient, setPublicClient] = useState<any>("");
  const [walletClient, setwalletClient] = useState<any>("");
  const [LiquidityPoolContract, setLiquidityPoolContract] = useState<any>("");
  const [ContractBase, setContractBase] = useState<any>("");
  const [Input0, setInput0] = useState<any>("0.0000");
  const [Input1, setInput1] = useState<any>("0.0000");
  const [InputData0, setInputData0] = useState<any>({});
  const [InputData1, setInputData1] = useState<any>({});

  //modal
  const [transactionModalOpen, setTransactionModalOpen] = useState<any>(false);
  const transactionModalCallBack = async (data: any) => {
    if (!LiquidityPoolContract || !ContractBase || !ContractBase.FEE_DENOMINATOR) {
      console.error('合约基本信息未初始化');
      return;
    }

    try {
      const newFeeValue = data.newFee / 100 * ContractBase.FEE_DENOMINATOR;

      if (newFeeValue < 0 || newFeeValue > ContractBase.FEE_DENOMINATOR) {
        console.error('新的手续费值超出允许范围');
        return;
      }

      const hash = await LiquidityPoolContract.write.setFee([newFeeValue]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      getContractBase(LiquidityPoolContract);
    } catch (error) {
      console.log(error);
    }
  }

  const [tokenListModalOpen, setTokenListModalOpen] = useState<any>(false);
  const [tokenListModalData, setTokenListModalData] = useState<any>({});
  const tokenListModalCallBack = (data: any) => {
    console.log(data);
    if (data.type == "Input0") {
      setInputData0(data.data);
    } else {
      setInputData1(data.data);
    }
    // calculateInput();
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
      baseInfo.reserve0 = Number(baseInfo.reserve0);
      baseInfo.reserve1 = Number(baseInfo.reserve1);
      setContractBase(baseInfo);
    } catch (error) {
      console.log(error);
    }
  }

  const init2 = async() => {
    setInput0("0.0000");
    setInput1("0.0000");
    setInputData0({});
    setInputData1({});
    getContractBase(LiquidityPoolContract);
  }

  // 转账函数
  const swap = async () => {
    if (InputData0.tokenName == InputData1.tokenName) {
      return;
    }

    if (!InputData0.decimals || !InputData1.decimals) {
      return;
    }

    try {
      if (!LiquidityPoolContract || !Input0 || !Input1) {
        console.error('合约未初始化或输入参数缺失');
        return;
      }

      const hash1 = await walletClient.writeContract({
        address: (InputData0.tokenName == "WETH" ? WETHAddress : USDCAddress) as `0x${string}`,
        abi: (InputData0.tokenName == "WETH" ? WETHAbi : USDCAbi),
        functionName: "approve",
        args: [LiquidityPoolAddress as `0x${string}`, BigInt(Input0 * 10 ** InputData0.decimals)],
      });
      const transactio1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });

      // 假设合约方法名为 swapTokens，需要传入两个代币数量参数
      const hash2 = await LiquidityPoolContract.write.swap([
        Input0 * 10 ** InputData0.decimals, 
        Input1 * 10 ** InputData1.decimals,
        InputData0.tokenAddress as `0x${string}`,
        InputData1.tokenAddress as `0x${string}`,
        walletClient.account.address as `0x${string}`,
      ]);
      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash: hash2 });
      init2();
      console.log('交易已确认:', receipt);
    } catch (error) {
      console.error('交易失败:', error);
    }
  }

  // 计算swap价格
  const calculateInput = async (type?: number, amount?: any) => {
    console.log(ContractBase, type, amount, InputData0, InputData1);

    if (InputData0.tokenName == InputData1.tokenName) {
      return;
    }

    if (!InputData0.decimals || !InputData1.decimals) {
      return;
    }

    if (type == 0) {
      var x1 = Number(amount) * 10 ** InputData0.decimals;
      var fee1 = ContractBase.fee;
      var fee = Math.ceil((x1 * fee1) / (ContractBase.FEE_DENOMINATOR + fee1));
      fee == 0 && (fee = 1);
      var x2 = x1 - fee;  // 输入 x

      if (InputData0.tokenName == "WETH") {
        var y1 = Math.ceil((ContractBase.reserve0 * ContractBase.reserve1) / (ContractBase.reserve0 + x2));
        var y2 = ContractBase.reserve1 - y1; // 输入 y
        console.log(x1, x2, y1, y2, fee, y2 / (10 ** InputData1.decimals));
        setInput1(y2 / (10 ** InputData1.decimals));
      } else {
        var y1 = Math.ceil((ContractBase.reserve0 * ContractBase.reserve1) / (ContractBase.reserve1 + x2));
        var y2 = ContractBase.reserve0 - y1; // 输入 y
        console.log(x1, x2, y1, y2, fee, y2 / (10 ** InputData1.decimals));
        setInput1(y2 / (10 ** InputData1.decimals));
      }
    } else {
      
    }

  }

  return (
    <>
      <div className={styles["swap"]}>
        <div className={styles["swap-1"] + " text-[20px]"}>
          <div>Swap({ContractBase.fee ? ContractBase.fee / ContractBase.FEE_DENOMINATOR * 100 : "-"}% fee)</div>
          <div className="poi" onClick={() => {
            setTransactionModalOpen(true);
          }}><SettingOutlined /></div>
        </div>

        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>From</div>
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
                  calculateInput(0, e);
                }}
                stringMode
              />
            </div>
            {InputData0.tokenName ? <div onClick={() => {
              setTokenListModalData({
                type: "Input0",
              })
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
          <ArrowDownOutlined />
        </div>

        <div className={styles["swap-2"]}>
          <div className={styles["swap-2-1"]}>
            <div>to</div>
            <div>Balance: {InputData1.amount ? InputData1.amount : 0}</div>
          </div>
          <div className={styles["swap-2-2"]}>
            <div>
              <InputNumber
                readOnly
                style={{ width: 200 }}
                defaultValue="0.0000"
                value={Input1}
                min="0"
                max="10000"
                step="0.0001"
                // onChange={(e) => {
                //   setInput1(e);
                //   calculateInput(1, e);
                // }}
                stringMode
              />
            </div>
            {InputData1.tokenName ? <div onClick={() => {
              setTokenListModalData({
                type: "Input1",
              })
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

        <div className={styles["swap-3"] + " text-[16px] mt-[10px]"}>
          <div>Slippage Tolerance</div>
          <div>0.1%</div>
        </div>

        <Button type="primary" className={"common-button-1"} onClick={() => {
          swap();
        }}>Swap</Button>
      </div>

      <TransactionModal
        transactionModalOpen={transactionModalOpen}
        setTransactionModalOpen={setTransactionModalOpen}
        transactionModalCallBack={transactionModalCallBack}
        ContractBase={ContractBase}
      />

      <TokenListModal
        tokenListModalOpen={tokenListModalOpen}
        setTokenListModalOpen={setTokenListModalOpen}
        tokenListModalCallBack={tokenListModalCallBack}
        tokenListModalData={tokenListModalData}
      />
    </>
  );
}