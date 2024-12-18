# Socket Events Documentation for Auction Namespace

## Document Details

- **Created At:** 26-11-2023
- **Last Updated:** 14-12-2023
- **Version:** 1.1

## Overview

This documentation covers the socket events used in the Auction Namespace. It's designed to provide a clear understanding of each event's purpose, parameters, and usage. This will assist both backend and frontend developers in integrating and handling these events effectively.

## Server-Emitted Events

### `join-room`

- **Emitted By:** Client
- **Description:** Used by clients to request joining a specific auction room.
- **Parameters:**
  - `roomId` (Types.ObjectId): Identifier of the room to join.
  - `userId` (Types.ObjectId): Identifier of the user attempting to join.
  - `isBuyer` (Types.ObjectId, optional): Indicates if the user is a buyer.

### `join-error`

- **Emitted By:** Server
- **Description:** Notifies the client of an error encountered while attempting to join a room.
- **Callback Data:** A string describing the error.

### `joined-room`

- **Emitted By:** Server
- **Description:** Confirms that the client has successfully joined the specified room.
- **Callback Data:** `roomId` (Types.ObjectId) of the joined room.

### `bid`

- **Emitted By:** Client
- **Description:** Used by clients to place bids in an auction.
- **Parameters:** An object containing:
  - `roomId` (Types.ObjectId): Room in which the bid is being placed.
  - `lotId` (Types.ObjectId): Lot being bid on.
  - `supplierId` (Types.ObjectId): Supplier placing the bid.
  - `amount` (number): Bid amount.

### `bid-error`

- **Emitted By:** Server
- **Description:** Notifies the client of an error encountered while placing a bid.
- **Callback Data:** A string or an array of strings describing the error(s).

### `new-bid`

- **Emitted By:** Server
- **Description:** Broadcasts a new bid to all clients in the auction room.
- **Callback Data:** An object containing:
  - `lotId` (Types.ObjectId): ID of the lot being bid on.
  - `supplierId` (Types.ObjectId): ID of the supplier who placed the bid.
  - `amount` (number): Amount of the bid.

### `auction-extended`

- **Emitted By:** Server
- **Description:** Notifies clients of an extension in the auction time.
- **Callback Data:** An object containing:
  - `newEndTime` (Date): The new end time of the auction.
  - `serverTime` (Date): The current server time.

### `auction-closed`

- **Emitted By:** Server
- **Description:** Notifies clients that the auction has ended.
- **Callback Data:** An object containing:
  - `listingId` (Types.ObjectId): ID of the listing whose auction has closed.
  - `status` (string): The new status of the listing.

### `lot-transition`

- **Emitted By:** Server
- **Description:** Broadcasts the transition to the next lot in the auction.
- **Callback Data:** An object containing:
  - `nextLotId` (Types.ObjectId): ID of the next lot.
  - `startTime` (Date): Start time of the next lot.
  - `endTime` (Date): End time of the next lot.

## Example Usage

### Joining a Room

```javascript
socket.emit('join-room', roomId, userId, isBuyer);
```

### Handling Successful Room Join

```javascript
socket.on('joined-room', (roomId) => {
  console.log(`Joined room: ${roomId}`);
});
```

### Placing a Bid

```javascript
socket.emit('bid', { roomId, lotId, supplierId, amount });
```

### Handling a New Bid

```javascript
socket.on('new-bid', (data) => {
  console.log('New bid received', data);
});
```

### Handling Errors

```javascript
socket.on('join-error', (errorMessage) => {
  console.error(errorMessage);
});

socket.on('bid-error', (errorMessage) => {
  console.error(errorMessage);
});
```

*This documentation should be kept updated to reflect any changes or additions to the socket events for smooth integration and use by all developers involved in the project.*
