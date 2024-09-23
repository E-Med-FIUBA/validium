// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PrescriptionVerifier.sol";
import "./DoctorVerifier.sol";

contract Test {
    // Roots for different Merkle trees
    bytes32 public doctorsMerkleRoot;
    bytes32 public prescriptionsMerkleRoot;

    PrescriptionVerifier prescriptionVerifier;
    DoctorVerifier doctorsVerifier;

    // Event emitted when any Merkle root is updated
    event DoctorsMerkleRootUpdated(bytes32 newRoot);
    event PrescriptionsMerkleRootUpdated(bytes32 newRoot);

    constructor() {
        prescriptionVerifier = new PrescriptionVerifier();
        doctorsVerifier = new DoctorVerifier();
        doctorsMerkleRoot = bytes32(0);
        prescriptionsMerkleRoot = bytes32(0);
    }

    // Update the doctors Merkle tree with a zk-SNARK proof
    function updateDoctorsMerkleRoot(
        bytes32 newRoot,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c
    ) external {
        uint256[2] memory inputs = [uint256(doctorsMerkleRoot), uint256(newRoot)];
        require(
            doctorsVerifier.verifyProof(a, b, c, inputs),
            "Invalid proof for doctors"
        );
        doctorsMerkleRoot = newRoot;
        emit DoctorsMerkleRootUpdated(newRoot);
    }

    // Update the prescriptions Merkle tree with a zk-SNARK proof
    function updatePrescriptionsMerkleRoot(
        bytes32 newRoot,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c
    ) external {
        uint256[3] memory inputs = [
            uint256(prescriptionsMerkleRoot),
            uint256(newRoot),
            uint256(doctorsMerkleRoot)
        ];
        require(
            prescriptionVerifier.verifyProof(a, b, c, inputs),
            "Invalid proof for prescriptions"
        );
        prescriptionsMerkleRoot = newRoot;
        emit PrescriptionsMerkleRootUpdated(newRoot);
    }
}
