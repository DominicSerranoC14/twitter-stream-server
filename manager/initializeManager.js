'use strict';

const { createNewStreamObject, streams } = require('./streamState.js');
const streamEventHandler = require('./streamEventHandler.js');

module.exports = (socket, manager) => {
    console.log(`Client connected to server: ${socket.id}`);

    // Add newly connected socket to a room
    // socket.join('main-stream');

    // Tell each client that there is a stream active and disable the stream button
    // manager.to('main-stream').emit('stream-active', state.isActive);

    // If options exist when a socket joins, send the options and stream start time to the client
    // if (state.options && state.isActive) {
    //     socket.emit('stream-options', state.options);
    // }

    // Event listners on the worker socket are set here.
    // TODO This should be broken out into another module
    socket.on('set-options', (options) => {
        if (Object.keys(streams).length === 2) {
            socket.emit('user-error', 'The maximum amount of streams are open. You can join an active stream.');
            return;
        }

        // Create a new stream object
        createNewStreamObject(socket.id);
        // Set the streams options
        streams[socket.id].options = options;
    });

    socket.on('start-stream', () => {
        // If there are more than two active streams do not let the user create a new stream
        // TODO this can be improved by calculating whether or not enough time has passed between creating streams to not hit a 420 from Twitter
        if (!streams[socket.id]) {
            socket.emit('user-error', 'Save your options before starting a stream.');
            return;
        }

        // Create a new room with the id of the socket that started the stream
        socket.join(socket.id);

        // Initialize the stream and the event listeners on this newly created stream
        streamEventHandler(socket, manager);
    });

    socket.on('stop-stream', () => {
        console.log('Attempting to destroy stream...');
        // Must check for development, using two different event emitters
        if (process.env.NODE_ENV === 'development') {
            streams[socket.id].stream.emit('end');
        } else {
            streams[socket.id].stream.destroy();
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected from server: ${socket.id}`);
    });
};