import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { formatEther, parseEther } from 'viem';
import { Modal, Form, Input, InputNumber } from 'antd';
import Image from 'next/image';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';

export default function MintNFTModal(props: any) {
  const [form] = Form.useForm();
  const { mintNFTModalOpen, setMintNFTModalOpen, mintNFTModalCallBack, mintNFTModalData, publicClient, walletClient } = props;
  const [loading, setLoading] = useState<any>(false);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();

        if (mintNFTModalData.type == "safeMint") {
          safeMint(data1);
        } else {
          safeBatchMint(data1);
        }

        setMintNFTModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    setMintNFTModalOpen(false);
  };

  // mint
  const safeMint = async (data: any) => {
    // console.log(data);

    try {
      const tokenURI = 'https://ipfs.io/ipfs/bafkreihewruw5gpqii6lfia5f3blb6kjwwitsct2xpy2ldj5g4kf3mdqa4';
      const hash = await walletClient.writeContract({
        address: mintNFTModalData.data.address as `0x${string}`,
        abi: mintNFTModalData.data.abi,
        functionName: "safeMint",
        args: [data.address, tokenURI],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      // 等待交易确认
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
    }
  }

  // 批量 mint
  const safeBatchMint = async (data: any) => {
    // console.log(data);

    try {
      const tokenURI = 'https://ipfs.io/ipfs/bafkreihewruw5gpqii6lfia5f3blb6kjwwitsct2xpy2ldj5g4kf3mdqa4';
      const hash = await walletClient.writeContract({
        address: mintNFTModalData.data.address as `0x${string}`,
        abi: mintNFTModalData.data.abi,
        functionName: "safeBatchMint",
        args: [data.address, data.number, tokenURI],
        // value: num1 + numfee,
      });
      console.log('交易哈希:', hash);
      // 等待交易确认
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      console.log(transaction);
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
    }
  }

  return (
    <Modal
      width={800}
      loading={loading}
      title="Mint"
      open={mintNFTModalOpen}
      onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
    >
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
      // initialValues={{ remember: true }}
      // autoComplete="off"
      >
        {mintNFTModalData.type == "safeBatchMint" ? <Form.Item
          label="Mint Number"
          name="number"
          rules={[{ required: true, message: 'Please input mint number!' }]}
        >
          <InputNumber min={1} step={1} />
        </Form.Item> : null}

        <Form.Item
          label="Mint Address"
          name="address"
          rules={[{ required: true, message: 'Please input mint address!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}