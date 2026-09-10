export type Transaction = {
  id: string;
  memberId: string;
  amount: number;
  // Epoch ms — when the payment was received.
  at: number;
};
