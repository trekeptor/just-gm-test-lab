
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { SUPPORTED_NETWORKS, DEPLOYABLE_CONTRACT_BYTECODE, DEPLOYABLE_CONTRACT_ABI } from './constants';
import { Testnet, Cooldown, TransactionRecord, WalletState, StreakState } from './types';

// Define custom elements for the JSX namespace to resolve TypeScript errors with AppKit Web Components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'appkit-button': any;
      }
    }
  }
}

// --- AppKit Initialization ---

// Project ID from https://cloud.reown.com
const projectId = '80c090332f1430f8789cc6476566d8e0'; // Voyager Default ID

// Map our Testnet objects to AppKit Network format
const networks = SUPPORTED_NETWORKS.map(net => ({
  id: net.id,
  name: net.name,
  nativeCurrency: {
    name: net.symbol,
    symbol: net.symbol,
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [net.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: net.explorerUrl },
  }
}));

const ethersAdapter = new EthersAdapter();

createAppKit({
  adapters: [ethersAdapter],
  networks: networks as any,
  projectId,
  metadata: {
    name: 'JustGM TestLab',
    description: 'A comprehensive dApp for developers to explore multiple Ethereum testnets, perform on-chain greetings, and deploy smart contracts with built-in activity tracking.',
    url: window.location.origin,
    icons: ['/img/favicon.ico']
  },
  features: {
    analytics: true
  }
});

// --- Utils ---

function isSameUTCDay(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

function isPreviousUTCDay(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  const date1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const date2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  return (date2 - date1) === 86400000;
}

function getNextUTCMidnight() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  return next.getTime();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, defaultValue: T): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(defaultValue), timeoutMs);
  });
  const result = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timeoutHandle);
  return result;
}

// --- Components ---

interface NavbarProps {
  wallet: WalletState;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSwitchNetwork: (network: Testnet) => void;
}

function Navbar({ wallet, isDarkMode, onToggleDarkMode, onSwitchNetwork }: NavbarProps) {
  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.id === wallet.chainId);
  const { open } = useAppKit();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-700/50 dark:border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-shuttle-space text-white text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight dark:text-white">JustGM <span className="gradient-text">TestLab</span></h1>
          <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Multi-Chain Explorer</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700"
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

        {wallet.isConnected && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-full border border-slate-300 dark:border-slate-700 text-sm">
            <span className={`w-2 h-2 rounded-full ${wallet.balance === '???' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'} `}></span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{currentNetwork?.name || `Chain: ${wallet.chainId}`}</span>
          </div>
        )}

        <div className="relative group">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-all"
          >
            <i className="fa-solid fa-network-wired text-indigo-600 dark:text-indigo-400"></i>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Switch Net</span>
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:rotate-180 transition-transform"></i>
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-xl overflow-hidden shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 max-h-[450px] overflow-y-auto custom-scrollbar">
            <div className="p-2 bg-slate-500/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Supported Testnets</div>
            {SUPPORTED_NETWORKS.map((net) => (
              <button
                key={net.id}
                onClick={() => onSwitchNetwork(net)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-500/10 transition-colors text-left border-b border-black/5 dark:border-white/5 last:border-0"
              >
                <img src={net.logo} alt={net.name} className="w-5 h-5 rounded-full object-contain bg-white/10 p-0.5" />
                <span className={`text-sm ${wallet.chainId === net.id ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{net.name}</span>
                {wallet.chainId === net.id && <i className="fa-solid fa-circle-check ml-auto text-indigo-500 text-xs"></i>}
              </button>
            ))}
            <button 
              onClick={() => open({ view: 'Networks' })}
              className="w-full px-4 py-3 text-center text-xs font-bold text-indigo-500 hover:bg-slate-500/5 transition-colors"
            >
              View All Networks
            </button>
          </div>
        </div>

        {/* Custom Button integrated with AppKit */}
        <div className="flex items-center gap-2">
           {/* @ts-ignore - Fix for custom element not being recognized in all TS environments */}
           <appkit-button balance="show" />
        </div>
      </div>
    </nav>
  );
}

function VerificationModal({ tx, onClose }: { tx: TransactionRecord; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const abiString = JSON.stringify(DEPLOYABLE_CONTRACT_ABI || [], null, 2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10">
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
          <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <i className="fa-solid fa-shield-halved text-indigo-600 dark:text-indigo-400"></i>
            Verification Package
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <i className="fa-solid fa-xmark text-slate-500"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 block">Contract Address</label>
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-xs font-mono truncate mr-2 text-slate-700 dark:text-slate-300">{tx.contractAddress}</span>
                <button onClick={() => copyToClipboard(tx.contractAddress || '', 'Address')} className="text-slate-400 dark:text-slate-500 hover:text-indigo-500">
                  <i className={`fa-solid ${copied === 'Address' ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 block">Contract Name</label>
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">VoyagerToken</span>
                <button onClick={() => copyToClipboard('VoyagerToken', 'Name')} className="text-slate-400 dark:text-slate-500 hover:text-indigo-500">
                  <i className={`fa-solid ${copied === 'Name' ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Contract ABI (JSON)</label>
              <button onClick={() => copyToClipboard(abiString, 'ABI')} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                {copied === 'ABI' ? 'COPIED!' : 'COPY ABI'}
              </button>
            </div>
            <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 text-[10px] font-mono text-slate-600 dark:text-slate-300 overflow-x-auto h-40 custom-scrollbar">
              {abiString}
            </pre>
          </div>
        </div>
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex justify-end">
          <a href={`${tx.explorerUrl}/address/${tx.contractAddress}#code`} target="_blank" rel="noreferrer" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 text-white">
            Open Explorer Verification
          </a>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ tx, onVerify }: { tx: TransactionRecord; onVerify?: (tx: TransactionRecord) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/30 border border-black/5 dark:border-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.action === 'GM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'}`}>
          <i className={tx.action === 'GM' ? 'fa-solid fa-sun' : 'fa-solid fa-code'}></i>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{tx.action === 'GM' ? 'Sent GM' : 'Deployed Contract'}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tx.networkName} • {new Date(tx.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {tx.action === 'DEPLOY' && tx.status === 'confirmed' && (
          <button onClick={() => onVerify?.(tx)} title="Verify Contract" className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all">
            <i className="fa-solid fa-shield-check"></i>
          </button>
        )}
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tx.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : tx.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 animate-pulse' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
          {tx.status}
        </span>
        <a href={`${tx.explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2 transition-colors">
          <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        </a>
      </div>
    </div>
  );
}

function CooldownTimer({ cooldown }: { cooldown: Cooldown | undefined }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!cooldown) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      const nextMidnight = getNextUTCMidnight();
      const diff = nextMidnight - now;
      if (!isSameUTCDay(cooldown.lastExecuted, now) || diff <= 0) {
        setTimeLeft("");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!timeLeft) return null;

  return (
    <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl p-4 text-center">
      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-amber-500/20">
         <i className="fa-solid fa-hourglass-half text-amber-600 dark:text-amber-400 animate-spin-slow"></i>
      </div>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1">Daily Cap Reached</p>
      <p className="text-lg font-mono font-bold text-amber-600 dark:text-amber-500">{timeLeft}</p>
    </div>
  );
}

function GmStreakCounter({ streak }: { streak: StreakState }) {
  return (
    <div className="glass-panel p-6 rounded-3xl border-l-4 border-orange-500 flex items-center justify-between relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <i className="fa-solid fa-fire text-8xl text-orange-500"></i>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Consistency Hub</p>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Activity Streak <span className="flex items-center gap-1 text-orange-500"><i className="fa-solid fa-fire animate-pulse"></i>{streak.count}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Days of continuous testnet participation.</p>
      </div>
      <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
         <span className="text-2xl font-black font-mono">{streak.count}</span>
      </div>
    </div>
  );
}

// --- Main Application ---

export default function App() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { chainId, switchNetwork: appKitSwitchNetwork } = useAppKitNetwork(); // Corrected hook
  const { open } = useAppKit();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('voyager_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [walletState, setWalletState] = useState<WalletState>({ address: null, balance: "0.00", chainId: null, isConnected: false });
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('voyager_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cooldowns, setCooldowns] = useState<Cooldown[]>(() => {
    const saved = localStorage.getItem('voyager_cooldowns');
    if (!saved) return [];
    const parsed: Cooldown[] = JSON.parse(saved);
    const now = Date.now();
    return parsed.filter(c => isSameUTCDay(c.lastExecuted, now));
  });

  const [streak, setStreak] = useState<StreakState>(() => {
    const saved = localStorage.getItem('voyager_streak');
    const parsed: StreakState = saved ? JSON.parse(saved) : { count: 0, lastGmTimestamp: 0 };
    const now = Date.now();
    if (parsed.lastGmTimestamp > 0 && !isSameUTCDay(parsed.lastGmTimestamp, now) && !isPreviousUTCDay(parsed.lastGmTimestamp, now)) {
      return { count: 0, lastGmTimestamp: 0 };
    }
    return parsed;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationTx, setVerificationTx] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('voyager_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => localStorage.setItem('voyager_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('voyager_cooldowns', JSON.stringify(cooldowns)), [cooldowns]);
  useEffect(() => localStorage.setItem('voyager_streak', JSON.stringify(streak)), [streak]);

  const updateWalletBalance = useCallback(async () => {
    if (!isConnected || !walletProvider || !address) return;
    try {
      const provider = new BrowserProvider(walletProvider as any);
      const balanceValue = await withTimeout(
        provider.getBalance(address).then(b => parseFloat(ethers.formatEther(b)).toFixed(4)),
        5000,
        "???"
      );
      setWalletState({ 
        address: address as string, 
        balance: balanceValue, 
        chainId: chainId ? Number(chainId) : null, 
        isConnected: true 
      });
    } catch (err) {
      console.warn("Balance fetch failed", err);
    }
  }, [isConnected, walletProvider, address, chainId]);

  useEffect(() => {
    updateWalletBalance();
    const interval = setInterval(updateWalletBalance, 20000);
    return () => clearInterval(interval);
  }, [updateWalletBalance]);

  const onSwitchNetwork = async (network: Testnet) => {
    if (!appKitSwitchNetwork) {
        // Fallback for older SDK versions or if switchNetwork isn't available
        open({ view: 'Networks' });
        return;
    }
    try {
      const netToSwitch = networks.find(n => n.id === network.id);
      if (netToSwitch) {
        await appKitSwitchNetwork(netToSwitch as any);
      } else {
        await appKitSwitchNetwork(network.id as any);
      }
    } catch (err: any) {
      setError(`Switch failed: ${err.message}`);
    }
  };

  const executeAction = async (type: 'GM' | 'DEPLOY') => {
    if (!isConnected || !walletState.chainId || !walletProvider) { setError("Connect wallet first."); return; }
    
    const net = SUPPORTED_NETWORKS.find(n => n.id === walletState.chainId);
    if (!net) {
      setError(`Your wallet is on Chain ID ${walletState.chainId}, which is not currently mapped in Voyager Dashboard.`);
      return;
    }
    
    const now = Date.now();
    if (cooldowns.find(c => c.action === type && c.testnetId === walletState.chainId && isSameUTCDay(c.lastExecuted, now))) {
      setError(`Daily interaction limit reached for ${net.name}.`); return;
    }

    setLoading(true); setError(null);
    try {
      const provider = new BrowserProvider(walletProvider as any);
      const signer = await provider.getSigner();
      let txResponse: ethers.TransactionResponse;

      if (type === 'GM') {
        txResponse = await signer.sendTransaction({ 
          to: walletState.address!, 
          value: ethers.parseEther("0.00001"),
          data: ethers.hexlify(ethers.toUtf8Bytes("GM Voyager!")) 
        });
      } else {
        const factory = new ethers.ContractFactory(DEPLOYABLE_CONTRACT_ABI, DEPLOYABLE_CONTRACT_BYTECODE, signer);
        const contract = await factory.deploy();
        const tx = contract.deploymentTransaction();
        if (!tx) throw new Error("Deployment transaction failed to generate.");
        txResponse = tx as any;
      }

      const newTx: TransactionRecord = { 
        hash: txResponse.hash, 
        action: type, 
        networkName: net.name, 
        timestamp: Date.now(), 
        status: 'pending', 
        explorerUrl: net.explorerUrl 
      };
      setTransactions(prev => [newTx, ...prev]);
      
      const receipt = await txResponse.wait();
      setTransactions(prev => prev.map(t => t.hash === txResponse.hash ? { 
        ...t, 
        status: 'confirmed', 
        contractAddress: receipt?.contractAddress || undefined 
      } : t));
      
      const executedTime = Date.now();
      setCooldowns(prev => [
        ...prev.filter(c => !(c.action === type && c.testnetId === walletState.chainId)), 
        { action: type, testnetId: walletState.chainId!, lastExecuted: executedTime }
      ]);
      
      if (type === 'GM') {
        setStreak(prev => {
          if (prev.lastGmTimestamp === 0 || isPreviousUTCDay(prev.lastGmTimestamp, executedTime)) {
            return { count: prev.count + 1, lastGmTimestamp: executedTime };
          } else if (isSameUTCDay(prev.lastGmTimestamp, executedTime)) {
            return prev;
          }
          return { count: 1, lastGmTimestamp: executedTime };
        });
      }
      updateWalletBalance();
    } catch (err: any) { 
      const msg = err.reason || err.message || "Transaction failed.";
      setError(msg); 
      console.error(err);
    } finally { setLoading(false); }
  };

  const currentNetUI = SUPPORTED_NETWORKS.find(n => n.id === walletState.chainId);

  return (
    <div className="min-h-screen flex flex-col pb-20 transition-colors">
      <Navbar 
        wallet={walletState} 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        onSwitchNetwork={onSwitchNetwork} 
      />
      
      {verificationTx && <VerificationModal tx={verificationTx} onClose={() => setVerificationTx(null)} />}
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <GmStreakCounter streak={streak} />
          
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Interaction Hub</h2>
              {currentNetUI && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <img src={currentNetUI.logo} className="w-4 h-4 rounded-full object-contain" alt={currentNetUI.name} />
                  <span className="text-xs font-bold uppercase tracking-widest">{currentNetUI.name}</span>
                </div>
              )}
            </div>

            {!isConnected ? (
              <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-700/50">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-plug-circle-xmark text-3xl text-slate-400 dark:text-slate-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Disconnected</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">Welcome Voyager. Use the AppKit button above to securely connect your wallet and begin building your testnet streak.</p>
                <div className="flex justify-center">
                  {/* @ts-ignore - Suppress error for custom element not found in JSX namespace */}
                  <appkit-button />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative glass-panel rounded-3xl p-8 border-l-4 border-amber-500 overflow-hidden group">
                  <CooldownTimer cooldown={cooldowns.find(c => c.action === 'GM' && c.testnetId === walletState.chainId)} />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-sun text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Daily GM</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Broadcast your presence to the testnet with a self-signed greeting message.</p>
                  <button 
                    disabled={loading || !!cooldowns.find(c => c.action === 'GM' && c.testnetId === walletState.chainId)} 
                    onClick={() => executeAction('GM')} 
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-signature"></i>}
                    Sign GM
                  </button>
                </div>

                <div className="relative glass-panel rounded-3xl p-8 border-l-4 border-blue-500 overflow-hidden group">
                  <CooldownTimer cooldown={cooldowns.find(c => c.action === 'DEPLOY' && c.testnetId === walletState.chainId)} />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-rocket text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Contract Deployment</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Launch a gas-optimized mock token contract to test deployment stability.</p>
                  <button 
                    disabled={loading || !!cooldowns.find(c => c.action === 'DEPLOY' && c.testnetId === walletState.chainId)} 
                    onClick={() => executeAction('DEPLOY')} 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-code"></i>}
                    Deploy Contract
                  </button>
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span className="text-sm font-medium leading-tight">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-500"></i>
              Voyager Native Testnets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {SUPPORTED_NETWORKS.map(net => (
                <div 
                  key={net.id} 
                  className={`relative p-4 glass-panel rounded-2xl cursor-pointer hover:bg-white/5 transition-all border-t-2 ${walletState.chainId === net.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent'}`} 
                  onClick={() => onSwitchNetwork(net)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={net.logo} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 p-1 object-contain" alt={net.name} />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold leading-none mb-1 text-slate-800 dark:text-slate-200 truncate">{net.name}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{net.symbol}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Tools</span>
                    <a 
                      href={net.faucetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      FAUCET
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <section className="glass-panel rounded-3xl p-6 border-b-4 border-indigo-500">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
              Live Network Status
              {isConnected && <span className="flex items-center gap-1.5 text-emerald-500"><i className="fa-solid fa-circle text-[6px]"></i> Ready</span>}
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-black/5 dark:border-white/5">
                 <span className="text-sm text-slate-500">Balance</span>
                 <span className={`text-sm font-mono font-bold ${walletState.balance === '???' ? 'text-amber-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                   {walletState.balance} {currentNetUI?.symbol || '---'}
                 </span>
               </div>
               <div className="flex justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-black/5 dark:border-white/5">
                 <span className="text-sm text-slate-500">Connected Chain</span>
                 <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{walletState.chainId || '---'}</span>
               </div>
               {currentNetUI && (
                 <div className="flex gap-2">
                   <a 
                    href={currentNetUI.explorerUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 text-center py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all text-slate-700 dark:text-slate-200"
                   >
                     Explorer
                   </a>
                   <a 
                    href={currentNetUI.faucetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 text-center py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all text-white shadow-lg shadow-indigo-600/20"
                   >
                     Request Funds
                   </a>
                 </div>
               )}
            </div>
          </section>

          <section className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">{transactions.length} total</span>
            </div>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-16 opacity-30 italic text-sm text-slate-600 dark:text-slate-400 flex flex-col items-center gap-3">
                  <i className="fa-solid fa-box-open text-2xl"></i>
                  No local activity recorded
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <TransactionItem 
                    key={tx.hash + idx} 
                    tx={tx} 
                    onVerify={(transaction) => setVerificationTx(transaction)} 
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      
      <footer className="mt-auto text-center py-8 text-slate-500 border-t border-slate-700/10">
        <p className="text-[10px] uppercase tracking-widest font-bold">JustGM TestLab Powered by Reown AppKit</p>
      </footer>
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; } 
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
