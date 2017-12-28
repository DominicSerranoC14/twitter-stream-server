'use strict';

const { startStream } = require('./start-stream.js');
const { startDevStream } = require('./developmentStream.js');
const { streams } = require('./streamState.js');
const timer = require('./seconds.js');
const formatStatus = require('./formatStatus.js');

const statusEvent = (data, socket, manager) => {
    console.log('Sending data to room');
    manager.to(socket.id).emit('received-status', formatStatus(data));
    timer.seconds = 0;
};

// Can emit to individual socket and the manager with these params
module.exports = (socket, manager) => {    
    // Start the stream and store the streamInterval to be cleared later
    if (process.env.NODE_ENV === 'development') {
        console.log('Starting development stream...');
        startDevStream(socket, manager);
    } else {
        console.log('Starting production stream...');
        startStream(socket, manager);
    }
    
    // Set the stream to active
    streams[socket.id].isActive = true;
    manager.to(socket.id).emit('stream-active', streams[socket.id].isActive);
    // Give the stream a timestamp to calculate duration on the client
    streams[socket.id].createdAt = new Date();

    // Set event listener for data being sent to the stream
    streams[socket.id].stream.on('data', data => {
        statusEvent(data, socket, manager);
    });

    // Log and emit errors to client
    streams[socket.id].stream.on('error', (error) => {
        console.log('Error', error);
        manager.to(socket.id).emit('stream-error', error);
    });

    streams[socket.id].stream.on('end', (response) => {
        // Clear the counter interval
        clearInterval(streams[socket.id].streamInterval);
        // Reset the stream object
        streams[socket.id].flush();
        // Reset the client to an inactive state
        manager.to(socket.id).emit('stream-active', streams[socket.id].isActive);
        // Emit a 'stream-closed' event to the worker-socket connected
        manager.to(socket.id).emit('stream-closed');
        // Remove stream object from streams collection
        delete streams[socket.id];        

        console.log('Stream has ended and been removed');
    });
};   