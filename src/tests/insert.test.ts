import { buildPoseidon, newMemEmptyTrie, Poseidon, SMT } from "circomlibjs";
import * as snarkjs from "snarkjs";
import { convertSiblings } from "./utils";

describe("Doctor merkle tree insertion", () => {
  let tree: SMT;
  let poseidon: Poseidon;

  beforeAll(async () => {
    poseidon = await buildPoseidon();
  });

  beforeEach(async () => {
    tree = await newMemEmptyTrie();
  });

  it("should create a proof when inserting a new leaf to an empty tree", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: 0,
        oldValue: 0,
        isOld0: 1,
        newValue: tree.F.toObject(hashedValue),
        newKey: key
      },
      "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
      "build/doctor_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(2);
  });

  it("should create a proof when inserting a new leaf to a non-empty tree", async () => {
    const oldKey = 0;
    const oldValue = 42;
    const oldHashedValue = poseidon([oldValue]);
    await tree.insert(oldKey, oldHashedValue);

    const key = 1;
    const value = 43;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: oldKey,
        oldValue: tree.F.toObject(oldHashedValue),
        isOld0: 0,
        newValue: tree.F.toObject(hashedValue),
        newKey: key
      },
      "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
      "build/doctor_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(2);
  });

  it("should fail to create a proof when inserting a new leaf to an empty tree with invalid parameters", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: 0,
          oldValue: 0,
          isOld0: 1,
          newValue: tree.F.toObject(hashedValue),
          newKey: key + 1
        },
        "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
        "build/doctor_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when inserting a new leaf to a non-empty tree with invalid parameters", async () => {
    const oldKey = 0;
    const oldValue = 42;
    const oldHashedValue = poseidon([oldValue]);
    await tree.insert(oldKey, oldHashedValue);

    const key = 1;
    const value = 43;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: oldKey,
          oldValue: tree.F.toObject(oldHashedValue),
          isOld0: 0,
          newValue: tree.F.toObject(hashedValue),
          newKey: key + 1
        },
        "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
        "build/doctor_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });
});

describe("Prescription merkle tree insertion", () => {
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

  it("should create a proof when inserting a new leaf to an empty tree with a valid doctor", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: 0,
        oldValue: 0,
        isOld0: 1,
        newKey: key,
        newValue: tree.F.toObject(hashedValue),
        doctorRoot: doctorTree.F.toObject(doctorTree.root),
        doctorSiblings: doctorSiblings,
        doctorKey: doctorKey,
        doctorValue: hashedDoctorValue
      },
      "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
      "build/prescription_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(3);
    expect(publicSignals[0]).toEqual(tree.F.toObject(res.oldRoot).toString());
    expect(publicSignals[1]).toEqual(tree.F.toObject(res.newRoot).toString());
    expect(publicSignals[2]).toEqual(
      doctorTree.F.toObject(doctorTree.root).toString()
    );
  });

  it("should create a proof when inserting a new leaf to a non-empty tree with a valid doctor", async () => {
    const oldKey = 0;
    const oldValue = 42;
    const oldHashedValue = poseidon([oldValue]);
    await tree.insert(oldKey, oldHashedValue);

    const key = 1;
    const value = 43;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        oldRoot: tree.F.toObject(res.oldRoot),
        newRoot: tree.F.toObject(res.newRoot),
        siblings: convertSiblings(tree, res.siblings),
        oldKey: oldKey,
        oldValue: tree.F.toObject(oldHashedValue),
        isOld0: 0,
        newKey: key,
        newValue: tree.F.toObject(hashedValue),
        doctorRoot: doctorTree.F.toObject(doctorTree.root),
        doctorSiblings: doctorSiblings,
        doctorKey: doctorKey,
        doctorValue: hashedDoctorValue
      },
      "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
      "build/prescription_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(3);
    expect(publicSignals[0]).toEqual(tree.F.toObject(res.oldRoot).toString());
    expect(publicSignals[1]).toEqual(tree.F.toObject(res.newRoot).toString());
    expect(publicSignals[2]).toEqual(
      doctorTree.F.toObject(doctorTree.root).toString()
    );
  });

  it("should fail to create a proof when inserting a new leaf to an empty tree with an invalid doctor", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: 0,
          oldValue: 0,
          isOld0: 1,
          newKey: key,
          newValue: tree.F.toObject(hashedValue),
          doctorRoot: doctorTree.F.toObject(doctorTree.root),
          doctorSiblings: doctorSiblings,
          doctorKey: 10,
          doctorValue: 43
        },
        "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
        "build/prescription_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when inserting a new leaf to a non-empty tree with an invalid doctor", async () => {
    const oldKey = 0;
    const oldValue = 42;
    const oldHashedValue = poseidon([oldValue]);
    await tree.insert(oldKey, oldHashedValue);

    const key = 1;
    const value = 43;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: oldKey,
          oldValue: tree.F.toObject(oldHashedValue),
          isOld0: 0,
          newKey: key,
          newValue: tree.F.toObject(hashedValue),
          doctorRoot: doctorTree.F.toObject(doctorTree.root),
          doctorSiblings: doctorSiblings,
          doctorKey: 10,
          doctorValue: 43
        },
        "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
        "build/prescription_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });

  it("should fail to create a proof when inserting a new leaf to an empty tree with invalid parameters", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: 0,
          oldValue: 0,
          isOld0: 1,
          newKey: key + 1,
          newValue: tree.F.toObject(hashedValue),
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

  it("should fail to create a proof when inserting a new leaf to a non-empty tree with invalid parameters", async () => {
    const oldKey = 0;
    const oldValue = 42;
    const oldHashedValue = poseidon([oldValue]);
    await tree.insert(oldKey, oldHashedValue);

    const key = 1;
    const value = 43;
    const hashedValue = poseidon([value]);

    const res = await tree.insert(key, hashedValue);

    await expect(
      snarkjs.groth16.fullProve(
        {
          oldRoot: tree.F.toObject(res.oldRoot),
          newRoot: tree.F.toObject(res.newRoot),
          siblings: convertSiblings(tree, res.siblings),
          oldKey: oldKey,
          oldValue: tree.F.toObject(oldHashedValue),
          isOld0: 0,
          newKey: key + 1,
          newValue: tree.F.toObject(hashedValue),
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
});
