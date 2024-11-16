pragma circom 2.0.0;


include "./node_modules/circomlib/circuits/smt/smtverifier.circom";


template MerkleInclusionVerifier(nLevels) {
    signal input root;
    signal input siblings[nLevels];
    signal input key;
    signal input value;

    component doctorVerifier = SMTVerifier(nLevels);

    doctorVerifier.enabled <== 1; // Always enabled
    doctorVerifier.root <== root;
    doctorVerifier.siblings <== siblings;
    doctorVerifier.isOld0 <== 0;
    doctorVerifier.oldKey <== key;
    doctorVerifier.key <== key;
    doctorVerifier.value <== value;
    doctorVerifier.oldValue <== value;
    doctorVerifier.fnc <== 0; // Always check for inclusion
}


component main {public [root, key, value]} = MerkleInclusionVerifier(24);