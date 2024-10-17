import { Trie } from "@ethereumjs/trie";
import { bytesToUtf8, MapDB, utf8ToBytes, } from "@ethereumjs/util";
import * as snarkjs from "snarkjs";


async function test() {
  const trie = await Trie.create({ db: new MapDB() });
  await trie.put(utf8ToBytes("test"), utf8ToBytes("one"));
  const value = await trie.get(utf8ToBytes("test"));
  if (!value) {
    return
  }

  console.log(value ? bytesToUtf8(value) : "not found"); // 'one'
  console.log(trie.walkAllNodes(async (a) => console.log(a)));

  // find all siblings of a node
  const siblings = await trie.findPath(utf8ToBytes("test"));
  // get all siblings hashes
  const siblingHashes: string[] = siblings.stack.map((s) => s.value()?.toString()).filter((s) => s !== undefined) as string[];
  console.log(siblingHashes);

  // convert value to bigInt
  const valueBigInt = BigInt(`0x${value.toString()}`);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { 
      oldRoot: 0,
      newRoot: trie.root().toString(),
      siblings: siblingHashes,
      oldValue: 0,
      key: 0,
      isOld0: 1,
      newValue: value.toString(),
      fnc: [1, 0],
     },
    "build/prescription_validation_js/prescription_validation.wasm",
    "build/circuit_final.zkey"
  );
  console.log(publicSignals);
  console.log(proof);
}

test();
