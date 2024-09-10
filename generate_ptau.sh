# !/bin/bash

if [ $# -eq 0 ]; then
  echo "Usage: $0 filename"
  exit 1
fi


# Get the input file name
input_file="$1"

# Extract the base name without the extension
base_name="${input_file%.*}"

mkdir -p build

circom ${base_name}.circom --wasm --r1cs -o ./build

# Phase 1
npx snarkjs powersoftau new bn128 14 build/pot14_0000.ptau -v
npx snarkjs powersoftau contribute build/pot14_0000.ptau build/pot14_0001.ptau --name="First contribution" -v -e="random ooooo"
npx snarkjs powersoftau beacon build/pot14_0001.ptau build/pot14_beacon.ptau a2e7539880207acd44bc83b24887aaf95197eab45d5568af477cb9775bdaa560 10 -n="Final Beacon"
npx snarkjs powersoftau prepare phase2 build/pot14_beacon.ptau build/pot14_final.ptau -v
npx snarkjs powersoftau verify build/pot14_final.ptau

# Phase 2
npx snarkjs groth16 setup build/${base_name}.r1cs build/pot14_final.ptau circuit_0000.zkey
npx snarkjs r1cs export json build/${base_name}.r1cs build/${base_name}.r1cs.json
cat <<EOT > input.json
{"in": 2}
EOT
node build/${base_name}_js/generate_witness.js build/${base_name}_js/${base_name}.wasm input.json build/witness.wtns
npx snarkjs wtns check build/${base_name}.r1cs build/witness.wtns
npx snarkjs groth16 setup build/${base_name}.r1cs build/pot14_final.ptau build/circuit_0000.zkey
npx snarkjs zkey contribute build/circuit_0000.zkey build/circuit_0001.zkey --name="1st Contributor Name" -v -e="more randomnesssss123"
npx snarkjs zkey beacon build/circuit_0001.zkey build/circuit_final.zkey d28352218a6bee71fe66f1cb22dc51759db5bf7c53b23723ede9a4fbb88f063d 10 -n="Fina
l Beacon phase2"
npx snarkjs zkey verify build/${base_name}.r1cs build/pot14_final.ptau build/circuit_final.zkey

# Exporting
npx snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json
npx snarkjs groth16 prove build/circuit_final.zkey build/witness.wtns build/proof.json build/public.json
npx snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
npx snarkjs zkey export solidityverifier build/circuit_final.zkey build/verifier.sol

npx snarkjs zkey export soliditycalldata build/public.json build/proof.json
