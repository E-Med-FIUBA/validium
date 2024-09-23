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

async function main() {
  const tree = await newMemEmptyTrie();
  const _key = tree.F.e(111);
  const _value = tree.F.e(222);

  const key = tree.F.e(_key);
  const value = tree.F.e(_value);


  const doctorTree = await newMemEmptyTrie();
  const doctorKey = doctorTree.F.e(438760);
  const doctorValue = doctorTree.F.e(1000);

  const doctorCreationRes = await doctorTree.insert(doctorKey, doctorValue);
  let doctorSiblings = doctorCreationRes.siblings;
  for (let i = 0; i < doctorSiblings.length; i++)
    doctorSiblings[i] = doctorTree.F.toObject(doctorSiblings[i]);
  while (doctorSiblings.length < 4) doctorSiblings.push(0);

  const { proof: doctorProof, publicSignals: doctorPublicSignals } = await snarkjs.groth16.fullProve(
    {
      fnc: [1, 0],
      oldRoot: tree.F.toObject(doctorCreationRes.oldRoot),
      newRoot: tree.F.toObject(doctorCreationRes.newRoot),
      siblings: doctorSiblings,
      oldKey: doctorCreationRes.isOld0 ? 0 : tree.F.toObject(doctorCreationRes.oldKey),
      oldValue: doctorCreationRes.isOld0 ? 0 : tree.F.toObject(doctorCreationRes.oldValue),
      isOld0: doctorCreationRes.isOld0 ? 1 : 0,
      newKey: tree.F.toObject(doctorKey),
      newValue: tree.F.toObject(doctorValue),
    },
    "build/doctor_validation/doctor_validation_js/doctor_validation.wasm",
    "build/doctor_validation/circuit_final.zkey"
  );


  console.log("Doctor Proof: ", parseProof(doctorProof), doctorPublicSignals.map((x) => BigInt(x).toString(16)));
  console.log("Doctor New Root: ", BigInt(tree.F.toString(doctorCreationRes.newRoot)).toString(16));
  console.log("Doctor Old Root: ", BigInt(tree.F.toString(doctorCreationRes.oldRoot)).toString(16));
  console.log("-----------------------------------");
  
  const doctorRes = await doctorTree.find(doctorKey);
  doctorSiblings = doctorRes.siblings;
  for (let i = 0; i < doctorSiblings.length; i++)
    doctorSiblings[i] = doctorTree.F.toObject(doctorSiblings[i]);
  while (doctorSiblings.length < 4) doctorSiblings.push(0);

  // await tree.insert(1, 34);
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
      doctorRoot: doctorTree.F.toObject(doctorTree.root),
      doctorSiblings: doctorSiblings,
      doctorKey: doctorTree.F.toObject(doctorKey),
      doctorValue: doctorTree.F.toObject(doctorValue),
    },
    "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
    "build/prescription_validation/circuit_final.zkey"
  );

  console.log("Proof: ", parseProof(proof));
  console.log(
    "Public signals: ",
    publicSignals.map((x) => BigInt(x).toString(16))
  );
  console.log("Root hex: ", BigInt(tree.F.toString(res.newRoot)).toString(16));
  console.log(
    "Old Root hex: ",
    BigInt(tree.F.toString(res.oldRoot)).toString(16)
  );
}

main();
