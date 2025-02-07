interface PaymentBonus {
  amount: number;
  payments_id: {
    slug: string;
  };
}

interface Token {
  symbol: string;
  name: string;
}

export interface TokenPackageResponse {
  token: Token;
  price: number;
  no_of_coins: number;
  bonus: number;
  payment_bonus: PaymentBonus[];
  currency: string;
}
