export const formatBalance = (balance: number) => {
  return `$${(balance / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
