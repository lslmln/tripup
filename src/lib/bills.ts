export type Bill = {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // member id
  splitWith: string[]; // member ids sharing the cost
};

// Keeps an amount input to digits and at most 2 decimal places — no typing
// letters, minus signs, or a second decimal point. Works on the raw string
// so it can run on every keystroke without fighting the cursor position the
// way reformatting a parsed number would.
export function sanitizeAmountInput(raw: string) {
  let value = raw.replace(/[^0-9.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
    const [intPart, decPart] = value.split(".");
    value = decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
  }
  return value;
}

export function formatMoney(amount: number) {
  return amount.toFixed(2);
}

export function splitShare(amount: number, splitCount: number) {
  return splitCount === 0 ? 0 : amount / splitCount;
}
