import { Server, Socket } from 'socket.io';

export function handleRoomEvents(io: Server, socket: Socket) {
  // Xonaga qo'shilish
  socket.on('room:join', (data: { roomCode: string; userId: number }) => {
    socket.join(`room:${data.roomCode}`);
    io.to(`room:${data.roomCode}`).emit('room:updated', {
      message: `${data.userId} qo'shildi`,
    });
  });

  // Xonadan chiqish
  socket.on('room:leave', (data: { roomCode: string }) => {
    socket.leave(`room:${data.roomCode}`);
    io.to(`room:${data.roomCode}`).emit('player:disconnected', {
      userId: (socket as unknown as Record<string, unknown>).userId,
    });
  });

  // Tayyor
  socket.on('room:ready', (data: { roomCode: string; ready: boolean }) => {
    io.to(`room:${data.roomCode}`).emit('room:updated', {
      userId: (socket as unknown as Record<string, unknown>).userId,
      ready: data.ready,
    });
  });
}
