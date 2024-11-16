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
mkdir -p build/${base_name}

circom ${base_name}.circom --wasm --r1cs -o ./build/${base_name}

# Phase 1
npx snarkjs powersoftau new bn128 16 build/${base_name}/pot16_0000.ptau -v
npx snarkjs powersoftau contribute build/${base_name}/pot16_0000.ptau build/${base_name}/pot16_0001.ptau --name="First contribution" -v -e="random ooooo"
npx snarkjs powersoftau beacon build/${base_name}/pot16_0001.ptau build/${base_name}/pot16_beacon.ptau a2e7539880207acd44bc83b24887aaf95197eab45d5568af477cb9775bdaa560 10 -n="Final Beacon"
npx snarkjs powersoftau prepare phase2 build/${base_name}/pot16_beacon.ptau build/${base_name}/pot16_final.ptau -v
npx snarkjs powersoftau verify build/${base_name}/pot16_final.ptau

# Phase 2
npx snarkjs groth16 setup build/${base_name}/${base_name}.r1cs build/${base_name}/pot16_final.ptau circuit_0000.zkey
npx snarkjs r1cs export json build/${base_name}/${base_name}.r1cs build/${base_name}/${base_name}.r1cs.json
# cat <<EOT > input.json
# {"in": 2}
# EOT
# node build/${base_name}/${base_name}_js/generate_witness.js build/${base_name}/${base_name}_js/${base_name}.wasm input.json build/${base_name}/witness.wtns
# npx snarkjs wtns check build/${base_name}/${base_name}.r1cs build/${base_name}/witness.wtns
npx snarkjs groth16 setup build/${base_name}/${base_name}.r1cs build/${base_name}/pot16_final.ptau build/${base_name}/circuit_0000.zkey
npx snarkjs zkey contribute build/${base_name}/circuit_0000.zkey build/${base_name}/circuit_0001.zkey --name="1st Contributor Name" -v -e="more randomnesssss123"
npx snarkjs zkey beacon build/${base_name}/circuit_0001.zkey build/${base_name}/circuit_final.zkey d28352218a6bee71fe66f1cb22dc51759db5bf7c53b23723ede9a4fbb88f063d 10 -n="Fina
l Beacon phase2"
npx snarkjs zkey verify build/${base_name}/${base_name}.r1cs build/${base_name}/pot16_final.ptau build/${base_name}/circuit_final.zkey

# Exporting
npx snarkjs zkey export verificationkey build/${base_name}/circuit_final.zkey build/${base_name}/verification_key.json
# npx snarkjs groth16 prove build/${base_name}/circuit_final.zkey build/${base_name}/witness.wtns build/${base_name}/proof.json build/${base_name}/public.json
# npx snarkjs groth16 verify build/${base_name}/verification_key.json build/${base_name}/public.json build/${base_name}/proof.json
npx snarkjs zkey export solidityverifier build/${base_name}/circuit_final.zkey build/${base_name}/verifier.sol

# npx snarkjs zkey export soliditycalldata build/${base_name}/public.json build/${base_name}/proof.json
