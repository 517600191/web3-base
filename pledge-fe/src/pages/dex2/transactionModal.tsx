import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Modal, Tooltip, InputNumber } from 'antd';
import Image from 'next/image';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';

export default function TransactionModal(props: any) {
  const { transactionModalOpen, setTransactionModalOpen, transactionModalCallBack, ContractBase } = props;
  const [loading, setLoading] = useState<any>(false);
  const [inputFee, setInputFee] = useState<any>("0");

  useEffect(() => {
    if (transactionModalOpen && ContractBase.fee) {
      setInputFee(ContractBase.fee / ContractBase.FEE_DENOMINATOR * 100);
    }
  }, [transactionModalOpen, ContractBase])

  const handleOk = () => {
    transactionModalCallBack({
      newFee: inputFee
    })

    setTransactionModalOpen(false);
  };

  const handleCancel = () => {
    setTransactionModalOpen(false);
  };

  return (
    <Modal
      loading={loading}
      title="Transaction Settings"
      open={transactionModalOpen}
      onOk={handleOk}
      onCancel={() => {
        handleCancel();
      }}
    >
      <div className={styles["transactionModal-1"]}>
        <div>Slippage tolerance</div>
        <Tooltip title="Your transaction will revert if the price changes unfavorably by more than this percentage.">
          <div className={styles["transactionModal-1-icon"] + " poi"}><QuestionCircleOutlined /></div>
        </Tooltip>
      </div>

      <div className={styles["transactionModal-2"]}>
        <div className={`${styles["transactionModal-2-list"]} ${inputFee == 0.1 ? styles["transactionModal-2-list-active"] : ""}`} onClick={() => setInputFee(0.1)}>0.1%</div>
        <div className={`${styles["transactionModal-2-list"]} ${inputFee == 0.5 ? styles["transactionModal-2-list-active"] : ""}`} onClick={() => setInputFee(0.5)}>0.5%</div>
        <div className={`${styles["transactionModal-2-list"]} ${inputFee == 1 ? styles["transactionModal-2-list-active"] : ""}`} onClick={() => setInputFee(1)}>1%</div>
        <InputNumber
          className={styles["transactionModal-2-input"]}
          style={{ width: 150 }}
          defaultValue="0.0"
          value={inputFee}
          min="0"
          max="100"
          step="0.1"
          onChange={(e) => {
            setInputFee(e);
          }}
          stringMode
        />
        <span className={"ml-[10px]"}>%</span>
      </div>

      <div className={styles["transactionModal-1"] + " mt-[10px]"}>
        <div>Transaction deadline</div>
        <Tooltip title="Your transaction will revert if it is pending for more than this long.">
          <div className={styles["transactionModal-1-icon"] + " poi"}><QuestionCircleOutlined /></div>
        </Tooltip>
      </div>

      <div>
        <InputNumber
          readOnly
          className={styles["transactionModal-2-input"]}
          style={{ width: 150 }}
          defaultValue="0"
          min="0"
          max="10000"
          step="1"
          onChange={() => {

          }}
          stringMode
        />
        <span className={"ml-[10px]"}>Minutes</span>
      </div>
    </Modal>
  );
}