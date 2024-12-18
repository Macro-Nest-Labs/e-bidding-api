import { Server as SockServer } from 'socket.io';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export type SockType = (
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
) => SockServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
