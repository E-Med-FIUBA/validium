# !/bin/bash
mkdir -p build

circom poseidon_hasher.circom --wasm --r1cs -o ./build

# Phase 1
snarkjs powersoftau new bn128 14 build/pot14_0000.ptau -v
snarkjs powersoftau contribute build/pot14_0000.ptau build/pot14_0001.ptau --name="First contribution" -v -e="random ooooo"
snarkjs powersoftau beacon build/pot14_0001.ptau build/pot14_beacon.ptau a2e7539880207acd44bc83b24887aaf95197eab45d5568af477cb9775bdaa560 10 -n="Final Beacon"
snarkjs powersoftau prepare phase2 build/pot14_beacon.ptau build/pot14_final.ptau -v
snarkjs powersoftau verify build/pot14_final.ptau

# Phase 2
snarkjs groth16 setup build/poseidon_hasher.r1cs build/pot14_final.ptau circuit_0000.zkey
snarkjs r1cs export json build/poseidon_hasher.r1cs build/poseidon_hasher.r1cs.json
cat <<EOT > input.json
{"in": 2}
EOT
node build/poseidon_hasher_js/generate_witness.js build/poseidon_hasher_js/poseidon_hasher.wasm input.json build/witness.wtns
snarkjs wtns check build/poseidon_hasher.r1cs build/witness.wtns
snarkjs groth16 setup build/poseidon_hasher.r1cs build/pot14_final.ptau build/circuit_0000.zkey
snarkjs zkey contribute build/circuit_0000.zkey build/circuit_0001.zkey --name="1st Contributor Name" -v -e="more randomnesssss123"
snarkjs zkey beacon build/circuit_0001.zkey build/circuit_final.zkey d28352218a6bee71fe66f1cb22dc51759db5bf7c53b23723ede9a4fbb88f063d 10 -n="Fina
l Beacon phase2"
snarkjs zkey verify build/poseidon_hasher.r1cs build/pot14_final.ptau build/circuit_final.zkey

# Exporting
snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json
snarkjs groth16 prove build/circuit_final.zkey build/witness.wtns build/proof.json build/public.json
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
snarkjs zkey export solidityverifier build/circuit_final.zkey build/verifier.sol

snarkjs zkey export soliditycalldata build/public.json build/proof.json
