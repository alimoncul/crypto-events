import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Collection } from 'mongodb';
import { logger } from '../utils/logger';
import { CryptoPair, OrderBookEntry } from './types';

export class DbService {
  private static instance: DbService;
  private mongoServer!: MongoMemoryServer;
  private client!: MongoClient;
  private collection!: Collection<CryptoPair>;

  private constructor() {}

  static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  async connect(): Promise<void> {
    this.mongoServer = await MongoMemoryServer.create();
    const uri = this.mongoServer.getUri();
    this.client = new MongoClient(uri);
    await this.client.connect();

    this.collection = this.client.db('crypto').collection<CryptoPair>('pairs');

    this.collection.insertMany([
      { pair: 'BTC-USDT', orderBook: { bids: [], asks: [] }, trades: [] },
      { pair: 'ETH-USDT', orderBook: { bids: [], asks: [] }, trades: [] },
      { pair: 'XRP-USDT', orderBook: { bids: [], asks: [] }, trades: [] },
      { pair: 'BNB-USDT', orderBook: { bids: [], asks: [] }, trades: [] },
      { pair: 'SOL-USDT', orderBook: { bids: [], asks: [] }, trades: [] },
    ]);
    logger.info('Connected to MongoDB Memory Server');
  }

  async getPairs(): Promise<CryptoPair[]> {
    return this.collection.find().toArray();
  }

  async getPair(pair: string): Promise<CryptoPair | null> {
    return this.collection.findOne({ pair: pair });
  }

  async addOrderForOrderBook(
    pairId: string,
    type: 'bid' | 'ask',
    orderBookEntry: OrderBookEntry
  ): Promise<boolean> {
    const targetField = type === 'bid' ? 'orderBook.bids' : 'orderBook.asks';
    await this.collection.updateOne(
      { pair: pairId },
      { $push: { [targetField]: orderBookEntry } }
    );
    return true;
  }

  async close(): Promise<void> {
    await this.client?.close();
    await this.mongoServer?.stop();
  }
}

export const dbService = DbService.getInstance();
