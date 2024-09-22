import { Provider } from "zksync-ethers"; // or you can also use ethers.JsonRpcProvider
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first! - Solidity Project
import * as ContractArtifact from "../artifacts-zk/contracts/Test.sol/Test.json";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// Address of the contract on ZKsync testnet
const CONTRACT_ADDRESS = "0x1E203c6dB4674906d4B4a47B3ef41576a0E71283";

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

  // Send message to contract
  const txSend = await contract.updateBalancesMerkleRoot(
    "0x2be3e5127929ebdae9318227d3d19feac6cef35813fc88a21812f5039389b48b",
    [
      "0x29ed097ec927465efbe342553ef4a4c2529b62d660ffe3ae02ee48c99e24a3ef",
      "0x266f9174d7f4611b8d1ceeec3cedc4bc47edf283a418fae2487890d8d32045ac"
    ],
    [
      [
        "0x26449fb95cc6edaefaca8a8139b0875f0f2c1227e1df2f646d61afc60fe6e63c",
        "0x2a0989f0d2051d8ef58bfab44961ea719f41ceb431ed67f6e6b13c00ddb52f7a"
      ],
      [
        "0x2b029ca247391bb3c952438e0992ebd6a9dbd94fbc0ddf100fa90e1218b8b488",
        "0x11c5619adf9804262d00a44f37d3451ed60519046076039721e7fb24410f3a8e"
      ]
    ],
    [
      "0x2f65fc72c17840729c2e31e4bef04ed9c666ff83009debe4ebdd3ff2f1d931c9",
      "0x193661f6224b59cdb70a14cc3e02f26257533e543523f74a9e9208aeb1721f4"
    ]
  );
  console.log(`Transaction to send message is ${txSend.hash}`);
  await txSend.wait();
  
  // Call the contract
  const root = await contract.balancesMerkleRoot();
  console.log(`The balances merkle root is ${root}`);
}
