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
const CONTRACT_ADDRESS = "0xD1E8010CA82D1383074c82a6F04C99a5ceAAe16F";

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
    "0x1494941975a4dd6ab1f73be17eece1ed4d29ccd7a1cfa815f7cf3ca5284da8ae",
    [
      "0xebbc3bb24017fb5c66b4e1da0cde522e5496acf3b94963cacbcd34bced4360c",
      "0x2f5c2fcb9116f0fb58f900a25ee750257afcdcdac208a29971f33332a6c6bced"
    ],
    [
      [
        "0x1b65becbc1acc2dfe310bab5dfc17e29ec48d49390572d72587545bea9cd0ab8",
        "0x5344ead09364ab073d5a835b10ff80fdc01211d36bb80f0e2e9aeae75f0ab74"
      ],
      [
        "0x29b1fee309e99520255370155c8e61c242d83ff840968dcc4a8e7a374ceea612",
        "0x29007672403eee618948a8d83be6ca13c1f6043b07ad67d564c0ee4aea5376c6"
      ]
    ],
    [
      "0x1a016446debe317d201e91c37d3b84030164a7799b906d041e5005f8dd08dfd1",
      "0x1a434f2aad81f99d127e5832d9147454cab6d4ab85ffec75e0cb4ace527ae882"
    ],
    ["0x0"]
  );
  console.log(`Transaction to send message is ${txSend.hash}`);
  await txSend.wait();

  // Call the contract
  const root = await contract.balancesMerkleRoot();
  console.log(`The balances merkle root is ${root}`);
}
