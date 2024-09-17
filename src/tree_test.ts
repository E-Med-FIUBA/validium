import { buildPoseidon } from "circomlibjs";

function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

async function main() {
    const poseidon = await buildPoseidon();
    
    // calculate hash of 1 and console.log it as a hex string
    const hash = poseidon([1]);
    console.log("hash of 1:", toHexString(hash));
    const root = poseidon([hash])
    console.log("root of 1:", toHexString(root));

}

main();