export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchanges: {
    orderbook: 'orderbook_updates',
    trades: 'trade_updates'
  },
  queues: {
    orderbook: 'orderbook_queue',
    trades: 'trades_queue'
  }
}; 