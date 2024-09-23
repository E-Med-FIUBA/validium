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

  const txDoctorCreate = await contract.updateDoctorsMerkleRoot(
    "0x0cfff6ce299384e0b7c785dd9e40ab62a9b8d737e37aac721a28201d7097d6aa",
    [
      "0x1afca0bc36ebeaa5dc76c52b454bb67fe5888fef8e8e07ad44cb260b4f9f4e93",
      "0x2d65a2fd40c2150654a8f36fe124d079c00c6baf4288a5599a34e577c2ed1a2b"
    ],
    [
      [
        "0x1167d3f7673676a8e09184d524bacf3a03a9ed9155bef35fca42bc4dade6736e",
        "0x2f44d44af763dcd450863665a6ff2963f9f46c63d0500ea9f73683311876324b"
      ],
      [
        "0x13286d11afece38aacae45212631ae9fb9615ecbbcd7ff9518c2c19c98ae8fdb",
        "0x2a1186f9b0873d071fbe973632e319598c27d4dc1c69fac7ec4298836a14df78"
      ]
    ],
    [
      "0x24378d2cf2a66719285447ae24de7f9f87c695723bbfda515f15996fd1f183cb",
      "0x13a9db5d5a77792d17689c90d876147c0363e75f782657b46ad33c8c618f34df"
    ]
  );
  await txDoctorCreate.wait();
  console.log(
    "Updated doctor merkle root:",
    await contract.doctorsMerkleRoot()
  );

  // Send message to contract
  const txSend = await contract.updatePrescriptionsMerkleRoot(
    "0x1494941975a4dd6ab1f73be17eece1ed4d29ccd7a1cfa815f7cf3ca5284da8ae",
    [
      "0x13dc839af05326716360f95a723fbfbbfc5edfb34d6916884aef05f6fe02ca27",
      "0x1159b8c3ee505acceac5acc6571ce00ed6f6e066dc273b20bd5c338f242f808f"
    ],
    [
      [
        "0x2c5c07592c6495b5a18a9bba6b98f282e1a063d99da398b059656bc48b1f690a",
        "0xefa2e11f080c992f1907c762092d8fbffe765c201d96189639bd0f11fe4291"
      ],
      [
        "0x135930c2deb406fb413c11c94f450c386526fd143521a242f1a92de88e137ce1",
        "0x57aa0f3c83e38dddca6dfe46668b232978b02f4540a84fc7a6f7aaaa447f470"
      ]
    ],
    [
      "0x18a90e8eeced9d0700d6985387c32b43700eb5d407f558f00126daf103b16af7",
      "0x2642c880aa1f1201b1e1ac40e2c08b4e7861dc596600cceb93a2264926badfb9"
    ]
  );
  console.log(`Transaction to send message is ${txSend.hash}`);
  await txSend.wait();

  // Call the contract
  const root = await contract.prescriptionsMerkleRoot();
  console.log(`The balances merkle root is ${root}`);
}
