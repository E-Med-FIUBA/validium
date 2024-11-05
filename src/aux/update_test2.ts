import { newMemEmptyTrie } from "circomlibjs";
import { poseidon6, poseidon7 } from "poseidon-lite";
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
  const _key = tree.F.e(1);
  const _value = {
    id: 1,
    doctorId: 1,
    presentationId: 1,
    patientId: 1,
    quantity: 1,
    emitedAt: 1,
    isUsed: 0
  };

  const key = tree.F.e(_key);
  const value = hashPrescription(_value);

  const res = await tree.insert(key, value);

  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  await snarkjs.groth16.fullProve(
    {
      fnc: 0,
      oldRoot: tree.F.toObject(res.oldRoot),
      newRoot: tree.F.toObject(res.newRoot),
      siblings: siblings,
      oldKey: 0,
      oldId: 0,
      oldDoctorId: 0,
      oldPresentationId: 0,
      oldPatientId: 0,
      oldQuantity: 0,
      oldEmitedAt: 0,
      newId: _value.id,
      newDoctorId: _value.doctorId,
      newPresentationId: _value.presentationId,
      newPatientId: _value.patientId,
      newQuantity: _value.quantity,
      newEmitedAt: _value.emitedAt,
      isOld0: 1,
      newKey: tree.F.toObject(key)
    },
    "build/test/test_js/test.wasm",
    "build/test/circuit_final.zkey"
  );

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

  const updatedRes = await tree.update(key, updatedValue);
  siblings = updatedRes.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      fnc: 1,
      oldRoot: tree.F.toObject(updatedRes.oldRoot),
      newRoot: tree.F.toObject(updatedRes.newRoot),
      siblings: siblings,
      oldKey: tree.F.toObject(key),
      oldId: _value.id,
      oldDoctorId: _value.doctorId,
      oldPresentationId: _value.presentationId,
      oldPatientId: _value.patientId,
      oldQuantity: _value.quantity,
      oldEmitedAt: _value.emitedAt,
      newId: _updatedValue.id,
      newDoctorId: _updatedValue.doctorId,
      newPresentationId: _updatedValue.presentationId,
      newPatientId: _updatedValue.patientId,
      newQuantity: _updatedValue.quantity,
      newEmitedAt: _updatedValue.emitedAt,
      isOld0: 0,
      newKey: tree.F.toObject(key)
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
