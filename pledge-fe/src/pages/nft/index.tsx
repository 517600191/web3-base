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
import { NFTTDAO2Abi, NFTTDAO2Address } from "../../contractAbi/NFTTDAO2Info.js";
import TransferNFTModal from './TransferNFTModal';
import MintNFTModal from './MintNFTModal';

export default function NFT() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setwalletClient] = useState<any>(null);
  const [NFTTDAO2Contract, setNFTTDAO2Contract] = useState<any>(null);
  const [tableData1, setTableData1] = useState<any>([]); // ALL NFT
  const [tableData2, setTableData2] = useState<any>([]); // OWN NFT
  const [tableData3, setTableData3] = useState<any>([]); // DEPOSITED NFT
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);

  //modal
  const [transferNFTModalOpen, setTransferNFTModalOpen] = useState<any>(false);
  const [transferNFTModalData, setTransferNFTModalData] = useState<any>(null);
  const transferNFTModalCallBack = (data: any) => {
    if (data.type == "transferNFT") {
      transferNFT(data);
    } else if (data.type == "batchTransferNFT") {
      batchTransferNFT(data);
    }
  }

  const [mintNFTModalOpen, setMintNFTModalOpen] = useState<any>(false);
  const [mintNFTModalData, setMintNFTModalData] = useState<any>(false);
  const mintNFTModalCallBack = (data: any) => {
    if (data.type == "safeMint") {
      safeMint(data);
    } else if (data.type == "safeBatchMint") {
      safeBatchMint(data);
    }
  }
  //modal

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

  useEffect(() => {
    if (publicClient && NFTTDAO2Contract) {
      const unwatch = publicClient.watchContractEvent({
        address: NFTTDAO2Address,
        abi: NFTTDAO2Abi,
        eventName: 'LogMessage',
        onLogs: (logs: any) => {
          console.log(logs);
        }
      })

      // 组件卸载时停止监听
      return () => unwatch();
    }
  }, [publicClient, NFTTDAO2Contract]);

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

    const NFTTDAO2Contract = await getContract({
      address: NFTTDAO2Address as `0x${string}`,
      abi: NFTTDAO2Abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      }
    });
    await setNFTTDAO2Contract(NFTTDAO2Contract);
    console.log(NFTTDAO2Contract);
  }

  const refreshPage = () => {
    getAllMintedNFTs();
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }

  // mint
  const safeMint = async (data: any) => {
    // console.log(data);

    try {
      // 假设元数据 URI 已经上传到 IPFS
      // const tokenURI = 'ipfs://QmSomeCID/NFTTDAO2.json'; 
      const tokenURI = './NFTTDAO2.json';
      // const { request } = await NFTTDAO2Contract.write.safeMint([walletClient.account.address, tokenURI]);
      // const hash = await walletClient.writeContract(request);
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "safeMint",
        args: [data.data.address, tokenURI],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      // 等待交易确认
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      console.log('NFT 铸造成功');
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
    }
  }

  // 批量 mint
  const safeBatchMint = async (data: any) => {
    // console.log(data);

    try {
      // 假设元数据 URI 已经上传到 IPFS
      const tokenURI = './NFTTDAO2.json';
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "safeBatchMint",
        args: [data.data.address, data.data.number, tokenURI],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
      refreshPage();
      // 等待交易确认
      // await walletClient.waitForTransactionReceipt({ hash });
      console.log('NFT 铸造成功');
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
    }
  }

  //获取nft
  const getAllMintedNFTs = async () => {
    if (!publicClient || !NFTTDAO2Contract || !walletClient) {
      console.log('合约或公共客户端未初始化');
      return;
    }
    try {
      // 调用合约的 getAllMintedNFTs 方法
      const tokenIds = await NFTTDAO2Contract.read.getAllMintedNFTs();
      setTableData1(tokenIds.map((item: any, value: any) => {
        // console.log(item, value);
        return {
          tokenId: item,
          key: value,
        }
      }));
      console.log(tokenIds);

      const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })
      const tokenIds2 = await NFTTDAO2Contract.read.getNFTsByOwner([account]);
      setTableData2(tokenIds2.map((item: any, value: any) => {
        // console.log(item, value);
        return {
          tokenId: item,
          key: value,
        }
      }));
      console.log(tokenIds2);

      const tokenIds3 = await NFTTDAO2Contract.read.getNFTsByOwner([NFTTDAO2Address]);
      setTableData3(tokenIds3.map((item: any, value: any) => {
        // console.log(item, value);
        return {
          tokenId: item,
          key: value,
        }
      }));
      console.log(tokenIds3);

      message.success('成功获取所有铸造的 NFT');
    } catch (error) {
      // message.error('获取所有铸造的 NFT 失败: ' + error);
      console.error('获取所有铸造的 NFT 失败:', error);
    }
  }

  // 转移 nft
  const transferNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "transferNFT",
        args: [walletClient.account.address, data.data.address, data.data.tokenId],
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

  // 批量转移 nft
  const batchTransferNFT = async (data: any) => {
    // console.log(data);

    try {
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "batchTransferNFT",
        args: [walletClient.account.address, data.data.address, data.data.tokenIds],
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

  // 批量存入 nft
  const batchDepositNFT = async () => {
    if (selectedRows.length == 0) {
      messageApi.warning("请选择NFT");
      return;
    }

    let tokenIds = selectedRows.map((item: any) => {
      return item.tokenId;
    })

    console.log(selectedRows, tokenIds);

    try {
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "batchDepositNFT",
        args: [walletClient.account.address, tokenIds],
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

  // 批量取出 nft
  const batchWithdrawNFT = async () => {
    if (selectedRows.length == 0) {
      messageApi.warning("请选择NFT");
      return;
    }

    let tokenIds = selectedRows.map((item: any) => {
      return item.tokenId;
    })

    console.log(selectedRows, tokenIds);

    try {
      const hash = await walletClient.writeContract({
        address: NFTTDAO2Address as `0x${string}`,
        abi: NFTTDAO2Abi,
        functionName: "batchWithdrawNFT",
        args: [walletClient.account.address, tokenIds],
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

  const tableColumns1 = [
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
          <div>
            <span>-</span>
          </div>
        )
      }
    },
  ];

  const tableColumns2 = [
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
              setTransferNFTModalData({
                data: record,
                type: "transferNFT"
              })
              setTransferNFTModalOpen(true);
            }}>transferNFT</Button>
          </Space>
        )
      }
    },
  ];

  const tableColumns3 = [
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

            }}>withdrawNFT</Button>
          </Space>
        )
      }
    },
  ];

  return (
    <div className={styles["marketAll"]}>
      <Space>
        <Button type="primary" onClick={() => { refreshPage() }}>refreshPage</Button>
        <Button type="primary" onClick={() => {
          setMintNFTModalData({
            type: "safeMint"
          })
          setMintNFTModalOpen(true);
        }}>safeMint</Button>
        <Button type="primary" onClick={() => {
          setMintNFTModalData({
            type: "safeBatchMint"
          })
          setMintNFTModalOpen(true);
        }}>safeBatchMint</Button>
      </Space>
      <div className={styles["marketAll-table"]}>
        <div className={styles["marketAll-title"]}>ALL NFT</div>
        <Table
          columns={tableColumns1}
          dataSource={tableData1}
        />

        <div className={styles["marketAll-title"]}>OWN NFT</div>
        <Space className="mb-[20px]">
          <Button type="primary" onClick={() => {
            if (selectedRowKeys.length == 0) {
              messageApi.warning("请选择NFT");
              return;
            }
            setTransferNFTModalData({
              data: selectedRows.concat(),
              type: "batchTransferNFT"
            })
            setTransferNFTModalOpen(true);
          }}>batchTransferNFT</Button>

          <Popconfirm
            placement="top"
            title={'Do you want to deposit this NFT ?'}
            // description={description}
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              batchDepositNFT();
            }}
          >
            <Button type="primary">batchDepositNFT</Button>
          </Popconfirm>
        </Space>
        <Table
          columns={tableColumns2}
          dataSource={tableData2}
          rowSelection={{
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[], selectedRows) => {
              setSelectedRowKeys(newSelectedRowKeys);
              setSelectedRows(selectedRows);
            }
          }}
        />

        <div className={styles["marketAll-title"]}>DEPOSITED NFT</div>
        <Space className="mb-[20px]">
          <Popconfirm
            placement="top"
            title={'Do you want to withdraw this NFT ?'}
            // description={description}
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              batchWithdrawNFT();
            }}
          >
            <Button type="primary">batchWithdrawNFT</Button>
          </Popconfirm>
        </Space>
        <Table
          columns={tableColumns3}
          dataSource={tableData3}
          rowSelection={{
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[], selectedRows) => {
              setSelectedRowKeys(newSelectedRowKeys);
              setSelectedRows(selectedRows);
            }
          }}
        />
      </div>

      {contextHolder}

      <TransferNFTModal
        transferNFTModalOpen={transferNFTModalOpen}
        setTransferNFTModalOpen={setTransferNFTModalOpen}
        transferNFTModalCallBack={transferNFTModalCallBack}
        transferNFTModalData={transferNFTModalData}
      />

      <MintNFTModal
        mintNFTModalOpen={mintNFTModalOpen}
        setMintNFTModalOpen={setMintNFTModalOpen}
        mintNFTModalCallBack={mintNFTModalCallBack}
        mintNFTModalData={mintNFTModalData}
      />
    </div>
  );
}