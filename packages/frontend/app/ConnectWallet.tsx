'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

export interface WalletConnection {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
}

// --- CONFIGURATION ---
// IMPORTANT: Paste your gas-less RPC URL from the Coinbase Build dashboard here.
const COINBASE_RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base-sepolia/zDymyPBVjxHYdIe6KLKuTEWDSDMsmYkW";
const CHAIN_ID = 84532; // Base Sepolia
// --- END CONFIGURATION ---

const ConnectWallet = ({ onConnection }: { onConnection: (connection: WalletConnection) => void }) => {
  const [connection, setConnection] = useState<WalletConnection>({ provider: null, signer: null, address: null });

  useEffect(() => { onConnection(connection); }, [connection, onConnection]);

  const connectWallet = async () => {
    try {
      const CoinbaseWalletSDK_ANY = CoinbaseWalletSDK as any;
      const coinbaseWallet = new CoinbaseWalletSDK_ANY({ appName: 'DeFiGenie', darkMode: true });
      // Use the special RPC URL to enable gas-less transactions
      const ethereum = coinbaseWallet.makeWeb3Provider(COINBASE_RPC_URL, CHAIN_ID);
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setConnection({ provider, signer, address: userAddress });
    } catch (error) { console.error("Failed to connect Coinbase Wallet:", error); }
  };

  const disconnectWallet = () => { setConnection({ provider: null, signer: null, address: null }); };

  if (connection.address) {
    return (
      <div className="wallet-info">
        <span>{`${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`}</span>
        
        {/* NEW: Static x4O2 Button */}
        <button className="x402-btn">x4O2</button>
        
        <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
      </div>
    );
  }

  return <button onClick={connectWallet} className="connect-btn">Connect Wallet</button>;
};

export default ConnectWallet;