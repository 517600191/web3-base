import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { formatEther, parseEther } from 'viem';
import { Modal, Form, Input } from 'antd';
import Image from 'next/image';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';

export default function TransferNFTModal(props: any) {
  const [form] = Form.useForm();
  const { transferNFTModalOpen, setTransferNFTModalOpen, transferNFTModalCallBack, transferNFTModalData } = props;
  const [loading, setLoading] = useState<any>(false);
  const [tokenId, setTokenId] = useState<any>(null);

  useEffect(() => {
    console.log(transferNFTModalData)

    if (setTransferNFTModalOpen && transferNFTModalData) {
      if (transferNFTModalData.type == "transferNFT") {
        setTokenId(transferNFTModalData?.data?.tokenId);
      } else if (transferNFTModalData.type == "batchTransferNFT") {
        setTokenId(transferNFTModalData.data.map((item: any) => {
          return item.tokenId;
        }).join(","));
      }
    }
  }, [setTransferNFTModalOpen, transferNFTModalData])

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();

        if (transferNFTModalData.type == "transferNFT") {
          data1.tokenId = tokenId;
        } else if (transferNFTModalData.type == "batchTransferNFT") {
          data1.tokenIds = transferNFTModalData.data.map((item: any) => {
            return item.tokenId;
          })
        }

        transferNFTModalCallBack({
          data: data1,
          type: transferNFTModalData.type
        });
        setTransferNFTModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    setTransferNFTModalOpen(false);
  };

  return (
    <Modal
      width={800}
      loading={loading}
      title="Transfer"
      open={transferNFTModalOpen}
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
        <Form.Item
          label="NFT TokenId"
          name="tokenId"
        >
          <span>{tokenId}</span>
        </Form.Item>

        <Form.Item
          label="Transfer Address"
          name="address"
          rules={[{ required: true, message: 'Please input transfer address!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}