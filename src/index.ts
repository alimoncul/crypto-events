import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './services/socketService';
import { messageQueue } from './services/messageQueueService';
import { logger } from './utils/logger';
import { dbService } from './services/dbService';

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.json());

// For seeing the orderbooks in the browser
app.get('/db/orderbooks', async (_req, res) => {
  const pairs = await dbService.getPairs();
  res.json(pairs);
});

const startServer = async () => {
  try {
    await dbService.connect();
    await messageQueue.connect();
    setupSocketHandlers(io);

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

async function exit() {
  await dbService.close();
  await messageQueue.close();
  process.exit(0);

}
process.on('SIGTERM', async () => {
  exit();
});

process.once('SIGUSR2', function () {
  exit();
});

process.on('SIGINT', function () {
  exit();
});
