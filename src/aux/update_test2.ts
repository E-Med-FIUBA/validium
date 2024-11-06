import { newMemEmptyTrie } from "circomlibjs";
import { poseidon7 } from "poseidon-lite";
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

const hashPrescription = (prescription: {
  id: number;
  doctorId: number;
  presentationId: number;
  patientId: number;
  quantity: number;
  emitedAt: number;
  isUsed: number;
}) => {
  return poseidon7([
    prescription.id,
    prescription.doctorId,
    prescription.presentationId,
    prescription.patientId,
    prescription.quantity,
    prescription.emitedAt,
    prescription.isUsed
  ]);
};

async function main() {
  const tree = await newMemEmptyTrie();
  const _value = {
    id: 1,
    doctorId: 1,
    presentationId: 1,
    patientId: 1,
    quantity: 1,
    emitedAt: 1,
    isUsed: 0
  };

  const key = 1;
  const value = hashPrescription(_value);
  await tree.insert(key, value);

  // --------------------------------

  const _updatedValue = {
    id: 1,
    doctorId: 1,
    presentationId: 1,
    patientId: 1,
    quantity: 1,
    emitedAt: 1,
    isUsed: 1
  };

  const updatedValue = hashPrescription(_updatedValue);

  const res = await tree.update(key, updatedValue);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  await snarkjs.groth16.fullProve(
    {
      oldRoot: tree.F.toObject(res.oldRoot),
      newRoot: tree.F.toObject(res.newRoot),
      siblings: siblings,
      isOld0: res.isOld0 ? 1 : 0,
      oldKey: tree.F.toObject(res.oldKey),
      oldValue: tree.F.toObject(res.oldValue),
      key: key,
      id: _updatedValue.id,
      doctorId: _updatedValue.doctorId,
      presentationId: _updatedValue.presentationId,
      patientId: _updatedValue.patientId,
      quantity: _updatedValue.quantity,
      emitedAt: _updatedValue.emitedAt
    },
    "build/test/test_js/test.wasm",
    "build/test/circuit_final.zkey"
  );

  // --------------------------------

  const newKey = 2;
  const _newValue = {
    id: 2,
    doctorId: 1,
    presentationId: 1,
    patientId: 25,
    quantity: 1,
    emitedAt: 1,
    isUsed: 0
  };
  const newValue = hashPrescription(_newValue);
  const insertRes = await tree.insert(newKey, newValue);
  siblings = insertRes.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  const doctorTree = await newMemEmptyTrie();
  const doctorKey = 438760;
  const doctorValue = doctorTree.F.e(1000);

  const doctorCreationRes = await doctorTree.insert(doctorKey, doctorValue);
  let doctorSiblings = doctorCreationRes.siblings;
  for (let i = 0; i < doctorSiblings.length; i++)
    doctorSiblings[i] = doctorTree.F.toObject(doctorSiblings[i]);
  while (doctorSiblings.length < 4) doctorSiblings.push(0);

  await snarkjs.groth16.fullProve(
    {
      oldRoot: tree.F.toObject(insertRes.oldRoot),
      newRoot: tree.F.toObject(insertRes.newRoot),
      siblings: siblings,
      oldKey: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldKey),
      oldValue: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldValue),
      isOld0: insertRes.isOld0 ? 1 : 0,
      newKey: newKey,
      newValue: newValue,
      doctorRoot: doctorTree.F.toObject(doctorTree.root),
      doctorSiblings: doctorSiblings,
      doctorKey: doctorKey,
      doctorValue: doctorTree.F.toObject(doctorValue),
    },
    "build/prescription_validation/prescription_validation_js/prescription_validation.wasm",
    "build/prescription_validation/circuit_final.zkey"
  );

  // --------------------------------

  const _newUpdatedValue = {
    ..._newValue,
    isUsed: 1
  };
  const newUpdatedValue = hashPrescription(_newUpdatedValue);
  const newRes = await tree.update(newKey, newUpdatedValue);
  siblings = newRes.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      oldRoot: tree.F.toObject(newRes.oldRoot),
      newRoot: tree.F.toObject(newRes.newRoot),
      siblings: siblings,
      isOld0: newRes.isOld0 ? 1 : 0,
      oldKey: tree.F.toObject(newRes.oldKey),
      oldValue: tree.F.toObject(newRes.oldValue),
      key: newKey,
      id: _newUpdatedValue.id,
      doctorId: _newUpdatedValue.doctorId,
      presentationId: _newUpdatedValue.presentationId,
      patientId: _newUpdatedValue.patientId,
      quantity: _newUpdatedValue.quantity,
      emitedAt: _newUpdatedValue.emitedAt
    },
    "build/test/test_js/test.wasm",
    "build/test/circuit_final.zkey"
  );

  console.log("Proof: ", proof);
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
