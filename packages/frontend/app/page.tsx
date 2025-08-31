'use client';

import { useState } from 'react';
import ConnectWallet, { WalletConnection } from './ConnectWallet';
import ReactMarkdown from 'react-markdown';
import { ethers } from 'ethers';

type Message = { sender: 'user' | 'bot'; text: string; };

// --- CONFIGURATION ---
const DEFIGENIE_CONTRACT_ADDRESS = "0x7a6ECCa20a6aCD68aD2af4Ae0cA53534062Db589";
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const DEFIGENIE_ABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "DepositUSDC", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "depositUSDC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getContractUSDCBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdcToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
];
// --- END CONFIGURATION ---

const parseClientAction = (command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    if (lowerCaseCommand.includes('balance')) return { intent: 'CHECK_USDC_BALANCE' };
    if (lowerCaseCommand.startsWith('deposit') && lowerCaseCommand.includes('usdc')) {
        const amountMatch = lowerCaseCommand.match(/(\d+(\.\d+)?)/);
        const amount = amountMatch ? amountMatch[0] : '0';
        return { intent: 'DEPOSIT_USDC', parameters: { amount } };
    }
    return null;
};

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<WalletConnection | null>(null);

  const addMessageToHistory = (sender: 'user' | 'bot', text: string) => {
    setChatHistory(prev => [...prev, { sender, text }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !connection?.signer || !connection.address) return;
    const command = inputValue;
    addMessageToHistory('user', command);
    setInputValue('');
    setIsLoading(true);

    const clientAction = parseClientAction(command);

    if (clientAction) {
        const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, connection.signer);
        const defiGenieContract = new ethers.Contract(DEFIGENIE_CONTRACT_ADDRESS, DEFIGENIE_ABI, connection.signer);

        if (clientAction.intent === 'CHECK_USDC_BALANCE') {
            const balance = await usdcContract.balanceOf(connection.address);
            addMessageToHistory('bot', `Your wallet balance is **${ethers.formatUnits(balance, 6)} USDC**.`);
        } else if (clientAction.intent === 'DEPOSIT_USDC' && clientAction.parameters) {
            const amount = clientAction.parameters.amount;
            const amountInWei = ethers.parseUnits(amount, 6);
            try {
                addMessageToHistory('bot', `Please approve the contract to spend ${amount} USDC...`);
                const approveTx = await usdcContract.approve(DEFIGENIE_CONTRACT_ADDRESS, amountInWei);
                await approveTx.wait();
                addMessageToHistory('bot', `✅ **Approval Successful!** Now, please confirm the deposit.`);
                const depositTx = await defiGenieContract.depositUSDC(amountInWei);
                await depositTx.wait();
                addMessageToHistory('bot', `✅ **Deposit Successful!** ${amount} USDC sent.\n\n**Tx Hash:** ${depositTx.hash}`);
            } catch (error: any) {
                addMessageToHistory('bot', `❌ **Transaction Failed:** ${error.reason || "User rejected."}`);
            }
        }
    } else {
        // Fallback for conversational or premium (x402) commands
        try {
            const response = await fetch('http://localhost:3001/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: command }),
            });
            const data = await response.json();
            addMessageToHistory('bot', data.reply);
        } catch (error) {
            addMessageToHistory('bot', 'Sorry, I had trouble connecting to the backend AI.');
        }
    }
    setIsLoading(false);
  };
  
  const scrollToApp = () => {
    document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <main>
      <section id="hero" className="section">
        <h1 className="hero-title">DeFiGenie</h1>
        <p className="hero-subtitle">Your personal AI agent for an effortless DeFi experience on Base.</p>
        <button onClick={scrollToApp}>Launch App</button>
      </section>

      <section id="problem" className="section">
        <h2>The DeFi Challenge</h2>
        <p>DeFi offers groundbreaking potential, but its complexity hinders widespread adoption.</p>
        <div className="card-container">
          <div className="info-card"><h3>Fragmented Ecosystem</h3><p>Users are forced to manually compare returns across multiple protocols.</p></div>
          <div className="info-card"><h3>High Barriers to Entry</h3><p>Technical jargon and complex commands discourage new users.</p></div>
          <div className="info-card"><h3>Constant Monitoring</h3><p>The need for constant portfolio monitoring is unrealistic for most individuals.</p></div>
        </div>
      </section>

      <section id="impact" className="section">
        <h2>Impact by the Numbers</h2>
        <p>By automating complexity, DeFiGenie delivers tangible results for users.</p>
        <div className="card-container">
            <div className="impact-card"><h3 className="stat">25%</h3><p className="description">Proactively maximize returns.</p></div>
            <div className="impact-card"><h3 className="stat">90%</h3><p className="description">Significantly minimize manual effort.</p></div>
            <div className="impact-card"><h3 className="stat">70%</h3><p className="description">Reduce time spent on management.</p></div>
        </div>
      </section>

      <section id="app" className="section">
         <h2>The Conversational Assistant</h2>
         <p>Simply tell the Genie your financial goal, and let the AI handle the complex execution.</p>
         <div className="app-container">
            <div className="header">
                <h1>DeFiGenie</h1>
                <ConnectWallet onConnection={setConnection} />
            </div>
            <div className="chat-container">
                {!connection?.address && (
                  <div className="chat-message bot"><ReactMarkdown>Please connect your wallet to get started.</ReactMarkdown></div>
                )}
                {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                ))}
                {isLoading && <div className="chat-message bot"><pre><i>Genie is thinking...</i></pre></div>}
            </div>
            <div className="input-container">
                <input 
                    type="text" 
                    placeholder={connection?.address ? "e.g., deposit 10 usdc" : "Please connect your wallet to start"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading || !connection?.address}
                />
                <button onClick={handleSendMessage} disabled={isLoading || !connection?.address}>Send</button>
            </div>
         </div>
      </section>
    </main>
  );
}