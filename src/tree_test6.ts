import { newMemEmptyTrie, buildPoseidon } from "circomlibjs";
import * as snarkjs from "snarkjs";


const convertSiblings = (trie: any, siblings: any[]) => {
  let result = []
  for (let i = 0; i < siblings.length; i++) result.push(trie.F.toObject(siblings[i]));
  while (result.length < 4) result.push(0);
  return result
}

async function main() {
  const trie = await newMemEmptyTrie();
  const poseidon = await buildPoseidon();
  const leafs = [1, 2, 3, 4].map((x) => poseidon([x]));

  const insertedLeaf = await trie.insert(0, leafs[0]);
  const root = trie.F.toObject(trie.root);
  const newValue = trie.F.toObject(leafs[0]);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { 
      oldRoot: 0,
      newRoot: root,
      siblings: convertSiblings(trie, insertedLeaf.siblings),
      oldKey: 0,
      oldValue: 0,
      isOld0: 1,
      newKey: 0,
      newValue: newValue,
      fnc: [1, 0],
     },
    "build/prescription_validation_js/prescription_validation.wasm",
    "build/circuit_final.zkey"
  );
  console.log(publicSignals);
  console.log(proof);

}

main();
