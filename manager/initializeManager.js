'use strict';

const state = require('./streamState.js');
const streamEventHandler = require('./streamEventHandler.js');

module.exports = (socket, manager) => {
    console.log(`Client connected to server: ${socket.id}`);

    // Add newly connected socket to a room
    socket.join('main-stream');

    // Tell each client that there is a stream active and disable the stream button
    manager.to('main-stream').emit('stream-active', state.isActive);

    socket.on('set-options', (options) => {
        if (state.isActive) {
            socket.emit('user-error', 'You cannot set a streams options after the stream has started.');
            return;
        }

        console.log(options);
        state.options = options;
    });

    socket.on('start-stream', () => {
        if (!state.options) {
            socket.emit('user-error', 'You must save stream options before starting a stream.');
            return;
        }

        streamEventHandler(socket, manager);
    });

    socket.on('stop-stream', () => {
        if (!state.stream) return;

        console.log('Attempting to destroy stream...');
        state.stream.destroy();
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected from server: ${socket.id}`);
    });
};