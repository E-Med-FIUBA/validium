import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  zksolc: {
    version: "latest", // Uses latest available in https://github.com/matter-labs/zksolc-bin
    settings: {},
  },
  networks: {
    hardhat: {
      zksync: true,
    },
    zkSyncTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
    },
    localhost: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    },
  },
};

export default config;