import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import styles from './index.module.scss'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Table } from 'antd';
import { tableColumns, tableData } from "./mock.js";

export default function Market() {
  const [tabsIndex, setTabsIndex] = useState<any>("BUSD");
  const [typeIndex, setTypeIndex] = useState<any>("Live");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabsIndex(newValue);
  };

  const handleChange2 = (event: SelectChangeEvent) => {
    setTypeIndex(event.target.value);
  };

  return (
    <div className={styles["marketAll"]}>
      <div className={styles["marketAll-title"]}>Market Pool</div>
      <div className={styles["marketAll-type"]}>
        <Tabs value={tabsIndex} onChange={handleChange}>
          <Tab label="BUSD" value={"BUSD"} />
          <Tab label="USDT" value={"USDT"} />
          <Tab label="PLGR" value={"PLGR"} />
        </Tabs>
        <Select
          className={styles["marketAll-type-2"]}
          value={typeIndex}
          onChange={handleChange2}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value={"Live"}>Live</MenuItem>
          <MenuItem value={"All"}>All</MenuItem>
          <MenuItem value={"Finished"}>Finished</MenuItem>
        </Select>
      </div>
      <div className={styles["marketAll-table"]}>
        <Table columns={tableColumns} dataSource={tableData} />
      </div>
    </div>
  );
}