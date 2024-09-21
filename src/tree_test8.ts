import { newMemEmptyTrie, buildPoseidon, SMT } from "circomlibjs";
import * as snarkjs from "snarkjs";

const convertSiblings = (tree: any, siblings: any[]) => {
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);
  return siblings;
};

async function testInsert(tree: SMT, _key: any, _value: any) {
  const key = tree.F.e(_key);
  const value = tree.F.e(_value);

  const res0 = await tree.insert(1, 34);
  const res = await tree.insert(key, value);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  const { proof: proof0, publicSignals: publicSignals0 } =
    await snarkjs.groth16.fullProve(
      {
        fnc: [1, 0],
        oldRoot: tree.F.toObject(res0.oldRoot),
        newRoot: tree.F.toObject(res0.newRoot),
        siblings: convertSiblings(tree, res0.siblings),
        oldKey: res0.isOld0 ? 0 : tree.F.toObject(res0.oldKey),
        oldValue: res0.isOld0 ? 0 : tree.F.toObject(res0.oldValue),
        isOld0: res0.isOld0 ? 1 : 0,
        newKey: tree.F.toObject(tree.F.e(1)),
        newValue: tree.F.toObject(tree.F.e(34)),
      },
      "build/prescription_validation_js/prescription_validation.wasm",
      "build/circuit_final.zkey"
    );

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      fnc: [1, 0],
      oldRoot: tree.F.toObject(res.oldRoot),
      newRoot: tree.F.toObject(res.newRoot),
      siblings: siblings,
      oldKey: res.isOld0 ? 0 : tree.F.toObject(res.oldKey),
      oldValue: res.isOld0 ? 0 : tree.F.toObject(res.oldValue),
      isOld0: res.isOld0 ? 1 : 0,
      newKey: tree.F.toObject(key),
      newValue: tree.F.toObject(value),
    },
    "build/prescription_validation_js/prescription_validation.wasm",
    "build/circuit_final.zkey"
  );

  console.log("Proof: ", proof, proof0);
}

async function main() {
  const trie = await newMemEmptyTrie();
  const key = trie.F.e(111);
  const value = trie.F.e(222);

  await testInsert(trie, key, value);
}

main();
