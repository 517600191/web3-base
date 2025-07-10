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
  const { mintNFTModalOpen, setMintNFTModalOpen, mintNFTModalCallBack, mintNFTModalData } = props;
  const [loading, setLoading] = useState<any>(false);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        data1.type = mintNFTModalData.type;

        mintNFTModalCallBack({
          data: data1,
          type: mintNFTModalData.type
        });
        setMintNFTModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    setMintNFTModalOpen(false);
  };

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