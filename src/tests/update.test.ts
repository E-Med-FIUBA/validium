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
        "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
        "build/doctor_validation/circuit_final.zkey"
      )
    ).rejects.toThrow();
  });
});

describe("Prescription merkle tree deletion", () => {
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
});
