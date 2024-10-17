pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/smt/smtprocessor.circom";

template DoctorValidation(nLevels) {
    signal input oldRoot;
    signal input newRoot;
    signal input siblings[nLevels];
    signal input oldValue;
    signal input isOld0;
    signal input oldKey;
    signal input newKey;
    signal input newValue;

    component processor = SMTProcessor(nLevels);

    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newValue;
    processor.fnc <== [1, 0];  // Always update

    processor.newRoot === newRoot;
}

component main {public [oldRoot, newRoot]} = DoctorValidation(4);
