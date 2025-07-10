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
import NftInfoModal from './nftInfoModal';

export default function NFTDetail() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [tableData1, setTableData1] = useState<any>([]); // ALL NFT
  // const [NFTData, setNFTData] = useState<any>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [NFTTDAO2Contract, setNFTTDAO2Contract] = useState<any>(null);

  const NFTData = JSON.parse(localStorage.getItem("NFTData") || "{}");
  console.log(NFTData);

  //modal
  const [nftInfoModalOpen, setNftInfoModalOpen] = useState<any>(false);
  const [nftInfoModalData, setNftInfoModalData] = useState<any>(null);
  const nftInfoModalCallBack = (data: any) => {
    console.log(data);
    if (data.type == "sell") {
      sellNFT(data);
    } else if (data.type == "modify") {
      modifyNFT(data);
    } else if (data.type == "buy") {
      buyNFT(data);
    } else if (data.type == "cancel") {
      cancelSellNFT(data);
    }
  }
  //modal

  const tableColumns = [
    {
      title: 'ITEMS',
      dataIndex: 'tokenId',
      key: 'tokenId',
    },
    {
      title: 'RARITY',
      dataIndex: 'ratiry',
      key: 'ratiry',
      sorter: (a: any, b: any) => a.ratiry - b.ratiry,
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      render: function (value: any, record: any, index: any) {
        return `${record.price} ${record.coinType}`;
      }
    },
    {
      title: 'TOP OFFER',
      dataIndex: 'topOffer',
      key: 'topOffer',
      sorter: (a: any, b: any) => a.topOffer - b.topOffer,
    },
    {
      title: 'OWNERS',
      dataIndex: 'owners',
      key: 'owners',
      sorter: (a: any, b: any) => a.owners - b.owners,
    },
    {
      title: 'LISTED',
      dataIndex: 'listed',
      key: 'listed',
      sorter: (a: any, b: any) => a.listed - b.listed,
      render: function (value: any, record: any, index: any) {
        return `${record.listed} ago`;
      }
    },
    {
      title: 'operation',
      render: function (value: any, record: any, index: any) {
        return (
          <Space>
            <Button type="primary" onClick={() => {
              setNftInfoModalOpen(true);
              setNftInfoModalData({
                type: "detail",
                item: record,
              });
            }}>DETAIL</Button>

            {record.isOwner && !record.isOrderActive ? <Button type="primary" onClick={() => {
              setNftInfoModalOpen(true);
              setNftInfoModalData({
                type: "sell",
                item: record,
              });
            }}>SELL</Button> : null}

            {record.isOwner && record.isOrderActive ? <Button type="primary" onClick={() => {
              setNftInfoModalOpen(true);
              setNftInfoModalData({
                type: "modify",
                item: record,
              });
            }}>MODIFY</Button> : null}

            {!record.isOwner && record.isOrderActive ? <Button type="primary" onClick={() => {
              setNftInfoModalOpen(true);
              setNftInfoModalData({
                type: "buy",
                item: record,
              });
            }}>BUY</Button> : null}

            {record.isOwner && record.isOrderActive ? <Button type="primary" onClick={() => {
              setNftInfoModalOpen(true);
              setNftInfoModalData({
                type: "cancel",
                item: record,
              });
            }}>CANCEL</Button> : null}
          </Space>
        )
      }
    },
  ];

  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    if (publicClient && walletClient && NFTTDAO2Contract) {
      setTimeout(() => {
        getAllMintedNFTs();
      }, 200)
    }
  }, [publicClient, walletClient, NFTTDAO2Contract])

  const init = async () => {
    console.log(NFTData, 6666);
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

    const NFTTDAO2Contract = await getContract({
      address: NFTData?.id as `0x${string}`,
      abi: NFTData.abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    });
    await setNFTTDAO2Contract(NFTTDAO2Contract);
    console.log(NFTTDAO2Contract);
  }

  //获取nft
  const getAllMintedNFTs = async () => {
    if (!publicClient || !NFTTDAO2Contract || !walletClient) {
      console.log('合约或公共客户端未初始化');
      return;
    }
    try {
      const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
      // 调用合约的 getAllMintedNFTs 方法
      const [tokenIds, orderList, orderAllList] = await Promise.all([
        NFTTDAO2Contract.read.getAllMintedNFTs(),
        NFTTDAO2Contract.read.getAllStatusNFT([1, account]),
        NFTTDAO2Contract.read.getAllNFT([account, 2]),
      ])

      let arrTemp = tokenIds.map((item: any, value: any) => {
        // console.log(item, value);
        return {
          tokenId: item,
          key: value,
          itemName: "NFTTDAO2 (NFTTDAO2S)",
          ratiry: '1',
          price: "0.005",
          coinType: "ETH",
          topOffer: "0.01",
          owners: "29687",
          listed: "10m",
          nftName: "NFTTDAO2"
        }
      });
      console.log(tokenIds, orderList, orderAllList);

      const tokenIds2 = await NFTTDAO2Contract.read.getNFTsByOwner([account]);
      console.log(tokenIds2);

      let orderAllList_1 = orderAllList.filter((item: any) => {
        return item.status == 1;
      })

      let orderObj1: any = {};
      for (let i in orderAllList_1) {
        orderObj1[orderAllList_1[i].tokenId] = orderAllList_1[i];
      }
      console.log(orderObj1, arrTemp)

      for (let i in arrTemp) {
        if (tokenIds2.indexOf(arrTemp[i].tokenId) > -1) {
          arrTemp[i].isOwner = true;
        } else {
          arrTemp[i].isOwner = false;
        }

        if (orderObj1[arrTemp[i].tokenId]) {
          arrTemp[i].isOrderActive = true;
          arrTemp[i].orderDetail = orderObj1[arrTemp[i].tokenId];
        } else {
          arrTemp[i].isOrderActive = false;
        }
      }

      console.log(arrTemp);

      setTableData1(arrTemp);

      message.success('成功获取所有铸造的 NFT');
    } catch (error) {
      // message.error('获取所有铸造的 NFT 失败: ' + error);
      console.error('获取所有铸造的 NFT 失败:', error);
    }
  }

  const refreshPage = () => {
    getAllMintedNFTs();
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }

  // 卖出 nft 提交订单
  const sellNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTData?.id as `0x${string}`,
        abi: NFTData.abi,
        functionName: "sellNFT",
        args: [walletClient.account.address, data.item.tokenId, parseInt(data.item.number)],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      // 等待交易确认
      // await walletClient.waitForTransactionReceipt({ hash });
      // console.log('NFT 铸造成功');
    } catch (error) {
      // console.error('铸造 NFT 失败:', error);
    }
  }

  // 卖出 nft 提交订单
  const modifyNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTData?.id as `0x${string}`,
        abi: NFTData.abi,
        functionName: "modifyNFT",
        args: [data.item.orderDetail.orderId, parseInt(data.item.number)],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      // 等待交易确认
      // await walletClient.waitForTransactionReceipt({ hash });
      // console.log('NFT 铸造成功');
    } catch (error) {
      // console.error('铸造 NFT 失败:', error);
    }
  }

  // 卖出 nft 提交订单
  const buyNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTData?.id as `0x${string}`,
        abi: NFTData.abi,
        functionName: "buyNFT",
        args: [data.item.orderDetail.orderId, walletClient.account.address],
        value: 6000n * 102n / 99n,
      });
      console.log('交易哈希:', hash);
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      // 等待交易确认
      // await walletClient.waitForTransactionReceipt({ hash });
      // console.log('NFT 铸造成功');
    } catch (error) {
      // console.error('铸造 NFT 失败:', error);
    }
  }

  // 卖出 nft 提交订单
  const cancelSellNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTData?.id as `0x${string}`,
        abi: NFTData.abi,
        functionName: "cancelSellNFT",
        args: [data.item.orderDetail.orderId],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      // 等待交易确认
      // await walletClient.waitForTransactionReceipt({ hash });
      // console.log('NFT 铸造成功');
    } catch (error) {
      // console.error('铸造 NFT 失败:', error);
    }
  }

  return (
    <div className={styles["marketAll"]}>
      <Input placeholder="Search by item or trait" />
      <div className={styles["marketAll-table"]}>
        <Table
          columns={tableColumns}
          dataSource={tableData1}
          rowSelection={{
            selectedRowKeys,
            onChange: (newSelectedRowKeys, selectedRows) => {
              setSelectedRowKeys(newSelectedRowKeys);
              setSelectedRows(selectedRows);
            }
          }}
        // onRow={(record) => {
        //   return {
        //     onClick: (event) => {
        //       event.stopPropagation();
        //       setNftInfoModalOpen(true);
        //       setNftInfoModalData({
        //         type: "detail",
        //         item: record,
        //       });
        //     }, // 点击行
        //   };
        // }}
        />
      </div>

      {contextHolder}

      <NftInfoModal
        nftInfoModalOpen={nftInfoModalOpen}
        setNftInfoModalOpen={setNftInfoModalOpen}
        nftInfoModalCallBack={nftInfoModalCallBack}
        nftInfoModalData={nftInfoModalData}
        NFTData={NFTData}
      />
    </div>
  );
}