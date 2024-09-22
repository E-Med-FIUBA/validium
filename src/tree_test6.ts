import { newMemEmptyTrie, buildPoseidon } from "circomlibjs";
import * as snarkjs from "snarkjs";

const convertSiblings = (trie: any, siblings: any[]) => {
  let result = [];
  for (let i = 0; i < siblings.length; i++)
    result.push(trie.F.toObject(siblings[i]));
  while (result.length < 4) result.push(0);
  return result;
};

async function main() {
  const trie = await newMemEmptyTrie();
  const poseidon = await buildPoseidon();
  const leafs = [1, 2, 3, 4].map((x) => poseidon([x]));

  await trie.insert(0, leafs[0]);

  const res = await trie.insert(1, leafs[1]);
  console.log(trie.F.e(1), res);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      fnc: [1, 0],
      oldRoot: trie.F.toObject(res.oldRoot),
      newRoot: trie.F.toObject(res.newRoot),
      siblings: convertSiblings(trie, res.siblings),
      oldKey: res.isOld0 ? 0 : trie.F.toObject(res.oldKey),
      oldValue: res.isOld0 ? 0 : trie.F.toObject(res.oldValue),
      isOld0: res.isOld0 ? 1 : 0,
      newValue: trie.F.toObject(leafs[1]),
      newKey: trie.F.toObject(trie.F.e(1)),
    },
    "build/prescription_validation_js/prescription_validation.wasm",
    "build/circuit_final.zkey"
  );
  console.log(proof, publicSignals);
}

main();
