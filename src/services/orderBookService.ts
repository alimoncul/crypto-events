import { dbService } from './dbService';
import { logger } from '../utils/logger';
import { messageQueue } from './messageQueueService';
import { OrderRequest, OrderBookEntry } from './types';

export const addOrder = async (orderDto: OrderRequest) => {
  try {
    const pairs = await dbService.getPairs();
    const pair = pairs.find(p => p.pair === orderDto.pair);
    if (!pair) throw new Error('Invalid pair');

    const order: OrderBookEntry = {
      price: orderDto.price,
      quantity: orderDto.quantity,
      userId: orderDto.userId,
      timestamp: Date.now(),
    };

    await dbService.addOrderForOrderBook(orderDto.pair, orderDto.type, order);

    const updatedPair = await dbService.getPair(orderDto.pair);
    if (!updatedPair) throw new Error('Failed to retrieve updated pair');

    await messageQueue.publishOrderBookUpdate(orderDto.pair, updatedPair.orderBook);
    return order;
  } catch (error) {
    logger.error('Error adding order:', error);
    throw error;
  }
};

export const getOrderBook = async (pair: string) => {
  const pairs = await dbService.getPairs();
  return pairs.find(p => p.pair === pair)?.orderBook;
};

export const getAllOrderBooks = async () => {
  return await dbService.getPairs();
};
