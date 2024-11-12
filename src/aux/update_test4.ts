import { newMemEmptyTrie } from "circomlibjs";
import { poseidon2, poseidon3, poseidon7 } from "poseidon-lite";
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

const hash0 = (left: bigint, right: bigint): bigint => poseidon2([left, right]);

const hash1 = (key: bigint | number, value: bigint): bigint =>
  poseidon3([key, value, 1n]);

async function main() {
  const tree = await newMemEmptyTrie();
  const _value = {
    id: 9,
    doctorId: 7,
    presentationId: 1,
    patientId: 1,
    quantity: 1,
    emitedAt: 1730923886047,
    isUsed: 0
  };

  const key = 9;
  const value = hashPrescription(_value);
  await tree.insert(key, value);

  // -------------------------------

  const auxRes =  await tree.insert(
    11,
    hashPrescription({
      id: 11,
      doctorId: 7,
      patientId: 1,
      quantity: 1,
      presentationId: 5,
      emitedAt: 1730924020370,
      isUsed: 0
    })
  );

  let auxSiblings = auxRes.siblings;
  for (let i = 0; i < auxSiblings.length; i++)
    auxSiblings[i] = tree.F.toObject(auxSiblings[i]);
  while (auxSiblings.length < 4) auxSiblings.push(0);

  console.log({
    oldRoot: tree.F.toObject(auxRes.oldRoot),
    newRoot: tree.F.toObject(auxRes.newRoot),
    siblings: auxSiblings,
    isOld0: 0,
    oldKey: tree.F.toObject(auxRes.oldKey),
    oldValue: tree.F.toObject(auxRes.oldValue),
    key: 11,
    id: 11,
    doctorId: 7,
    presentationId: 5,
    patientId: 1,
    quantity: 1,
    emitedAt: 1730924020370,
  });

  // --------------------------------

  const _updatedValue = {
    ..._value,
    isUsed: 1
  };

  const updatedValue = hashPrescription(_updatedValue);

  const res = await tree.update(key, updatedValue);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 4) siblings.push(0);

  console.log({
    oldRoot: tree.F.toObject(res.oldRoot),
    newRoot: tree.F.toObject(res.newRoot),
    siblings: siblings,
    isOld0: 0,
    oldKey: tree.F.toObject(res.oldKey),
    oldValue: tree.F.toObject(res.oldValue),
    key: key,
    id: _updatedValue.id,
    doctorId: _updatedValue.doctorId,
    presentationId: _updatedValue.presentationId,
    patientId: _updatedValue.patientId,
    quantity: _updatedValue.quantity,
    emitedAt: _updatedValue.emitedAt
  });

  await snarkjs.groth16.fullProve(
    {
      oldRoot: tree.F.toObject(res.oldRoot),
      newRoot: tree.F.toObject(res.newRoot),
      siblings: siblings,
      isOld0: 0,
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
    "build/update_validation/update_validation_js/update_validation.wasm",
    "build/update_validation/circuit_final.zkey"
  );
}

main();
