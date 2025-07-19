import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { formatEther, parseEther } from 'viem';
import { Modal, InputNumber, Tag, Descriptions, Button, Collapse, Form } from 'antd';
import Image from 'next/image';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { NFTMarket2Abi, NFTMarket2Address } from "../../contractAbi/NFTMarket2Info.js";

export default function NFTInfoModal(props: any) {
  const { NFTInfoModalOpen, setNFTInfoModalOpen, NFTInfoModalCallBack, NFTInfoModalData, publicClient, walletClient } = props;
  console.log(NFTInfoModalData);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<any>(false);

  // type: 1: detail, 2: sell, 3: modify, 4: buy, 5: cancel

  const items = [
    {
      label: 'TOP OFFER',
      children: NFTInfoModalData?.data?.topOffer,
    },
    {
      label: 'COLLECTION FLOOR',
      children: NFTInfoModalData?.data?.topOffer,
    },
    {
      label: 'RARITY',
      children: NFTInfoModalData?.data?.ratiry,
    },
    {
      label: 'LAST SALE',
      children: NFTInfoModalData?.data?.listed,
    },
    {
      label: 'BUY FOR',
      span: 4,
      children: NFTInfoModalData?.data?.price + ' ' + NFTInfoModalData?.data?.coinType,
    },
  ];

  const itemsCollapse = [
    {
      key: '1',
      label: 'Traits',
      children: "Traits",
    },
    {
      key: '2',
      label: 'Price history',
      children: "Price history",
    },
    {
      key: '3',
      label: 'About',
      children: "About",
    },
    {
      key: '4',
      label: 'Blockchain details',
      children: "Blockchain details",
    },
    {
      key: '5',
      label: 'More from this collection',
      children: "More from this collection",
    },
  ];

  const handleOk = () => {
    setNFTInfoModalOpen(false);
  };

  const handleCancel = () => {
    setNFTInfoModalOpen(false);
  };

  const sell = () => {
    form
      .validateFields()
      .then(async(values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        console.log(data1, NFTInfoModalData);

        try {
          const hash1 = await walletClient.writeContract({
            address:  NFTInfoModalData.data.address as `0x${string}`,
            abi: [{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"}],
            functionName: "approve",
            args: [NFTMarket2Address, NFTInfoModalData.data.tokenId],
            // value: num1 + numfee,
          });
          const transaction1 = await publicClient.waitForTransactionReceipt({ hash: hash1 })

          const hash2 = await walletClient.writeContract({
            address: NFTMarket2Address as `0x${string}`,
            abi: NFTMarket2Abi,
            functionName: "sellNFT",
            args: [walletClient.account.address, NFTInfoModalData.data.address, NFTInfoModalData.data.tokenId, data1.price],
            // value: num1 + numfee,
          });
          const transaction2 = await publicClient.waitForTransactionReceipt({ hash: hash2 })
          NFTInfoModalCallBack();
          setNFTInfoModalOpen(false);
        } catch (error) {
          console.error(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modify = () => {
    form
      .validateFields()
      .then(async(values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        console.log(data1, NFTInfoModalData);

        try {
          const hash1 = await walletClient.writeContract({
            address: NFTMarket2Address as `0x${string}`,
            abi: NFTMarket2Abi,
            functionName: "modifyNFT",
            args: [NFTInfoModalData.data.orderId, data1.price],
            // value: num1 + numfee,
          });
          const transaction1 = await publicClient.waitForTransactionReceipt({ hash: hash1 })
          NFTInfoModalCallBack();
          setNFTInfoModalOpen(false);
        } catch (error) {
          console.error(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const buy = () => {
    form
      .validateFields()
      .then(async(values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        console.log(data1, NFTInfoModalData);

        try {
          var numfee = NFTInfoModalData.data.selleNumber * NFTInfoModalData.data.fee / NFTInfoModalData.data.FEE_DENOMINATOR;
          var numfee2 = NFTInfoModalData.data.selleNumber * NFTInfoModalData.data.fee % NFTInfoModalData.data.FEE_DENOMINATOR;
          numfee2 > 0n && (numfee++);

          const hash1 = await walletClient.writeContract({
            address: NFTMarket2Address as `0x${string}`,
            abi: NFTMarket2Abi,
            functionName: "buyNFT",
            args: [NFTInfoModalData.data.orderId, walletClient.account.address],
            value: NFTInfoModalData.data.selleNumber + numfee,
          });
          const transaction2 = await publicClient.waitForTransactionReceipt({ hash: hash1 })
          NFTInfoModalCallBack();
          setNFTInfoModalOpen(false);
        } catch (error) {
          console.error(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const cancel = () => {
    form
      .validateFields()
      .then(async(values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        console.log(data1, NFTInfoModalData);

        try {
          const hash1 = await walletClient.writeContract({
            address: NFTMarket2Address as `0x${string}`,
            abi: NFTMarket2Abi,
            functionName: "cancelSellNFT",
            args: [NFTInfoModalData.data.orderId, NFTInfoModalData.data.sellerNFTaddress],
            // value: num1 + numfee,
          });
          const transaction1 = await publicClient.waitForTransactionReceipt({ hash: hash1 })
          NFTInfoModalCallBack();
          setNFTInfoModalOpen(false);
        } catch (error) {
          console.error(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Modal
      width={1200}
      loading={loading}
      title={NFTInfoModalData?.data?.name}
      open={NFTInfoModalOpen}
      // onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
      footer={null}
    >
      <div>
        <span>{NFTInfoModalData?.data?.symbol}</span>
        <span className={"ml-[20px]"}>Owned by {NFTInfoModalData?.data?.address}</span>
      </div>
      <div className={"mt-[10px] mb-[10px]"}>
        <Tag color="#108ee9">ERC721</Tag>
        <Tag color="#108ee9">POLYGON</Tag>
      </div>
      <Descriptions
        title="NTF Descriptions"
        bordered
        column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        items={items}
      />
      <div className="mt-[20px]"></div>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
      // initialValues={{ remember: true }}
      // autoComplete="off"
      >
        <Form.Item
          label="NFT TokenId"
          name="tokenId"
        >
          <span>{NFTInfoModalData?.data?.tokenId}</span>
        </Form.Item>

        {NFTInfoModalData?.type == "sell" || NFTInfoModalData?.type == "modify" ? <Form.Item
          label="NFT PRICE"
          name="price"
          rules={[{ required: true, message: 'Please input NFT price!' }]}
        >
          <InputNumber min={1} step={1} />
        </Form.Item> : null}

        {NFTInfoModalData?.type == "detail" || NFTInfoModalData?.type == "buy" || NFTInfoModalData?.type == "cancel" ? <Form.Item
          label="NFT PRICE"
        >
          <span>{NFTInfoModalData?.data?.orderDetail?.selleNumber || NFTInfoModalData?.data?.selleNumber || "-"}</span>
        </Form.Item> : null}
      </Form>
      {NFTInfoModalData?.type == "sell" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        sell();
      }}>SELL</Button> : null}
      {NFTInfoModalData?.type == "modify" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        modify();
      }}>MODIFY</Button> : null}
      {NFTInfoModalData?.type == "buy" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        buy();
      }}>BUY NOW</Button> : null}
      {NFTInfoModalData?.type == "cancel" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        cancel();
      }}>CANCEL</Button> : null}
      <div className="mt-[20px]"></div>
      <Collapse items={itemsCollapse} defaultActiveKey={['1']} />
    </Modal>
  );
}