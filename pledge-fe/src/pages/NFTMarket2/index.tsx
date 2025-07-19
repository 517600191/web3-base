import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Space, Button } from 'antd';
import { tableColumns } from "./mock.js";
import { useRouter } from 'next/router';
import { NFTMarket2Abi, NFTMarket2Address } from "../../contractAbi/NFTMarket2Info.js";

export default function NFTMarket2() {
  const router = useRouter();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [NFTContract, setNFTContract] = useState<any>(null);
  const [tableList, setTableList] = useState<any>([]);

  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    if (NFTContract) {
      refreshPage(); 
    }
  }, [NFTContract])

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
    console.log(walletClient, (await walletClient.getAddresses())[0]);

    const NFTContract = await getContract({
      address: NFTMarket2Address as `0x${string}`,
      abi: NFTMarket2Abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    });
    await setNFTContract(NFTContract);
  }

  const refreshPage = () => {
    search();
  }

  const search = async() => {
    if (!publicClient || !walletClient) {
      return;
    }
    
    const [orderList] = await Promise.all([
      NFTContract.read.getAllNFTList(),
    ])

    console.log(orderList);
    setTableList(orderList);
  };

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>NFTMarket2</div>
      <Space>
        <Button type="primary" onClick={() => { refreshPage() }}>refreshPage</Button>
        <Button type="primary" onClick={() => { 
          router.push({
            pathname: `/NFTMarket2/myNFT`,
            query: "",
          });
         }}>MY NFT</Button>
        <Button type="primary" onClick={() => { 
          router.push({
            pathname: `/NFTMarket2/myNFTOrder`,
            query: "",
          });
         }}>MY NFT ORDER</Button>
      </Space>
      <div className={styles["marketAll-table"]}>
        <Table 
          columns={tableColumns} 
          dataSource={tableList}
          onRow={(record: any) =>  {
            console.log(record);
            return {
              onClick: (event) => {
                // localStorage.setItem("NFTData", JSON.stringify(record));
                router.push({
                  pathname: `/NFTMarket2/detail/${record.NFT}`,
                  query: "",
                });
              }, // 点击行
            };
          }}
        />
      </div>
    </div>
  );
}