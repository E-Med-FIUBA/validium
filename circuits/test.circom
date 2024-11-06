pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/smt/smtprocessor.circom";

template Test(nLevels) {
    signal input oldRoot;
    signal input newRoot;
    signal input siblings[nLevels];
    signal input isOld0;

    signal input oldId;
    signal input oldDoctorId;
    signal input oldPresentationId;
    signal input oldPatientId;
    signal input oldQuantity;
    signal input oldEmitedAt;
    signal input oldKey;

    signal input newId;
    signal input newDoctorId;
    signal input newPresentationId;
    signal input newPatientId;
    signal input newQuantity;
    signal input newEmitedAt;
    signal input newKey;

    signal input fnc; // 0: insert, 1: mark as used
    fnc * (1 - fnc) === 0; // fnc should be 0 or 1

    component processor = SMTProcessor(nLevels);
    
    component oldPoseidon = Poseidon(7);
    component newPoseidon = Poseidon(7);

    oldPoseidon.inputs[0] <== oldId;
    oldPoseidon.inputs[1] <== oldDoctorId;
    oldPoseidon.inputs[2] <== oldPresentationId;
    oldPoseidon.inputs[3] <== oldPatientId;
    oldPoseidon.inputs[4] <== oldQuantity;
    oldPoseidon.inputs[5] <== oldEmitedAt;
    oldPoseidon.inputs[6] <== 0;

    newPoseidon.inputs[0] <== newId;
    newPoseidon.inputs[1] <== newDoctorId;
    newPoseidon.inputs[2] <== newPresentationId;
    newPoseidon.inputs[3] <== newPatientId;
    newPoseidon.inputs[4] <== newQuantity;
    newPoseidon.inputs[5] <== newEmitedAt;
    newPoseidon.inputs[6] <== fnc;

    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldPoseidon.out;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newPoseidon.out;
    processor.fnc <== [1 - fnc, fnc]; // [1, 0] => insert, [0, 1] => update

    processor.newRoot === newRoot;
    (oldId - newId) * fnc === 0;
    (oldDoctorId - newDoctorId) * fnc === 0;
    (oldPatientId - newPatientId) * fnc === 0;
    (oldPresentationId - newPresentationId) * fnc === 0;
    (oldQuantity - newQuantity) * fnc === 0;
    (oldEmitedAt - newEmitedAt) * fnc === 0;
}

component main {public [oldRoot, newRoot]} = Test(4);
