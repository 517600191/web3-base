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

export default function NftInfoModal(props: any) {
  const { nftInfoModalOpen, setNftInfoModalOpen, nftInfoModalCallBack, nftInfoModalData, NFTData } = props;
  console.log(nftInfoModalData);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<any>(false);

  // type: 1: detail, 2: sell, 3: modify, 4: buy, 5: cancel

  const items = [
    {
      label: 'TOP OFFER',
      children: nftInfoModalData?.item?.topOffer,
    },
    {
      label: 'COLLECTION FLOOR',
      children: nftInfoModalData?.item?.topOffer,
    },
    {
      label: 'RARITY',
      children: nftInfoModalData?.item?.ratiry,
    },
    {
      label: 'LAST SALE',
      children: nftInfoModalData?.item?.listed,
    },
    {
      label: 'BUY FOR',
      span: 4,
      children: nftInfoModalData?.item?.price + ' ' + nftInfoModalData?.item?.coinType,
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
    setNftInfoModalOpen(false);
  };

  const handleCancel = () => {
    setNftInfoModalOpen(false);
  };

  const sell = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        nftInfoModalData.item.number = data1.number;

        console.log(data1, nftInfoModalData);

        nftInfoModalCallBack({
          type: "sell",
          item: nftInfoModalData.item,
        });
        setNftInfoModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modify = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        nftInfoModalData.item.number = data1.number;

        console.log(data1, nftInfoModalData);

        nftInfoModalCallBack({
          type: "modify",
          item: nftInfoModalData.item,
        });
        setNftInfoModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const buy = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        nftInfoModalData.item.number = data1.number;

        console.log(data1, nftInfoModalData);

        nftInfoModalCallBack({
          type: "buy",
          item: nftInfoModalData.item,
        });
        setNftInfoModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const cancel = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        let data1 = form.getFieldsValue();
        nftInfoModalData.item.number = data1.number;

        console.log(data1, nftInfoModalData);

        nftInfoModalCallBack({
          type: "cancel",
          item: nftInfoModalData.item,
        });
        setNftInfoModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Modal
      width={1200}
      loading={loading}
      title={nftInfoModalData?.item?.nftName}
      open={nftInfoModalOpen}
      // onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
      footer={null}
    >
      <div>
        <span>{nftInfoModalData?.item?.itemName}</span>
        <span className={"ml-[20px]"}>Owned by {NFTData?.id}</span>
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
          <span>{nftInfoModalData?.item?.tokenId}</span>
        </Form.Item>
        
        {nftInfoModalData?.type == "sell" || nftInfoModalData?.type == "modify" ? <Form.Item
          label="NFT PRICE"
          name="number"
          rules={[{ required: true, message: 'Please input NFT price!' }]}
        >
          <InputNumber min={1} step={1} />
        </Form.Item> : null}

        {nftInfoModalData?.type == "detail" || nftInfoModalData?.type == "buy" || nftInfoModalData?.type == "cancel" ? <Form.Item
          label="NFT PRICE"
        >
          <span>{nftInfoModalData?.item?.orderDetail?.selleNumber || "-"}</span>
        </Form.Item> : null}
      </Form>
      {nftInfoModalData?.type == "sell" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        sell();
      }}>SELL</Button> : null}
      {nftInfoModalData?.type == "modify" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        modify();
      }}>MODIFY</Button> : null}
      {nftInfoModalData?.type == "buy" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        buy();
      }}>BUY NOW</Button> : null}
      {nftInfoModalData?.type == "cancel" ? <Button type="primary" className={"common-button-1"} onClick={() => {
        cancel();
      }}>CANCEL</Button> : null}
      <div className="mt-[20px]"></div>
      <Collapse items={itemsCollapse} defaultActiveKey={['1']} />
    </Modal>
  );
}