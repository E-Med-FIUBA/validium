export const convertSiblings = (trie: any, siblings: any[]) => {
  let result = [];
  for (let i = 0; i < siblings.length; i++)
    result.push(trie.F.toObject(siblings[i]));
  while (result.length < 4) result.push(0);
  return result;
};
