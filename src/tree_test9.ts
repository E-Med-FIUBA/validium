import { newMemEmptyTrie, buildPoseidon, SMT } from "circomlibjs";
import * as snarkjs from "snarkjs";

interface Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
}

const parseProof = (proof: Proof) => ({
  pi_a: proof.pi_a.map((x) => "0x" + BigInt(x).toString(16)).slice(0, -1),
  pi_b: proof.pi_b
    .map((x) => x.map((y) => "0x" + BigInt(y).toString(16)).reverse())
    .slice(0, -1),
  pi_c: proof.pi_c.map((x) => "0x" + BigInt(x).toString(16)).slice(0, -1),
});

async function testInsert(tree: SMT, _key: any, _value: any) {
  const key = tree.F.e(_key);
  const value = tree.F.e(_value);

  await tree.insert(1, 34);
  const res = await tree.insert(key, value);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

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

  console.log("Proof: ", proof);
  console.log("Proof: ", parseProof(proof));
  console.log("Root hex: ", BigInt(tree.F.toString(res.newRoot)).toString(16));
}

async function main() {
  const trie = await newMemEmptyTrie();
  const key = trie.F.e(111);
  const value = trie.F.e(222);

  await testInsert(trie, key, value);
}

main();
