module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join server room
    socket.on('join-server', (serverId) => {
      socket.join(`server-${serverId}`);
    });

    // Broadcast updates ke semua client di server tersebut
    socket.on('update-orders', (serverId, data) => {
      io.to(`server-${serverId}`).emit('orders-updated', data);
    });

    socket.on('update-stok', (serverId, data) => {
      io.to(`server-${serverId}`).emit('stok-updated', data);
    });

    socket.on('new-chat', (serverId, data) => {
      io.to(`server-${serverId}`).emit('chat-received', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
