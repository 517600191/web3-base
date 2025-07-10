import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'pledge-fe',
  projectId: `${process.env.NEXT_PUBLIC_WALLETCONNET_PROJECTID}`,
  chains: [
    mainnet,
    sepolia,
  ],
  // transports: {
  //   [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC_API_KEY}`),  //也可以在 https://chainlist.org/ 找公共RPC节点
  // },
  ssr: true,
});