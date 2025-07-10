import * as React from 'react';
import { useEffect, useState } from "react";
import styles from './index.module.scss';

export default function Footer() {
  return (
    <div className={styles["footer"]}>
      © 2025 Stake. All rights reserved
    </div>
  );
}