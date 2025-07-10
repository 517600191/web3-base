import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.home}>
      <div className={styles.title}>Pledge-Fe Home</div>
    </div>
  );
};

export default Home;
