import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Input, message, Space, Button } from 'antd';
// import { tableColumns, tableData } from "./mock.js";
import { useRouter } from 'next/router';
import NFTInfoModal from '../../NFTInfoModal';
import { NFTMarket2Abi, NFTMarket2Address } from "../../../../contractAbi/NFTMarket2Info.js";

export default function NFTDetail() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [NFTContract, setNFTContract] = useState<any>(null);
  const [tableList, setTableList] = useState<any>(null);

  // const NFTData = JSON.parse(localStorage.getItem("NFTData") || "{}");
  // console.log(NFTData);

  const statusObj: any = {
    "1": "Active",
    "2": "Sold",
    "3": "Cancelled",
  }

  //modal
  const [NFTInfoModalOpen, setNFTInfoModalOpen] = useState<any>(false);
  const [NFTInfoModalData, setNFTInfoModalData] = useState<any>(null);
  const NFTInfoModalCallBack = (data: any) => {
    console.log(data);
    refreshPage();
  }
  //modal

  const tableColumns = [
    {
      title: 'orderId',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 300,
    },
    {
      title: 'selleNumber',
      dataIndex: 'selleNumber',
      key: 'selleNumber',
      width: 300,
    },
    {
      title: 'NFTaddress',
      dataIndex: 'sellerNFTaddress',
      key: 'sellerNFTaddress',
      width: 300,
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      width: 300,
      render: function (value: any, record: any, index: any) {
        return (
          <span>{statusObj[value]}</span>
        )
      }
    },
    {
      title: 'tokenId',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 300,
    },
    {
      title: 'operation',
      render: function (value: any, record: any, index: any) {
        return (
          <Space>
            <Button type="primary" onClick={() => {
              setNFTInfoModalData({
                data: record,
                type: "detail"
              })
              setNFTInfoModalOpen(true);
            }}>DETAIL</Button>
            <Button type="primary" onClick={() => {
              setNFTInfoModalData({
                data: record,
                type: "buy"
              })
              setNFTInfoModalOpen(true);
            }}>BUY NFT</Button>
          </Space>
        )
      }
    },
  ];

  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    if (NFTContract) {
      getNFTData();
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
    console.log(NFTContract);
  }

  const getNFTData = async () => {
    if (!NFTContract) {
      return;
    }
    
    const [orderList, fee, FEE_DENOMINATOR] = await Promise.all([
      NFTContract.read.getNFTAllOrderList([router.query.id]),
      NFTContract.read.fee(),
      NFTContract.read.FEE_DENOMINATOR(),
    ])

    console.log(orderList);
    setTableList(orderList.map((item: any) => {
      item.fee = fee;
      item.FEE_DENOMINATOR = FEE_DENOMINATOR;
      return item;
    }));
  }

  const refreshPage = () => {
    getNFTData();
  }

  return (
    <div className={styles["marketAll"]}>
      <Input placeholder="Search by item or trait" />
      <div className={styles["marketAll-table"]}>
        <Table
          columns={tableColumns}
          dataSource={tableList}
        />
      </div>

      {contextHolder}

      <NFTInfoModal
        NFTInfoModalOpen={NFTInfoModalOpen}
        setNFTInfoModalOpen={setNFTInfoModalOpen}
        NFTInfoModalCallBack={NFTInfoModalCallBack}
        NFTInfoModalData={NFTInfoModalData}
        publicClient={publicClient}
        walletClient={walletClient}
      />
    </div>
  );
}