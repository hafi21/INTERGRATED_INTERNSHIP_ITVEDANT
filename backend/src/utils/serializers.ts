type DecimalLike = {
  toNumber?: () => number;
};

export const decimalToNumber = (value: DecimalLike | number | string) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value);
};

export const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const createOrderNumber = () =>
  `AUR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const createTransactionReference = () =>
  `TX-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
