import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Space, Button, Form, Select } from 'antd';
import { useRouter } from 'next/router';
import NFTInfoModal from '../NFTInfoModal';
import { NFTMarket2Abi, NFTMarket2Address } from "../../../contractAbi/NFTMarket2Info.js";

export default function MyNFTOrder() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [tableData, setTableData] = useState<any>([]); // ALL NFT
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const [selectedRows, setSelectedRows] = useState<any>([]);

  // type: 1: detail, 2: sell, 3: modify, 4: buy, 5: cancel

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
    console.log(walletClient, (await walletClient.getAddresses())[0]);
  }

  const refreshPage = () => {
    search();
  }

  const search = () => {
    if (!publicClient || !walletClient) {
      return;
    }

    form
      .validateFields()
      .then(async (values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        console.log(data1);

        const NFTContract = await getContract({
          address: NFTMarket2Address as `0x${string}`,
          abi: NFTMarket2Abi,
          client: {
            public: publicClient,
            wallet: walletClient,
          }
        });
        const [orderList] = await Promise.all([
          NFTContract.read.getAllStatusNFT([data1.status, walletClient.account.address]),
        ])

        console.log(orderList);
        setTableData(orderList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
            {record.status == "1" && <Button type="primary" onClick={() => {
              setNFTInfoModalData({
                data: record,
                type: "modify"
              })
              setNFTInfoModalOpen(true);
            }}>MODIFY NFT</Button>}
            {record.status == "1" && <Button type="primary" onClick={() => {
              setNFTInfoModalData({
                data: record,
                type: "cancel"
              })
              setNFTInfoModalOpen(true);
            }}>CANCEL NFT</Button>}
          </Space>
        )
      }
    },
  ];

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>MY NFT ORDER</div>
      <div className={styles["marketAll-table"]}>
        <Form
          form={form}
          name="order"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          layout="inline"
          style={{ marginBottom: 20 }}
          initialValues={{ status: "1" }}
        // autoComplete="off"
        >
          <Form.Item
            label="order status"
            name="status"
            style={{ width: 400 }}
          >
            <Select
              style={{ width: 400 }}
              options={[
                { value: '1', label: 'Active' },
                { value: '2', label: 'Sold' },
                { value: '3', label: 'Cancelled' },
              ]}
            />
          </Form.Item>
          <Form.Item
          >
            <Button type="primary" onClick={search}>Search</Button>
          </Form.Item>
        </Form>
        <Table
          columns={tableColumns}
          dataSource={tableData}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: (newSelectedRowKeys: React.Key[], selectedRows) => {
        //     setSelectedRowKeys(newSelectedRowKeys);
        //     setSelectedRows(selectedRows);
        //   }
        // }}
        />
      </div>

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