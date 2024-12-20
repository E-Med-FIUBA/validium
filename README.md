![](https://i.imgur.com/P0aqOMI.jpg)

# Validium

This repository contains code to build Circom circuits and generate Solidity smart contracts to verify the validity of a given proof. It also has a deployment script to deploy the smart contract to the ZKSync network and a test script to test the deployed contract.

The purpose of the contract is to store 2 merkle roots, one for the doctors and one for the prescriptions. Therefore, the contract has the following methods:

- `updateDoctorRoot(bytes32 newRoot, ...)`: Updates the doctor merkle root, verifying that the state transition is valid.
- `updatePrescriptionRoot(bytes32 newRoot, ...)`: Updates the prescription merkle root, verifying that the state transition is valid and that the prescribing doctor is valid (i.e., that the doctor is in the doctor merkle tree).
- `verifyPrescription(bytes32 prescription, ...)`: Verifies that a prescription is valid (i.e., that the prescription is in the prescription merkle tree).
- `verifyDoctor(bytes32 doctor, ...)`: Verifies that a doctor is valid (i.e., that the doctor is in the doctor merkle tree).
- `reset()`: Resets the contract to the initial state (only the owner can call this method).

The contract uses the `DoctorVerifier`, `PrescriptionVerifier`, and `MerkleInclusionVerifier` smart contracts to verify the proofs. These contracts are generated from the corresponding Circom circuits.

As it is a Validium solution, the data is stored off-chain. The only data stored on chain are the merkle roots. The proofs are generated off-chain and sent to the contract to be verified. The contract verifies the proofs and updates the state accordingly.

## Structure

The project is structured as follows:

- `circuits/`: Contains the Circom circuits to be used to generate the proofs.
- `contracts/`: Contains the Solidity smart contract that handles the merkle roots state and the verification of the proofs.
- `deploy/`: Contains the deployment script to deploy the smart contract to the ZKSync network and the test script to test the deployed contract.
- `src/`: Contains some test scripts to generate the proofs.
- `build/`: Contains the output of the Circom circuits compilation. Note that the `build/` folder is not included in the repository as it can be generated by running the `circom-compile` script.

## Installation

This project requires Node.js and npm to be installed as it uses snarkjs to generate the proofs (and circomlibjs for testing purposes). It also uses hardhat to deploy the smart contract and ethers.js to interact with it.

It uses Circom to build the circuits, however, it does so in a docker container so it's not necessary to have it installed locally (you do need to have docker installed).

To install the required packages, simply run the following command:

```bash
npm install
```

## Usage

### Building the circuit

To build the circuit, run the following command:

```bash
./compile-circom.sh
```

This will generate the `build/` folder with the compiled circuits. The compiled circuits will be in the `build/` folder in a subdirectory with the same name as the circuit.

The output directory should look like this:

```
build/
├── doctor_validation
├── merkle_inclusion_validation
└── prescription_validation
```

Inside each of the subdirectories, you will find the compiled circuit, the corresponding keys, and the `verifier` smart contract.

### Compiling the contract

To compile the contract, you should copy the verifier.sol file from each of the subdirectories in the `build/` folder to the `contracts/` folder. You should also rename the file to:

- `DoctorVerifier.sol` for the `doctor_validation` circuit.
- `PrescriptionVerifier.sol` for the `prescription_validation` circuit.
- `MerkleInclusionVerifier.sol` for the `merkle_inclusion_validation` circuit.

Furthermore, in each of the files, you should change the contract name to match the file name. For example, in `DoctorVerifier.sol` you should change the contract name to `DoctorVerifier`.

Then, you can compile the contract by running the following command:

```bash
./compile-contract.sh
```

### Deploying the contract

The first step to deploy the contract is to set the environment variables. Start by copying the `.env.EXAMPLE` file to a new file called `.env`. Then, fill in the values for the environment variables.

Once you have the environment variables set, you can deploy the contract by running the following command:

```bash
./deploy-contract.sh
```

This will deploy the contract to the ZKSync network and output the contract address.
