import { buildPoseidon, newMemEmptyTrie } from "circomlibjs";

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

const convertSiblings = (trie: any, siblings: any[]) => {
  let result = []
  for (let i = 0; i < siblings.length; i++) result.push(trie.F.toObject(siblings[i]));
  // while (result.length < 10) result.push(0);
  return result
}

async function main() {
  const trie = await newMemEmptyTrie();
  const poseidon = await buildPoseidon();
  const leafs = [1, 2, 3, 4].map((x) => poseidon([x]));

  // Insert the first two leaves
  await trie.insert(0, leafs[0]);
  await trie.insert(1, leafs[1]);
  // await trie.insert(2, leafs[2]);
  
  // Display the whole trie
  const root = await trie.root;
  console.log("Root: ", trie.F.toObject(root));

  // Display all the nodes
  // const nodes = await trie.db.nodes;
  // console.log("Nodes: ", nodes);
  // for (const node of nodes) {
  //   console.log("Node: ", node.toString());
  // }

  const leaf0 = await trie.find(0);
  console.log("Leaf 0: ", trie.F.toObject(leaf0.foundValue), convertSiblings(trie, leaf0.siblings));

  const leaf1 = await trie.find(1);
  console.log("Leaf 1: ", trie.F.toObject(leaf1.foundValue), convertSiblings(trie, leaf1.siblings));

  const nodes = await trie.db.nodes;
  Object.keys(nodes).forEach((key) => {
    const values = nodes[key].map((node: any) => trie.F.toObject(node));
    console.log(key, values);
  });
}

main();


//            11843
//     86411           10071
// 18586 1 0        1  1   864598