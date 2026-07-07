export function pickRandomEntry(list) {
  if (!list.length) {
    return { entry: '', index: 0 };
  }
  const index = Math.floor(Math.random() * list.length);
  return { entry: list[index], index };
}
