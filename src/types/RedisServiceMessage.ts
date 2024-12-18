export interface IJoinData {
  action: 'join';
  socketId: string;
  userId: string;
  roomId: string;
  isBuyer: boolean;
}

export interface ILeaveData {
  action: 'leave';
  socketId: string;
  roomId: string;
}

export type TRoomUpdateData = IJoinData | ILeaveData;
