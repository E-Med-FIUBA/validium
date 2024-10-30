import { Provider } from "zksync-ethers"; // or you can also use ethers.JsonRpcProvider
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first! - Solidity Project
import * as ContractArtifact from "../artifacts-zk/contracts/RootManager.sol/RootManager.json";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// Address of the contract on ZKsync testnet
const CONTRACT_ADDRESS = "0x923267788526Ce2F9E295327c6Ba9C980067081A";

if (!CONTRACT_ADDRESS) throw "⛔️ Contract address not provided";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Initialize the provider.
  const provider = new Provider(hre.userConfig.networks?.zkSyncTestnet?.url);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  // Initialise contract instance
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ContractArtifact.abi,
    signer
  );

  console.log("Doctor merkle root:", await contract.doctorsMerkleRoot());
  console.log("Prescription merkle root:", await contract.prescriptionsMerkleRoot());

  await contract.reset({
    gasLimit: 1000000,
  });

  // Call the contract
  const doctorsRoot = await contract.doctorsMerkleRoot();
  const prescriptionsRoot = await contract.prescriptionsMerkleRoot();
  console.log(`The prescriptions merkle root is ${prescriptionsRoot}`);
  console.log(`The doctors merkle root is ${doctorsRoot}`);
}