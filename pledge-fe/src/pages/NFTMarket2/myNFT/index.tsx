import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table, Space, Button, Form, Input } from 'antd';
import { useRouter } from 'next/router';
import NFTInfoModal from '../NFTInfoModal';

export default function MyNFT() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [tableData, setTableData] = useState<any>([]); // ALL NFT
  const [NFTContract, setNFTContract] = useState<any>(null);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const [selectedRows, setSelectedRows] = useState<any>([]);

  // type: 1: detail, 2: sell, 3: modify, 4: buy, 5: cancel

  //modal
  const [NFTInfoModalOpen, setNFTInfoModalOpen] = useState<any>(false);
  const [NFTInfoModalData, setNFTInfoModalData] = useState<any>(null);
  const NFTInfoModalCallBack = (data: any) => {
    console.log(data);
    refreshPage();
    // if (data.type == "sell") {
    //   sellNFT(data);
    // } else if (data.type == "modify") {
    //   modifyNFT(data);
    // } else if (data.type == "buy") {
    //   buyNFT(data);
    // } else if (data.type == "cancel") {
    //   cancelSellNFT(data);
    // }
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

        const NFTContract = await getContract({
          address: data1.address as `0x${string}`,
          abi: [
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
          ],
          client: {
            public: publicClient,
            wallet: walletClient,
          }
        });
        const [balance, name, symbol] = await Promise.all([
          NFTContract.read.balanceOf([walletClient.account.address]),
          NFTContract.read.name(),
          NFTContract.read.symbol()
        ])
        let tokenIds = [];
        // 遍历获取每个 tokenId
        for (let i = 0n; i < balance; i++) {
          const tokenId = await NFTContract.read.tokenOfOwnerByIndex([walletClient.account.address, i]);
          tokenIds.push(tokenId);
        }
        setTableData(tokenIds.map((item: any) => {
          return {
            address: data1.address,
            tokenId: item,
            name,
            symbol,
          }
        }))
        console.log(tokenIds);

      })
      .catch((err) => {
        console.log(err);
      });
  };

  const tableColumns = [
    {
      title: 'address',
      dataIndex: 'address',
      key: 'address',
      width: 300,
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
                type: "sell"
              })
              setNFTInfoModalOpen(true);
            }}>SELL NFT</Button>
          </Space>
        )
      }
    },
  ];

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>MY NFT</div>
      <div className={styles["marketAll-table"]}>
        <Form
          form={form}
          name="basic"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          layout="inline"
          style={{ marginBottom: 20 }}
        // initialValues={{ remember: true }}
        // autoComplete="off"
        >
          <Form.Item
            label="NFT Address"
            name="address"
            style={{ width: 400 }}
          >
            <Input></Input>
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