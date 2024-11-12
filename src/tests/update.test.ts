import { buildPoseidon, newMemEmptyTrie, Poseidon, SMT } from "circomlibjs";
import * as snarkjs from "snarkjs";
import { convertSiblings } from "./utils";

describe("Doctor merkle tree update", () => {
  let tree: SMT;
  let poseidon: Poseidon;

  beforeAll(async () => {
    poseidon = await buildPoseidon();
  });

  beforeEach(async () => {
    tree = await newMemEmptyTrie();
  });

  it("should fail to create a proof when updating a leaf in a non-empty tree", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const newValue = 50;
    const newHashedValue = poseidon([newValue]);

    await tree.insert(key, hashedValue);
    const res = await tree.update(key, newHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: key,
          oldValue: tree.F.toObject(hashedValue),
          isOld0: 0,
          newValue: tree.F.toObject(newHashedValue),
          newKey: key
        },
        "build/update_validation/update_validation_js/update_validation.wasm",
        "build/update_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });
});

describe("Prescription merkle tree update", () => {
  let tree: SMT;
  let doctorTree: SMT;
  let poseidon: Poseidon;

  let doctorKey: number;
  let doctorValue: number;
  let hashedDoctorValue: bigint;
  let doctorSiblings: bigint[];

  beforeAll(async () => {
    poseidon = await buildPoseidon();

    doctorTree = await newMemEmptyTrie();
    doctorKey = 0;
    doctorValue = 1234;
    const aux = poseidon([doctorValue]);
    hashedDoctorValue = doctorTree.F.toObject(aux);

    const res = await doctorTree.insert(doctorKey, aux);
    doctorSiblings = convertSiblings(doctorTree, res.siblings);
  });

  beforeEach(async () => {
    tree = await newMemEmptyTrie();
  });

  it("should fail to create a proof when updating a leaf in a non-empty tree", async () => {
    const key = 0;
    const value = 9876;
    const hashedValue = poseidon([value]);

    const newValue = 60;
    const newHashedValue = poseidon([newValue]);

    await tree.insert(key, hashedValue);
    const res = await tree.update(key, newHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: key,
          oldValue: tree.F.toObject(hashedValue),
          isOld0: 1,
          newValue: tree.F.toObject(newHashedValue),
          newKey: key,
          doctorRoot: doctorTree.F.toObject(doctorTree.root),
          doctorSiblings: doctorSiblings,
          doctorKey: doctorKey,
          doctorValue: hashedDoctorValue
        },
        "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
        "build/prescription_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  const hashPrescription = (prescription: {
    id: number;
    doctorId: number;
    presentationId: number;
    patientId: number;
    quantity: number;
    emitedAt: number;
    isUsed: number;
  }) => {
    return poseidon([
      prescription.id,
      prescription.doctorId,
      prescription.presentationId,
      prescription.patientId,
      prescription.quantity,
      prescription.emitedAt,
      prescription.isUsed
    ]);
  };

  it("should create a proof when updating isUsed on a prescription when it is the only one in the tree", async () => {
    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 3,
      emitedAt: 28,
      isUsed: 0
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      isUsed: 1
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: tree.F.toObject(res.oldKey),
        oldValue: tree.F.toObject(res.oldValue),
        key: key,
        doctorId: updatedValue.doctorId,
        presentationId: updatedValue.presentationId,
        patientId: updatedValue.patientId,
        quantity: updatedValue.quantity,
        emitedAt: updatedValue.emitedAt
      },
      "build/update_validation/update_validation_js/update_validation.wasm",
      "build/update_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(2);
  });

  it("should create a proof when updating isUsed on a prescription when it is not the only one in the tree", async () => {
    await tree.insert(10, poseidon([1])); // Insert a random value to make sure the tree is not empty

    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 3,
      emitedAt: 28,
      isUsed: 0
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      isUsed: 1
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: tree.F.toObject(res.oldKey),
        oldValue: tree.F.toObject(res.oldValue),
        key: key,
        doctorId: updatedValue.doctorId,
        presentationId: updatedValue.presentationId,
        patientId: updatedValue.patientId,
        quantity: updatedValue.quantity,
        emitedAt: updatedValue.emitedAt
      },
      "build/update_validation/update_validation_js/update_validation.wasm",
      "build/update_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(2);
  });

  it("should fail to create a proof for an already used prescription", async () => {
    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 3,
      emitedAt: 28,
      isUsed: 1
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      isUsed: 1
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: tree.F.toObject(res.oldKey),
          oldValue: tree.F.toObject(res.oldValue),
          key: key,
          doctorId: updatedValue.doctorId,
          presentationId: updatedValue.presentationId,
          patientId: updatedValue.patientId,
          quantity: updatedValue.quantity,
          emitedAt: updatedValue.emitedAt
        },
        "build/update_validation/update_validation_js/update_validation.wasm",
        "build/update_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when updating any other prescription field that is not isUsed for an unused prescription", async () => {
    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 3,
      emitedAt: 28,
      isUsed: 0
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      quantity: 5 // Changed this value
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: tree.F.toObject(res.oldKey),
          oldValue: tree.F.toObject(res.oldValue),
          key: key,
          doctorId: updatedValue.doctorId,
          presentationId: updatedValue.presentationId,
          patientId: updatedValue.patientId,
          quantity: updatedValue.quantity,
          emitedAt: updatedValue.emitedAt
        },
        "build/update_validation/update_validation_js/update_validation.wasm",
        "build/update_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when updating any other prescription field that is not isUsed for a used prescription", async () => {
    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 5,
      emitedAt: 28,
      isUsed: 1
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      presentationId: 25 // Changed this value
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: tree.F.toObject(res.oldKey),
          oldValue: tree.F.toObject(res.oldValue),
          key: key,
          doctorId: updatedValue.doctorId,
          presentationId: updatedValue.presentationId,
          patientId: updatedValue.patientId,
          quantity: updatedValue.quantity,
          emitedAt: updatedValue.emitedAt
        },
        "build/update_validation/update_validation_js/update_validation.wasm",
        "build/update_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when updating the isUsed field and any other field for an unused prescription", async () => {
    const key = 1;
    const value = {
      id: 1,
      doctorId: 24,
      presentationId: 15,
      patientId: 12,
      quantity: 3,
      emitedAt: 28,
      isUsed: 0
    };
    const hashedValue = hashPrescription(value);
    await tree.insert(key, hashedValue);

    const updatedValue = {
      ...value,
      quantity: 5, // Changed this value
      isUsed: 1
    };

    const updatedHashedValue = hashPrescription(updatedValue);
    const res = await tree.update(key, updatedHashedValue);

    expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: tree.F.toObject(res.oldKey),
          oldValue: tree.F.toObject(res.oldValue),
          key: key,
          doctorId: updatedValue.doctorId,
          presentationId: updatedValue.presentationId,
          patientId: updatedValue.patientId,
          quantity: updatedValue.quantity,
          emitedAt: updatedValue.emitedAt
        },
        "build/update_validation/update_validation_js/update_validation.wasm",
        "build/update_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });
});
