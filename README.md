# Crypto Orderbook Server

This project is a real-time crypto orderbook server that uses RabbitMQ for messaging, MongoDB for data storage, and Socket.IO for real-time communication with clients.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Services](#services)
- [Scripts](#scripts)

## Demo
https://github.com/user-attachments/assets/e0c6932d-7ed6-47be-b1a2-8ad2019c4e26

## Installation

1. Install dependencies:
`npm install`
2. Create a .env file in the root directory and add your RabbitMQ URL:
`RABBITMQ_URL=amqp://guest:guest@localhost:5672`

## Usage
1. Build the project:
`npm run build`
2. Start the server:
`npm start`
3. For development, you can use:
`npm run dev`

## Services

### Database Service - File: `dbService.ts`
The dbService is responsible for managing the in-memory MongoDB database. It provides methods to connect to the database, retrieve pairs, add orders, and close the connection.

### Message Queue Service - File: `messageQueueService.ts`
The messageQueueService handles the connection to RabbitMQ, creating channels, and publishing messages to the orderbook_updates and trade_updates exchanges.

### Order Book Service - File: `orderBookService.ts`
The orderBookService manages the order book for each trading pair. It provides methods to add orders and retrieve order books.

### Socket Service - File: `socketService.ts`
The socketService sets up Socket.IO handlers for client connections. It handles subscribing and unsubscribing to trading pairs, submitting orders, and broadcasting updates.

### Logging - File: `logger.ts`
Logging is handled using Winston. Logs are written to combined.log and error.log files, as well as the console.

## Scripts
```
start: Runs the built project.
dev: Runs the project in development mode with nodemon.
build: Compiles the TypeScript code.
```
