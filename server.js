'use strict';

const express = require('express');
const { Server } = require('http');
const socketio = require('socket.io');
const app = express();
const server = Server(app);
const managerIO = socketio(server);
const PORT = process.env.PORT || 3000;
const { startStream } = require('./manager/start-stream.js');
const timer = require('./manager/seconds.js');
const state = require('./manager/streamState.js');
const formatStatus = require('./manager/formatStatus.js');

// Move to module
let isActive = false;

const statusEvent = (data, socket) => {
    console.log('Sending data to client', socket.id);
    managerIO.to('main-stream').emit('received-status', data);
    timer.seconds = 0;
};

// // Server is Listening
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

managerIO.on('connection', (socket) => {
    console.log(`Server connected to client: ${socket.id}`);

    // Add newly connected socket to a room
    socket.join('main-stream');

    // Tell each client that there is a stream active and disable the stream button
    managerIO.to('main-stream').emit('stream-active', isActive);

    // This will only send data to the client / worker sockets who have initiated the stream
    socket.on('start-stream', () => {
        // Do not start a stream if there currently is one
        if (state.stream !== null) {
            isActive = true;
            socket.emit('stream-active', isActive);
            return;
        }

        // Start the stream and emit the data as it is received
        isActive = true;
        managerIO.to('main-stream').emit('stream-active', isActive);
        startStream(socket, managerIO);
        state.stream.on('data', (data) => {
            // Do no emit the data to a socket that is no longer connected
            if (socket.connected) {
                statusEvent(data, socket);
            }
        });
    });

    // If there is currently a stream open
    if (state.stream !== null) {
        console.log('New worker has connected', socket.id);
        stream.on('data', (data) => {
            statusEvent(data, socket);
        });

        state.stream.on('end', () => {
            socket.emit('stream-closed');
        });
    }

    socket.on('disconnect', () => {
        console.log(`Manager disconnected from worker: worker id ${socket.id}`);
    });
});
