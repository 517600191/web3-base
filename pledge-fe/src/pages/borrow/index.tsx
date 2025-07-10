import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import Toast from '@/components/toast';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './index.module.scss'
import { erc20Abi, erc20ContractAddress } from '@/contractAbi/config.js';
import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { formatEther, parseEther } from 'viem';
import { HandleReadContract, HandleReadContracts } from '@/hooks/handleContract';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Table } from 'antd';
import { tableColumns, tableData } from "./mock.js";

export default function Borrow() {
  const [tabsIndex, setTabsIndex] = useState<any>("BUSD");
  const [typeIndex, setTypeIndex] = useState<any>("Live");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabsIndex(newValue);
  };

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>Borrow Order</div>
      <div className={styles["marketAll-table"]}>
        <Table columns={tableColumns} dataSource={tableData} />
      </div>
    </div>
  );
}