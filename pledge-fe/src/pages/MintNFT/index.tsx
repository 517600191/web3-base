import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Button, Space, message, Modal, Popconfirm } from 'antd';
// import { tableColumns, tableData } from "./mock.js";
import { useRouter } from 'next/router';
import { NFTTDAO3Abi, NFTTDAO3Address } from "../../contractAbi/NFTTDAO3Info.js";
import { NFTTDAO4Abi, NFTTDAO4Address } from "../../contractAbi/NFTTDAO4Info.js";
import MintNFTModal from './MintNFTModal';

export default function MintNFT() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [NFTTDAO3Contract, setNFTTDAO3Contract] = useState<any>(null);
  const [NFTList, setNFTList] = useState<any>([
    {
      NFTName: "NFTTDAO3",
      address: NFTTDAO3Address,
      abi: NFTTDAO3Abi,
    },
    {
      NFTName: "NFTTDAO4",
      address: NFTTDAO4Address,
      abi: NFTTDAO4Abi,
    },
  ]);

  //modal
  const [mintNFTModalOpen, setMintNFTModalOpen] = useState<any>(false);
  const [mintNFTModalData, setMintNFTModalData] = useState<any>(false);
  const mintNFTModalCallBack = (data: any) => {
    // if (data.type == "safeMint") {
    //   safeMint(data);
    // } else if (data.type == "safeBatchMint") {
    //   safeBatchMint(data);
    // }
  }
  //modal

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })

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

    const walletClient = await createWalletClient({
      account,
      chain: sepolia,
      transport: custom(window.ethereum),
      // transport: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),
    });
    await setwalletClient(walletClient);
    console.log(walletClient, (await walletClient.getAddresses())[0]);

    const NFTTDAO3Contract = await getContract({
      address: NFTTDAO3Address as `0x${string}`,
      abi: NFTTDAO3Abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    });
    await setNFTTDAO3Contract(NFTTDAO3Contract);
    console.log(NFTTDAO3Contract);
  }

  const tableColumns1 = [
    {
      title: 'NFTName',
      dataIndex: 'NFTName',
      key: 'NFTName',
      width: 300,
    },
    {
      title: 'address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'operation',
      render: function (value: any, record: any, index: any) {
        return (
          <Space>
            <Button type="primary" onClick={() => {
              setMintNFTModalData({
                type: "safeMint",
                data: record,
              })
              setMintNFTModalOpen(true);
            }}>safeMint</Button>
            <Button type="primary" onClick={() => {
              setMintNFTModalData({
                type: "safeBatchMint",
                data: record,
              })
              setMintNFTModalOpen(true);
            }}>safeBatchMint</Button>
          </Space>
        )
      }
    },
  ];

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-table"]}>
        <div className={styles["marketAll-title"]}>NFT List</div>
        <Table
          columns={tableColumns1}
          dataSource={NFTList}
        />
      </div>

      {contextHolder}

      <MintNFTModal
        mintNFTModalOpen={mintNFTModalOpen}
        setMintNFTModalOpen={setMintNFTModalOpen}
        mintNFTModalCallBack={mintNFTModalCallBack}
        mintNFTModalData={mintNFTModalData}
        publicClient={publicClient}
        walletClient={walletClient}
      />
    </div>
  );
}