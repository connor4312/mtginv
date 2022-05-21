const usdFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

export const formatUSD = (cents: number | undefined) => cents && usdFormatter.format(cents / 100);
