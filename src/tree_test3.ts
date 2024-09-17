import { MerkleTree } from "merkletreejs";
import { createHash } from "crypto";
import { buildPoseidon } from "circomlibjs";
import { plonk } from "snarkjs";

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

async function main() {
  const poseidon = await buildPoseidon();

  const poseidonHash = (inputs: number[]) => {
    const hash = poseidon(inputs.map(MerkleTree.bigNumberify as any));
    const bn = MerkleTree.bigNumberify(poseidon.F.toString(hash));
    return MerkleTree.bufferify(bn);
  };

  const leaves = [1, 2, 3, 4].map((x) => poseidonHash([x]));
  const tree = new MerkleTree(leaves, poseidonHash, {
    concatenator: (hashes) => hashes,
  });
  const root = toHexString(tree.getRoot());
  const leaf = toHexString(poseidonHash([2]));
  const proof = tree.getProof(leaf);
  console.log(tree.verify(proof, leaf, root)); // true

  const badLeaves = [1, 5, 3].map((x) => poseidonHash([x]));
  const badTree = new MerkleTree(badLeaves, poseidonHash, {
    concatenator: (hashes) => hashes,
  });
  const badLeaf = toHexString(poseidonHash([5]));
  const badProof = badTree.getProof(badLeaf);
  console.log(badTree.verify(badProof, badLeaf, root)); // false

  console.log(tree.toString());
  tree.addLeaf(poseidonHash([5]));
  console.log(tree.toString());
  
}
main();
