'use strict';

const { startStream } = require('./start-stream.js');
const { startDevStream } = require('./developmentStream.js');
const state = require('./streamState.js');
const timer = require('./seconds.js');
const formatStatus = require('./formatStatus.js');

const statusEvent = (data, socket, manager) => {
    console.log('Sending data to room');
    manager.to('main-stream').emit('received-status', formatStatus(data));
    timer.seconds = 0;
};

// Can emit to individual socket and the manager with these params
module.exports = (socket, manager) => {
    // Do not start a stream if there currently is one
    if (state.stream !== null) {
        state.isActive = true;
        socket.emit('stream-active', state.isActive);
        return;
    }

    // Start the stream and emit the data as it is received
    state.isActive = true;

    manager.to('main-stream').emit('stream-active', state.isActive);

    if (process.env.NODE_ENV === 'development') {
        console.log('Starting development stream...');
        startDevStream(socket, manager);
    } else {
        console.log('Starting production stream...');
        startStream(socket, manager);
    }

    state.stream.on('data', (data) => {
        // TODO check the room to see if there are any sockets connected
        // console.log(manager.sockets.adapter.rooms['main-stream']);
        // TODO if there are no sockets in the room it may not emit, need to test
        statusEvent(data, socket, manager);
    });

    state.stream.on('end', () => {
        state.isActive = false;
        manager.to('main-stream').emit('stream-active', state.isActive);
        manager.to('main-stream').emit('stream-closed');
    });
};   