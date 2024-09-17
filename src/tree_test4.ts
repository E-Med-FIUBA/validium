import { MerkleTree } from "merkletreejs";
import { buildPoseidon } from "circomlibjs";

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

async function main() {
  const poseidon = await buildPoseidon();
  const poseidonHash = (inputs: number[] | Uint8Array[]) => {
    let hash;
    if (inputs[0] instanceof Uint8Array) {
      hash = poseidon(inputs);
    } else {
      hash = poseidon(inputs.map(MerkleTree.bigNumberify as any));
    }
    const bn = MerkleTree.bigNumberify(poseidon.F.toString(hash));
    return MerkleTree.bufferify(bn);
  };

  const leaves = [1, 2, 3, 4].map((x) => poseidonHash([x]));
  // Hash the first two leaves
  const leaf1 = leaves[0];
  const leaf2 = leaves[1];
  const hash1 = poseidonHash([leaf1, leaf2]);
  console.log("Hash1: ", leaf1.toString("hex"));
  console.log("Hash2: ", leaf2.toString("hex"));
  console.log("Hash1,2: ", hash1.toString("hex"));

  const tree = new MerkleTree(leaves, poseidonHash, {
    concatenator: (hashes) => hashes // don't Buffer.concat, just return node list, ie [hashA, hashB]
  });
  console.log("Tree", tree.toString());
}

main();
