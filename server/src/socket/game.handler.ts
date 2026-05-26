import { Server, Socket } from 'socket.io';
import { submitAnswer, judgeSelect, distributeCards } from '../services/game.service.js';

export function handleGameEvents(io: Server, socket: Socket) {
  // Javob yuborish
  socket.on('game:answer', async (data: { cardId: number; roomId: number }) => {
    const userId = (socket as unknown as Record<string, unknown>).userId as number;
    const answer = await submitAnswer(data.roomId, userId, data.cardId);

    // Hakamga yuborish (yashirin)
    io.to(`room:${data.roomId}`).emit('game:answer_received', {
      playerId: userId,
      hasAnswered: true,
    });
  });

  // Hakam tanlovi
  socket.on('game:judge', async (data: { selectedCardId: number; roomId: number; winnerId: number }) => {
    await judgeSelect(data.roomId, data.selectedCardId, data.winnerId);

    io.to(`room:${data.roomId}`).emit('game:round_result', {
      winnerId: data.winnerId,
      cardId: data.selectedCardId,
    });
  });

  // Chat
  socket.on('game:chat', (data: { message: string; roomCode: string }) => {
    io.to(`room:${data.roomCode}`).emit('game:chat', {
      userId: (socket as unknown as Record<string, unknown>).userId,
      message: data.message,
    });
  });
}
