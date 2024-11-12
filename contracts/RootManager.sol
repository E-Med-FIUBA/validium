// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PrescriptionVerifier.sol";
import "./DoctorVerifier.sol";
import "./MerkleInclusionVerifier.sol";
import "./UpdateVerifier.sol";

contract RootManager {
  address public admin;

  // Roots for different Merkle trees
  bytes32 public doctorsMerkleRoot;
  bytes32 public prescriptionsMerkleRoot;

  PrescriptionVerifier prescriptionVerifier;
  DoctorVerifier doctorsVerifier;
  MerkleInclusionVerifier merkleInclusionVerifier;
  UpdateVerifier updateVerifier;

  // Event emitted when any Merkle root is updated
  event DoctorsMerkleRootUpdated(bytes32 newRoot);
  event PrescriptionsMerkleRootUpdated(bytes32 newRoot);

  constructor() {
    admin = msg.sender;
    prescriptionVerifier = new PrescriptionVerifier();
    doctorsVerifier = new DoctorVerifier();
    merkleInclusionVerifier = new MerkleInclusionVerifier();
    updateVerifier = new UpdateVerifier();
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

  // Verify that a prescription is included in the Merkle tree
  function verifyPrescriptionInclusion(
    bytes32 key,
    bytes32 value,
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c
  ) external view returns (bool) {
    uint256[3] memory inputs = [
      uint256(prescriptionsMerkleRoot),
      uint256(key),
      uint256(value)
    ];
    return merkleInclusionVerifier.verifyProof(a, b, c, inputs);
  }

  // Verify that a doctor is included in the Merkle tree
  function verifyDoctorInclusion(
    bytes32 key,
    bytes32 value,
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c
  ) external view returns (bool) {
    uint256[3] memory inputs = [
      uint256(doctorsMerkleRoot),
      uint256(key),
      uint256(value)
    ];
    return merkleInclusionVerifier.verifyProof(a, b, c, inputs);
  }

  function verifyMarkAsUsed(
    bytes32 newRoot,
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c
  ) external {
    uint256[2] memory inputs = [
      uint256(prescriptionsMerkleRoot),
      uint256(newRoot)
    ];
    
    require(
      updateVerifier.verifyProof(a, b, c, inputs),
      "Invalid proof for mark as used"
    );

    prescriptionsMerkleRoot = newRoot;
  }

  // Reset the Merkle trees
  function reset() external {
    require(msg.sender == admin, "Only admin can reset");
    doctorsMerkleRoot = bytes32(0);
    prescriptionsMerkleRoot = bytes32(0);
  }

  function resetDoctorsMerkleRoot() external {
    require(msg.sender == admin, "Only admin can reset");
    doctorsMerkleRoot = bytes32(0);
  }

  function resetPrescriptionsMerkleRoot() external {
    require(msg.sender == admin, "Only admin can reset");
    prescriptionsMerkleRoot = bytes32(0);
  }
}
