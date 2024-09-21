pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/smt/smtverifier.circom";
include "circomlib/merkle.circom";

template DoctorValidation(nLevels) {
    signal input root;
    signal input siblings[nLevels];
    signal input doctorId;
    signal input doctorHash;
    signal output isValid;

    component smt = SMTVerifier(nLevels);
    smt.fnc <== 1; // VERIFY INCLUSION
    smt.key <== doctorHash;
    smt.value <== doctorId;
    smt.root <== root;
    smt.enabled <== 1;
    smt.siblings <== siblings;
    smt.oldKey <== 0;
    smt.oldValue <== 0;
    smt.isOld0 <== 0;
}

component main = DoctorValidation(4);
