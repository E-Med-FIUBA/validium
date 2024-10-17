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

    console.log(tree.F.toObject(hashedValue));
    

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
  });

  it("should create a proof when inserting a new leaf to a non-empty tree", async () => {});

  it("should fail to create a proof when inserting a new leaf to a non-empty tree with invalid parameters", async () => {});
});
