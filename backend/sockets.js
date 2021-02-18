const io = require('socket.io')();

const { socketRequireAuth } = require('./utils/auth');

const roomMap = {};
const liveUsers = new Set();

io.use(socketRequireAuth)
  .on('connection', (socket) => {
    // socketRequireAuth guarantees we will have both socket.user and
    // socket.handshake.query.type
    const { user, handshake: { query: { type } } } = socket;
    switch (type) {
      case 'chat':
        // lookup all conversations in which socket.user is a participant
        user.getChats()
          .then(convos => {
            // this will always be an array, just sometimes it will be empty.
            convos.forEach(convo => {
              // frontend emits 'viewing-#' event when an individual
              // conversation is selected.
              socket.on(`viewing-${convo.id}`, () => {
                // iterate over the previously enumerated conversations,
                // looking up their rooms in the room map and deleting this
                // user from their viewers, enabling this user to be notified
                // of new messages in that conversation.
                convos.forEach(({ id }) => {
                  if (
                    roomMap[id] &&
                    roomMap[id].has(user.id)
                  ) roomMap.delete(user.id);
                });
                // if this room has never been viewed before (either it's a
                // new conversation, or the server has restarted since the last
                // time anyone viewed it, create a new room participant tracker
                if (!roomMap[convo.id]) roomMap[convo.id] = new Set();
                roomMap[convo.id].add(user.id);
              });
              // Join the socket room! Socket.IO will automatically create it
              // if it doesn't exist. Like magic!
              socket.join(convo.id);
              // Frontend emits conversation-specific events on message
              socket.on(`convo-${convo.id}`, (content) => {
                // assume all messages coming in from authenticated socket are
                // created by the user to whom that authentication belongs;
                // anything else would require cracking JWT secret which is
                // particularly unlikely.
                user.createSentMessage({
                  conversationId: convo.id,
                  content
                })
                  // only emit new message event after message has been created
                  // in database.
                  .then(({ content }) => {
                    socket.to(convo.id).emit(`convo-${convo.id}`, content, user);
                  });
                convo.getChattingUsers()
                  .then(users => {
                    const toNotify = [];
                    users.forEach(chattingUser => {
                      // If a user is not currently viewing a room, create a notif
                      // in the database regardless of whether they're online.
                      if (!roomMap[convo.id].has(chattingUser.id)) {
                        toNotify.push(chattingUser.id);
                        chattingUser.createNotification({
                          conversationId: convo.id
                        });
                      }
                    });
                    toNotify.forEach(userId => {
                      // If and only if a user is actively online, also emit a live
                      // notification event letting them know they've received a
                      // message.
                      if (liveUsers.has(userId)) {
                        io.to(`notif-${userId}`).emit(`convo-notif-${convo.id}`);
                      }
                    });
                  });
              });
              // If a socket disconnects, it's physically impossible for that user
              // to be actively viewing the room; remove them from the viewing user
              // list.
              socket.on('disconnect', () => {
                roomMap[convo.id].delete(user.id);
              });
            });
          });
        break;
      case 'notif':
        // Create a room just for this user's notifications to be received.
        socket.join(`notif-${user.id}`);
        // Add the user to the running list of all connected users.
        liveUsers.add(user.id);
        // On disconnect, remove them from the runing list of connected users.
        socket.on('disconnect', () => {
          liveUsers.delete(user.id);
        });
        break;
      default:
        // If a correct type is not supplied by the socket query, it is roque;
        // force disconnect and close the underlying connection.
        return socket.disconnect(true);
    }
  });

module.exports = io;
