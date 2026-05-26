import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT, SERVER } from '../config/constants.js';
import { handleRoomEvents } from './room.handler.js';
import { handleGameEvents } from './game.handler.js';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: SERVER.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token kerak'));
    }

    try {
      const decoded = jwt.verify(token, JWT.SECRET) as { userId: number; telegramId: number };
      (socket as unknown as Record<string, unknown>).userId = decoded.userId;
      (socket as unknown as Record<string, unknown>).telegramId = decoded.telegramId;
      next();
    } catch {
      next(new Error('Noto\'g\'ri token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Ulandi: ${socket.id}`);

    handleRoomEvents(io, socket);
    handleGameEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Uzildi: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  return io;
}
