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
    
    // Start the stream and store the streamInterval to be cleared later
    if (process.env.NODE_ENV === 'development') {
        console.log('Starting development stream...');
        state.streamInterval = startDevStream(socket, manager);
    } else {
        console.log('Starting production stream...');
        state.streamInterval = startStream(socket, manager);
    }
    
    // Set the state to active, and create a createdAt time stamp
    state.isActive = true;
    manager.to('main-stream').emit('stream-active', state.isActive);

    // Add timestamp to stream object
    state.options.createdAt = new Date();

    state.stream.on('data', (data) => {
        // TODO check the room to see if there are any sockets connected
        // console.log(manager.sockets.adapter.rooms['main-stream']);
        // TODO if there are no sockets in the room it may not emit, need to test
        statusEvent(data, socket, manager);
    });

    // Log and emit errors to client
    state.stream.on('error', (error) => {
        console.log('Error', error);
        socket.emit('stream-error', error);
    });

    state.stream.on('end', (response) => {
        // Clear the counter interval
        clearInterval(state.streamInterval);
        // Reset the stream object
        state.flush();
        // Reset the client to an inactive state
        manager.to('main-stream').emit('stream-active', state.isActive);
        // Emit a 'stream-closed' event to the worker-socket connected
        manager.to('main-stream').emit('stream-closed');

        console.log('Stream has ended');
    });
};   