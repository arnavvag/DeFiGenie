// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // 1. Get the contract factory for our DeFiGenie contract
  const DeFiGenie = await hre.ethers.getContractFactory("DeFiGenie");

  // 2. Deploy the contract
  console.log("Deploying DeFiGenie...");
  const deFiGenie = await DeFiGenie.deploy();

  // 3. Wait for the deployment to be confirmed on the network
  await deFiGenie.deployed();

  // 4. Print the address of the deployed contract
  console.log(`DeFiGenie deployed to: ${deFiGenie.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});