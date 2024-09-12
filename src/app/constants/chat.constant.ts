export const ChatEvents = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: 'connected',
  // ? when user gets disconnected
  DISCONNECT_EVENT: 'disconnect',
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: 'socketError',
  // ? when a notification is received
  NOTIFICATION_EVENT: 'notification',
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: 'messageReceived',
});
