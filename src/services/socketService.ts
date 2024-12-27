import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { addOrder } from './orderBookService';
import { messageQueue } from './messageQueueService';
import { rabbitmqConfig } from '../config/rabbitmq.config';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', async (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);
    const channel = await messageQueue.createChannel();
    const q = await channel.assertQueue('', { exclusive: true });

    socket.on('subscribe', async (pair: string) => {
      logger.info(`Client ${socket.id} subscribing to ${pair}`);

      await channel.bindQueue(q.queue, rabbitmqConfig.exchanges.orderbook, pair);
    });

    channel.consume(q.queue, (msg) => {
      if(msg) {
        const message = JSON.parse(msg.content.toString());
        logger.info(`Message for socket ${socket.id}:`, message);
        socket.emit('update', message);
      } else {
        logger.info(`Message is null for ${socket.id}`);
      }
    }, { noAck: true });

    socket.on('unsubscribe', async (pair: string) => {
      logger.info(`Client ${socket.id} unsubscribing from ${pair}`);
      await channel.unbindQueue(q.queue, rabbitmqConfig.exchanges.orderbook, pair);
      logger.info(`Client ${socket.id} unsubscribed from ${pair}`);
    });

    socket.on('submitOrder', async data => {
      try {
        const order = await addOrder({
          pair: data.pair,
          type: data.type,
          price: data.price,
          quantity: data.quantity,
          userId: data.userId,
        });
        logger.info(
          `Client ${socket.id} submitting order Pair: ${data.pair} Type: ${data.type} Price: ${data.price} Quantity: ${data.quantity} UserId: ${data.userId}`
        );
        socket.emit('orderSubmitted', { success: true, order });
      } catch (err) {
        const error = err as Error;
        logger.error('Error submitting order:', error);
        socket.emit('orderSubmitted', {
          success: false,
          error: error.message,
        });
      }
    });

    socket.on('disconnect', async (reason) => {
      await channel.close();
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};
