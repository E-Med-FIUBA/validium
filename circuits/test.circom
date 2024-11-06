pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/smt/smtprocessor.circom";
include "./node_modules/circomlib/circuits/smt/smtverifier.circom";

template Test(nLevels) {
    signal input oldRoot;
    signal input newRoot;
    signal input siblings[nLevels];

    signal input isOld0;
    signal input oldKey;
    signal input oldValue;

    signal input key;
    signal input id;
    signal input doctorId;
    signal input presentationId;
    signal input patientId;
    signal input quantity;
    signal input emitedAt;
    
    component unusedPoseidon = Poseidon(7);
    component usedPoseidon = Poseidon(7);

    unusedPoseidon.inputs[0] <== id;
    unusedPoseidon.inputs[1] <== doctorId;
    unusedPoseidon.inputs[2] <== presentationId;
    unusedPoseidon.inputs[3] <== patientId;
    unusedPoseidon.inputs[4] <== quantity;
    unusedPoseidon.inputs[5] <== emitedAt;
    unusedPoseidon.inputs[6] <== 0;

    usedPoseidon.inputs[0] <== id;
    usedPoseidon.inputs[1] <== doctorId;
    usedPoseidon.inputs[2] <== presentationId;
    usedPoseidon.inputs[3] <== patientId;
    usedPoseidon.inputs[4] <== quantity;
    usedPoseidon.inputs[5] <== emitedAt;
    usedPoseidon.inputs[6] <== 1;

    // Verify that the unused prescription exists in the tree

    component unusedVerifier = SMTVerifier(nLevels);

    unusedVerifier.enabled <== 1; // Always enabled
    unusedVerifier.root <== oldRoot;
    unusedVerifier.siblings <== siblings;
    unusedVerifier.isOld0 <== 0;
    unusedVerifier.oldKey <== key;
    unusedVerifier.key <== key;
    unusedVerifier.value <== unusedPoseidon.out;
    unusedVerifier.oldValue <== unusedPoseidon.out;
    unusedVerifier.fnc <== 0; // Always check for inclusion

    // Verify that updating the prescription to be used results in the new root

    component processor = SMTProcessor(nLevels);

    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== key;
    processor.newValue <== usedPoseidon.out;
    processor.fnc <== [0, 1]; // Always update

    processor.newRoot === newRoot;
}

component main {public [oldRoot, newRoot]} = Test(4);
