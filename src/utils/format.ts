export const formatQuantity = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.00$/, "");
};
