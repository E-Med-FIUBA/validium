pragma circom 2.0.0;


include "./node_modules/circomlib/circuits/smt/smtprocessor.circom";
include "./node_modules/circomlib/circuits/smt/smtverifier.circom";



template PrescriptionVerifier(nLevels, doctorLevels) {
    signal input oldRoot;
    signal input newRoot;
    signal input siblings[nLevels];
    signal input oldValue;
    signal input isOld0;
    signal input oldKey;
    signal input newKey;
    signal input newValue;
    signal input fnc[2];

    component processor = SMTProcessor(nLevels);

    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newValue;
    processor.fnc <== fnc;

    processor.newRoot === newRoot;

    signal output pubOldRoot <== oldRoot;

    // -------------------------------------

    signal input doctorRoot;
    signal input doctorSiblings[doctorLevels];
    signal input doctorKey;
    signal input doctorValue;

    component doctorVerifier = SMTVerifier(doctorLevels);

    doctorVerifier.enabled <== 1; // Always enabled
    doctorVerifier.root <== doctorRoot;
    doctorVerifier.siblings <== doctorSiblings;
    doctorVerifier.isOld0 <== 0;
    doctorVerifier.oldKey <== doctorKey;
    doctorVerifier.key <== doctorKey;
    doctorVerifier.value <== doctorValue;
    doctorVerifier.oldValue <== doctorValue;
    doctorVerifier.fnc <== 0; // Always check for inclusion

    signal output oldDoctorRoot <== doctorVerifier.root;
}


component main = PrescriptionVerifier(4, 4);