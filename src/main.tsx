import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected, metaMask } from 'wagmi/connectors';
import App from './App.tsx';
import './index.css';

const projectId = 'd1ea4af573dba2b84815021d46e005d4';   //Web3Modal //'a3bee57776d04c71a56f1c621635e7ac';

const metadata = {
  name: 'LegacyCode',
  description: 'Secure Your Wisdom for Future Generations',
  url: 'https://legacycode.com',
  //url:  'http://localhost:5177', //https://cloud.reown.com/ for ProjectId API
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};


const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId, metadata, showQrModal: false })
  ],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);