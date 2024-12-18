import { Server } from 'socket.io';

import { SockType } from '../types/Sock';
import { log } from '../utils/console';
import { auctionNamespace } from './auction-namespace';

export const socketToUserMap = new Map();
export const roomMembers = new Map();

const sock: SockType = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    transports: ['websocket'],
  });

  io.on('connection', (socket) => {
    log(`[SOCK] Client connected ${socket.id}`, 'MAGENTA');
  });

  return io;
};

export const setupSocket = (io: Server) => {
  auctionNamespace(io);
};

export default sock;
