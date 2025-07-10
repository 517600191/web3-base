import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Table } from 'antd';
import { tableColumns, tableData } from "./mock.js";
import { useRouter } from 'next/router';

export default function NFTMarket() {
  const router = useRouter();

  const [tabsIndex, setTabsIndex] = useState<any>("BUSD");

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>NFTMarket</div>
      <div className={styles["marketAll-table"]}>
        <Table 
          columns={tableColumns} 
          dataSource={tableData}
          onRow={(record: any) =>  {
            console.log(record);
            return {
              onClick: (event) => {
                localStorage.setItem("NFTData", JSON.stringify(record));
                router.push({
                  pathname: `/nftMarket/detail/${record.id}`,
                  query: "",
                });
              }, // 点击行
            };
          }}
        />
      </div>
    </div>
  );
}