export const ChatEvents = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: 'connected',
  // ? when user gets disconnected
  DISCONNECT_EVENT: 'disconnect',
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: 'socketError',
  // ? when a notification is received
  NOTIFICATION_EVENT: 'notification',
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: 'joinChat',
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: 'messageReceived',
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: 'newChat',

  // ? when participant stops typing
  STOP_TYPING_EVENT: 'stopTyping',
  // ? when participant starts typing
  TYPING_EVENT: 'typing',
});
