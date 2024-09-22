// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./verifier.sol";

contract Test {
    // Roots for different Merkle trees
    bytes32 public balancesMerkleRoot;
    bytes32 public transactionsMerkleRoot;

    Groth16Verifier verifier;

    // Event emitted when any Merkle root is updated
    event BalancesMerkleRootUpdated(bytes32 newRoot);
    event TransactionsMerkleRootUpdated(bytes32 newRoot);

    constructor() {
        verifier = new Groth16Verifier();
        balancesMerkleRoot = bytes32(0);
        transactionsMerkleRoot = bytes32(0);
    }

    // Update the balances Merkle tree with a zk-SNARK proof
    function updateBalancesMerkleRoot(
        bytes32 newRoot,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external {
        require(
            verifier.verifyProof(a, b, c, input),
            "Invalid proof for balances"
        );
        require(
            bytes32(input[0]) == balancesMerkleRoot,
            "Invalid balances root transition"
        );
        balancesMerkleRoot = newRoot;
        emit BalancesMerkleRootUpdated(newRoot);
    }

    // Update the transactions Merkle tree with a zk-SNARK proof
    function updateTransactionsMerkleRoot(
        bytes32 newRoot,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external {
        require(
            verifier.verifyProof(a, b, c, input),
            "Invalid proof for transactions"
        );
        require(
            bytes32(input[0]) == transactionsMerkleRoot,
            "Invalid transactions root transition"
        );
        transactionsMerkleRoot = newRoot;
        emit TransactionsMerkleRootUpdated(newRoot);
    }
}
