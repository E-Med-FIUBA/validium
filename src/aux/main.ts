import * as snarkjs from "snarkjs";

const createProof = async () => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { 
      oldRoot: 0,
      newRoot: 0x14fb6a045328a1005ab2c24c9453ebb897b111ec804181108c4a2298ceba0e19,
      siblings: [0, 0, 0, 0],
      oldKey: 0,
      oldValue: 0,
      isOld0: 1,
      newKey: 5,
      newValue: 0x2a267e27e712412e8eefec1e174ce85b1af2f2d9a8014fa4dc723abb4d27ef7d,
      fnc: [1, 0],
     },
    "build/prescription_validation_js/prescription_validation.wasm",
    "build/circuit_final.zkey"
  );
  console.log(publicSignals);
  console.log(proof);
};

createProof();
