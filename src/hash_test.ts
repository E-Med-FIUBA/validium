import { newMemEmptyTrie, buildPoseidon } from "circomlibjs";
import { poseidon1, poseidon2, poseidon3 } from "poseidon-lite";
// import { getCurveFromName, Scalar } from "ffjavascript";

export default async function getHashes(F: any) {
  // const bn128 = await getCurveFromName("bn128", true);
  const poseidon = await buildPoseidon();
  return {
    hash0: function (left: any, right: any) {
      return poseidon2([left, right]);
    },
    hash1: function (key: any, value: any) {
      return poseidon3([key, value, BigInt(1)]);
    }
  };
}

const convertSiblings = (trie: any, siblings: any[]) => {
  let result = [];
  for (let i = 0; i < siblings.length; i++)
    result.push(trie.F.toObject(siblings[i]));
  while (result.length < 4) result.push(0);
  return result;
};

// function splitBits(F: any, _key: number) {
//   const res = Scalar.bits(F.toObject(_key));
//   console.log(F.toObject(_key));

//   while (res.length < 256) res.push(false);

//   return res;
// }

async function main() {
  const trie = await newMemEmptyTrie();

  const { hash0, hash1 } = await getHashes(trie.F);
  // const poseidon = await buildPoseidon();
  const leafs = [1, 2, 3, 4, 5].map((x) => poseidon1([x]));

  // console.log("0", keyToBinary(F, 0));
  // console.log("1", keyToBinary(F, 1));
  // console.log("2", keyToBinary(F, 2));
  // console.log("3", keyToBinary(F, 3));
  // console.log("4", keyToBinary(F, 4));

  // The keys are split into bits and processed from right to left

  // console.log(
  //   hash0(
  //     7940457568303634097009515827396537831077756103825079995666614201435649009606,
  //     2112810484179113143911628386100960560665189352257176563315137634177548531087
  //   )
  // );

  await trie.insert(1, leafs[1]); // 100
  await trie.insert(0, leafs[0]); // 000
  const res = await trie.find(1);
  // console.log(trie.F.toObject(trie.root));
  // console.log(trie.F.toObject(hash1(0, leafs[0])));
  // console.log(hash1(0, leafs[0]));

  // console.log(
  //   hash0(
  //     BigInt(
  //       9292251968198688740238013002890106405301758230421437703537974005677083480921
  //     ),
  //     BigInt(
  //       7920922500715015467782292458306708136876612233964735483717790022371990727379
  //     )
  //   )
  // );
  const hr = hash1(
    1,
    1879950265016198736332636814891172352928809558202053546400407039249751799985n
  );
  const hl = hash1(
    2,
    8035129849086717331047094110799752632991161824181296255333241272116745390760n
  );
  console.log("left", hl);
  console.log("right", hr);
  console.log("root", hash0(hl, hr));
  console.log("rootInv", hash0(hr, hl));

  console.log(
    "siblings",
    res.siblings.map((x: any) => trie.F.toObject(x))
  );

  // {
  //   fnc: [ 1, 0 ],
  //   oldRoot: 9987288332386915476669672393439109944649154642571741460312278408908977665968n,
  //   newRoot: 942329436015469664649747189673429775066512250133793982127154879861996177353n,
  //   siblings: [
  //     5053596553433035767346544694077271121082335364287306141828033153671924888233n,
  //     0n,
  //     0n,
  //     0n
  //   ],
  //   oldKey: 2,
  //   oldValue: 3273981992945277909585601930423915716046643587654597158576332528047166160434n,
  //   isOld0: 0,
  //   newKey: 3,
  //   newValue: 2892971033921126803366317438787046526853013964909142377728360821146486299635n
  // }

  const hashedDoc = poseidon3([
    3,
    2892971033921126803366317438787046526853013964909142377728360821146486299635n,
    1n
  ]);

  const s1 = hash0(
    14942639403820827578192231646054909375007924615575063910419729229723246791741n,
    hashedDoc
  );
  const s2 = hash0(
    5053596553433035767346544694077271121082335364287306141828033153671924888233n,
    s1
  );
  // const s3 = hash0(0n, s2);
  // const s4 = hash0(
  //   hashedDoc,
  //   5053596553433035767346544694077271121082335364287306141828033153671924888233n,
  // );
  console.log("doc", hashedDoc);
  console.log("s1", s1);
  console.log("s2", s2);
  // console.log("s3", s3);
  // console.log("root", s4);

  // doctorRoot: 15891810346532835088741803760442729484358972982685630613942043295598250088172n,
  // doctorSiblings: [
  //   16200500202264771859986527463198245797563110337170328134437458937450538080962n,
  //   307356367792394577240352611745388493522890494586113399633388402949874862856n,
  //   14747839754818992170762831009401960816176987485168728204967129095810118803964n,
  //   16928937946662193451758117551566472435410917775667600933550418651010230901830n
  // ],
  // doctorKey: 1,
  // doctorValue: 4268399172919609440509711279397784011159867442661132956396477050379860095842n

  console.log("-------------------");

  await trie.insert(1, leafs[1]); // 100
  // console.log(trie.F.toObject(trie.root));
  // console.log(trie.F.toObject(hash0(hash1(0, leafs[0]), hash1(1, leafs[1]))));

  // const found0 = await trie.find(0);
  // const found1 = await trie.find(1);
  // console.log(found0.siblings.map((x: any) => trie.F.toObject(x)));
  // console.log(found1.siblings.map((x: any) => trie.F.toObject(x)));

  await trie.insert(2, leafs[2]); // 010
  console.log(trie.F.toObject(trie.root));
  console.log(
    hash0(hash0(hash1(0, leafs[0]), hash1(2, leafs[2])), hash1(1, leafs[1]))
  );

  await trie.insert(3, leafs[3]); // 110
  console.log(trie.F.toObject(trie.root));
  console.log(
    hash0(
      hash0(hash1(0, leafs[0]), hash1(2, leafs[2])),
      hash0(hash1(1, leafs[1]), hash1(3, leafs[3]))
    )
  );

  await trie.insert(4, leafs[4]); // 001
  console.log(trie.F.toObject(trie.root));
  console.log(
    hash0(
      hash0(hash0(hash1(0, leafs[0]), hash1(4, leafs[4])), hash1(2, leafs[2])),
      hash0(hash1(1, leafs[1]), hash1(3, leafs[3]))
    )
  );
}

main();

// const res = await trie.insert(0, leafs[0]); // 000
// console.log(trie.F.toObject(trie.root));
// console.log({
//   fnc: [1, 0],
//   oldRoot: trie.F.toObject(res.oldRoot),
//   newRoot: trie.F.toObject(res.newRoot),
//   siblings: convertSiblings(trie, res.siblings),
//   oldKey: res.isOld0 ? 0 : trie.F.toObject(res.oldKey),
//   oldValue: res.isOld0 ? 0 : trie.F.toObject(res.oldValue),
//   isOld0: res.isOld0 ? 1 : 0,
//   newValue: leafs[1],
//   newKey: trie.F.toObject(trie.F.e(1))
// });
