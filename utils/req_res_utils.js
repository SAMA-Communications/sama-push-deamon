export function slice(obj, keys, setEmptyStringToNull) {
  return Object.keys(obj)
    .filter((key) => {
      return keys.indexOf(key) >= 0;
    })
    .reduce((acc, key) => {
      let val = obj[key];
      if (setEmptyStringToNull && val === "") {
        val = null;
      }
      acc[key] = val;
      return acc;
    }, {});
}
