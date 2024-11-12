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

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
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
    "build/update_validation/update_validation_js/update_validation.wasm",
    "build/update_validation/circuit_final.zkey"
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
