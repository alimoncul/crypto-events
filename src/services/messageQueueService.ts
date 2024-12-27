import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '../utils/logger';
import { rabbitmqConfig } from '../config/rabbitmq.config';
import { OrderBook, Trade } from './types';

export class MessageQueue {
  private static instance: MessageQueue;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  public static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }

  async createChannel(): Promise<Channel> {
    if (!this.connection) throw new Error('RabbitMQ connection not initialized');
    return this.connection.createChannel();
  }
  
  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(
        rabbitmqConfig.exchanges.orderbook,
        'fanout',
        { durable: false }
      );

      await this.channel.assertExchange(
        rabbitmqConfig.exchanges.trades,
        'fanout',
        { durable: false }
      );

      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async publishOrderBookUpdate(pair: string, data: OrderBook): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    this.channel.publish(
      rabbitmqConfig.exchanges.orderbook,
      pair,
      Buffer.from(JSON.stringify({ pair, data, timestamp: Date.now() }))
    );
  }

  async publishTradeUpdate(pair: string, trade: Trade): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    this.channel.publish(
      rabbitmqConfig.exchanges.trades,
      pair,
      Buffer.from(JSON.stringify({ pair, trade, timestamp: Date.now() }))
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

export const messageQueue = MessageQueue.getInstance(); 
