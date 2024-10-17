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
  pi_c: proof.pi_c.map((x) => "0x" + BigInt(x).toString(16)).slice(0, -1)
});

async function main() {
  const tree = await newMemEmptyTrie();
  const key = tree.F.e(438760);
  const value = tree.F.e(1000);

  await tree.insert(3, 2124);
  await tree.insert(key, value);
  const res = await tree.find(key);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      root: tree.F.toObject(tree.root),
      siblings: siblings,
      key: tree.F.toObject(key),
      value: tree.F.toObject(value)
    },
    "build/merkle_inclusion_validation/merkle_inclusion_validation_js/merkle_inclusion_validation.wasm",
    "build/merkle_inclusion_validation/circuit_final.zkey"
  );


  console.log(
    {
      root: tree.F.toObject(tree.root),
      siblings: siblings,
      key: tree.F.toObject(key),
      value: tree.F.toObject(value)
    }
  );
  console.log("Root hex: ", BigInt(tree.F.toString(res.newRoot)).toString(16));
  console.log(
    "Old Root hex: ",
    BigInt(tree.F.toString(res.oldRoot)).toString(16)
  );
}

main();
