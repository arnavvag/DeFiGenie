// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract DeFiGenie {
    IERC20 public usdcToken;
    // Base Sepolia Testnet USDC address
    address constant USDC_ADDRESS = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    event DepositUSDC(address indexed from, uint256 amount);

    constructor() {
        usdcToken = IERC20(USDC_ADDRESS);
    }

    function depositUSDC(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        // The user must first approve the contract to spend their USDC.
        // Our frontend will handle this two-step (approve/deposit) process.
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed. Check approval amount.");
        emit DepositUSDC(msg.sender, amount);
    }

    function getContractUSDCBalance() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}