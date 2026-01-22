
import { Testnet } from './types';

export const SUPPORTED_NETWORKS: Testnet[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    logo: './img/eth.png',
    color: '#627EEA',
    faucetUrl: 'https://sepoliafaucet.com/'
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    rpcUrl: 'wss://base-sepolia.drpc.org',
    explorerUrl: 'https://sepolia.basescan.org',
    logo: './img/base.jpg',
    color: '#0052FF',
    faucetUrl: 'https://faucet.quicknode.com/base/sepolia'
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    symbol: 'POL',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    color: '#8247E5',
    faucetUrl: 'https://faucet.polygon.technology/'
  },
  {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'tBNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    color: '#F3BA2F',
    faucetUrl: 'https://testnet.binance.org/faucet-smart'
  },
  {
    id: 43113,
    name: 'Avalanche Fuji',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    color: '#E84142',
    faucetUrl: 'https://faucet.avax.network/'
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    rpcUrl: 'wss://arbitrum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.arbiscan.io',
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    color: '#28A0F0',
    faucetUrl: 'https://faucet.quicknode.com/arbitrum/sepolia'
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.optimism.io',
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    color: '#FF0420',
    faucetUrl: 'https://faucet.quicknode.com/optimism/sepolia'
  },
  {
    id: 24101,
    name: 'Incentiv Testnet',
    symbol: 'INC',
    rpcUrl: 'https://rpc.incentiv.io',
    explorerUrl: 'https://explorer.incentiv.io',
    logo: './img/incentiv.webp',
    color: '#ff4d4d',
    faucetUrl: 'https://portal.incentiv.io/'
  },
  {
    id: 91342,
    name: 'Giwa Testnet',
    symbol: 'GIWA',
    rpcUrl: 'https://sepolia-rpc.giwa.io',
    explorerUrl: 'https://explorer.giwa.network',
    logo: './img/giwa.webp',
    color: '#4dff88',
    faucetUrl: 'https://faucet.giwa.io/'
  },
  {
    id: 20994,
    name: 'Fluent Testnet',
    symbol: 'FLUENT',
    rpcUrl: 'https://rpc.testnet.fluent.xyz',
    explorerUrl: 'https://explorer.fluent.xyz',
    logo: './img/fluent.webp',
    color: '#4db8ff',
    faucetUrl: 'https://testnet.fluent.xyz/dev-portal'
  },
  {
    id: 2368,
    name: 'KiteAI Testnet',
    symbol: 'KITE',
    rpcUrl: 'https://rpc-testnet.gokite.ai',
    explorerUrl: 'https://explorer.kiteai.org',
    logo: './img/kite.webp',
    color: '#ffcc00',
    faucetUrl: 'https://faucet.gokite.ai/'
  },
  {
    id: 1270,
    name: 'Irys Testnet',
    symbol: 'IRYS',
    rpcUrl: 'https://testnet-rpc.irys.xyz/v1/execution-rpc',
    explorerUrl: 'https://explorer.irys.xyz',
    logo: './img/irys.webp',
    color: '#ff66ff',
    faucetUrl: 'https://irys.xyz/faucet'
  },
  {
    id: 688689,
    name: 'Pharos Testnet',
    symbol: 'PHRS',
    rpcUrl: 'https://atlantic.dplabs-internal.com',
    explorerUrl: 'https://explorer.pharos.network',
    logo: './img/pharos.webp',
    color: '#00cc99',
    faucetUrl: 'https://testnet.pharosnetwork.xyz/'
  },
  {
    id: 6252,
    name: 'SANDchain Testnet',
    symbol: 'SAND',
    rpcUrl: 'https://sandchain-rpc.caldera.xyz/http',
    explorerUrl: 'https://explorer.sandchain.io',
    logo: './img/sand.webp',
    color: '#0084ff',
    faucetUrl: 'https://sandchain-hub.caldera.xyz/'
  },
  {
    id: 5042002,
    name: 'Arc Testnet',
    symbol: 'ARC',
    rpcUrl: 'https://rpc.testnet.arc.network',
    explorerUrl: 'https://testnet.arcscan.app/',
    logo: './img/arc.webp',
    color: '#ff9966',
    faucetUrl: 'https://faucet.circle.com/'
  },
  {
    id: 11155931,
    name: 'RISE Testnet',
    symbol: 'RISE',
    rpcUrl: 'https://testnet.riselabs.xyz',
    explorerUrl: 'https://explorer.rise.xyz',
    logo: './img/rise.webp',
    color: '#6666ff',
    faucetUrl: 'https://portal.risechain.com/'
  },
  {
    id: 1336,
    name: 'Kii Testnet',
    symbol: 'KII',
    rpcUrl: 'https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com',
    explorerUrl: 'https://explorer.kii.chain',
    logo: './img/kii.webp',
    color: '#cc33ff',
    faucetUrl: 'https://explorer.kiichain.io/faucet'
  },
  {
    id: 10778,
    name: 'X1ECO Testnet',
    symbol: 'X1',
    rpcUrl: 'https://maculatus-rpc.x1eco.com',
    explorerUrl: 'https://explorer.x1eco.com',
    logo: './img/x1.webp',
    color: '#33cc33',
    faucetUrl: 'https://x1ecochain.gitbook.io/x1-ecochain-tech-whitepaper/development-environment/faucet-guide'
  },
  {
    id: 123123,
    name: 'Rayls Testnet',
    symbol: 'RAYLS',
    rpcUrl: 'https://devnet-rpc.rayls.com',
    explorerUrl: 'https://explorer.rayls.network',
    logo: './img/rayls.webp',
    color: '#9933ff',
    faucetUrl: 'https://devnet-dapp.rayls.com/'
  },
  {
    id: 5115,
    name: 'Citrea Testnet',
    symbol: 'CIT',
    rpcUrl: 'https://rpc.testnet.citrea.xyz',
    explorerUrl: 'https://explorer.citrea.xyz',
    logo: './img/citrea.webp',
    color: '#ff3399',
    faucetUrl: 'https://citrea.xyz/faucet'
  },
  {
    id: 267,
    name: 'Neura Testnet',
    symbol: 'NEURA',
    rpcUrl: 'https://rpc.ankr.com/neura_testnet',
    explorerUrl: 'https://explorer.neura.ai',
    logo: './img/neura.webp',
    color: '#3366ff',
    faucetUrl: 'https://neuraverse.neuraprotocol.io/?section=faucet'
  },
  {
    id: 42429,
    name: 'Tempo Testnet',
    symbol: 'TEMPO',
    rpcUrl: 'https://rpc.moderato.tempo.xyz',
    explorerUrl: 'https://explorer.tempo.io',
    logo: './img/tempo.webp',
    color: '#ff6600',
    faucetUrl: 'https://docs.tempo.xyz/quickstart/faucet'
  },
  {
    id: 55931,
    name: 'Datahaven Testnet',
    symbol: 'DATA',
    rpcUrl: 'https://services.datahaven-testnet.network/testnet',
    explorerUrl: 'https://explorer.datahaven.xyz',
    logo: './img/datahaven.webp',
    color: '#00ccff',
    faucetUrl: 'https://apps.datahaven.xyz/testnet/faucet'
  },
  {
    id: 984,
    name: 'OPN Testnet',
    symbol: 'OPN',
    rpcUrl: 'https://testnet-rpc.iopn.tech',
    explorerUrl: 'https://explorer.opn.network',
    logo: './img/opn.webp',
    color: '#ff3300',
    faucetUrl: 'https://faucet.iopn.tech/'
  }
];

// Simple Greeting Contract ABI (for Send GM)
export const GM_CONTRACT_ABI = [
  "function sendGM() public payable",
  "event GMSent(address indexed sender, uint256 timestamp)"
];

// Mock Address for GM
export const GM_MOCK_ADDRESS = "0x0000000000000000000000000000000000000001";

// Minimal ERC20 Bytecode for deployment test
export const DEPLOYABLE_CONTRACT_BYTECODE = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea26469706673582212204c3f59e663a7590d96d7f0223e7f9e8a5b6e2f16a69074095a5c5c066738520864736f6c63430008120033";
export const DEPLOYABLE_CONTRACT_ABI = [];
