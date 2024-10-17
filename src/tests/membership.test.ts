import { buildPoseidon, newMemEmptyTrie, Poseidon, SMT } from "circomlibjs";
import * as snarkjs from "snarkjs";
import { convertSiblings } from "./utils";

describe("Merkle tree membership proof", () => {
  let tree: SMT;
  let poseidon: Poseidon;

  beforeAll(async () => {
    poseidon = await buildPoseidon();
  });

  beforeEach(async () => {
    tree = await newMemEmptyTrie();
  });

  it("should create a proof when proving membership of a leaf in a non-empty tree", async () => {
    const key = 0;
    const value = 42;
    const hashedValue = poseidon([value]);

    await tree.insert(key, hashedValue);
    const res = await tree.find(key);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        root: tree.F.toObject(tree.root),
        siblings: convertSiblings(tree, res.siblings),
        key: key,
        value: tree.F.toObject(hashedValue)
      },
      "build/merkle_inclusion_validation/merkle_inclusion_validation_js/merkle_inclusion_validation.wasm",
      "build/merkle_inclusion_validation/circuit_final.zkey"
    );

    expect(proof).toBeDefined();
    expect(publicSignals).toHaveLength(3);
    expect(publicSignals[0]).toEqual(tree.F.toString(tree.root));
    expect(publicSignals[1]).toEqual(key.toString());
    expect(publicSignals[2]).toEqual(tree.F.toString(hashedValue));
  });
});
