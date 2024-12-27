export interface CryptoPair {
  pair: string;
  orderBook: OrderBook;
  trades: Array<Trade>;
}

export interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
  maker: string;
  taker: string;
}

export interface OrderBook {
  bids: Array<OrderBookEntry>;
  asks: Array<OrderBookEntry>;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  userId: string;
  timestamp: number;
}

export interface OrderRequest {
  pair: string;
  type: 'bid' | 'ask';
  price: number;
  quantity: number;
  userId: string;
}

export interface DbSchema {
  pairs: CryptoPair[];
}
