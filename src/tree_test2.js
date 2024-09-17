const circomlibjs = require("circomlibjs");
const { Scalar } = require("ffjavascript");

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

async function insert(tree, _key, _value) {
  const key = tree.F.e(_key);
  const value = tree.F.e(_value);

  const res = await tree.insert(key, value);
  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++)
    siblings[i] = tree.F.toObject(siblings[i]);
  while (siblings.length < 10) siblings.push(0);

  return {
    key: key,
    value: value,
    siblings: siblings,
    root: tree.root,
  };
}

async function generateSMT() {
  // Create a new Sparse Merkle Tree processor
  const smt = await circomlibjs.newMemEmptyTrie();

  // Example key-value pairs to insert into the tree
  const oldKey = Scalar.fromString("12345");
  const oldValue = Scalar.fromString("67890");
  const newKey = Scalar.fromString("54321");
  const newValue = Scalar.fromString("98765");

  // Insert the key-value pairs into the tree
  const old = await insert(smt, oldKey, oldValue);
  const new_ = await insert(smt, newKey, newValue);

  console.log("SMT Data for Testing:");
  console.log("Old Root:", toHexString(old.root));
  console.log("New Root:", toHexString(new_.root));
  console.log("Old Key:", old.key.toString());
  console.log("Old Value:", old.value.toString());
  console.log("New Key:", new_.key.toString());
  console.log("New Value:", new_.value.toString());
  console.log("Siblings (Old):", old.siblings);
  console.log("Siblings (New):", new_.siblings);
  console.log("Fnc:", [1, 0]);
}

generateSMT();

// async function generateSMT() {
//   // Create a new Sparse Merkle Tree processor
//   const smt = await circomlibjs.newMemEmptyTrie();

//   // Example key-value pairs to insert into the tree
//   const oldKey = Scalar.fromString("12345");
//   const oldValue = Scalar.fromString("67890");
//   const newKey = Scalar.fromString("54321");
//   const newValue = Scalar.fromString("98765");

//   // const { siblings: oldSiblings } = await smt.insert(oldKey, oldValue);
//   const oldRoot = smt.root;
//   console.log(await smt.insert(oldKey, oldValue));
//   // const { siblings: newSiblings } = await smt.insert(newKey, newValue);
//   console.log(await smt.insert(newKey, newValue));
//   const newRoot = smt.root;

//   // Set up the function array (fnc) which can be either add/update (1) or remove (0)
//   let fnc = [1, 0]; // Example: setting the function to 'add/update'

//   console.log("SMT Data for Testing:");
//   console.log("Old Root:", toHexString(oldRoot));
//   console.log("New Root:", toHexString(newRoot));
//   console.log("Old Key:", oldKey.toString());
//   console.log("Old Value:", oldValue.toString());
//   console.log("New Key:", newKey.toString());
//   console.log("New Value:", newValue.toString());
//   // console.log("Siblings (Old):", oldSiblings);
//   // console.log("Siblings (New):", newSiblings);
//   // console.log("Fnc:", fnc);

//   console.log(await smt.find("54321"));
//   console.log(await smt.find("12345"));
// }

// generateSMT();
