
export interface Testnet {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  logo: string;
  color: string;
  faucetUrl: string;
}

export interface Cooldown {
  action: 'GM' | 'DEPLOY';
  testnetId: number;
  lastExecuted: number; // Timestamp
}

export interface TransactionRecord {
  hash: string;
  action: 'GM' | 'DEPLOY';
  networkName: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl: string;
  contractAddress?: string; // Address of the deployed contract
}

export interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
}

export interface StreakState {
  count: number;
  lastGmTimestamp: number;
}
