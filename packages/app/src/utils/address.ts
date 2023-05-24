export const toShortAddress = (accountAddress: string) => {
  const firstPart = accountAddress.slice(0, 5);
  const secondPart = accountAddress.slice(-4);
  return `${firstPart}...${secondPart}`;
};
