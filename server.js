'use strict';

const express = require('express');
const { Server } = require('http');
const socketio = require('socket.io');
const app = express();
const server = Server(app);
const managerIO = socketio(server);
const PORT = process.env.PORT || 3000;
const { startStream } = require('./stream/start-stream.js');
const timer = require('./stream/seconds.js');
const state = require('./stream/streamState.js');

const statusEvent = (data, socket) => {
    console.log('Sending data to worker', socket.id);
    socket.emit('worker-status', data);
    timer.seconds = 0;
};

// // Server is Listening
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

managerIO.on('connection', (workerSocket) => {
    console.log(`Manager connected to the worker: worker id ${workerSocket.id}`);

    // This will only send data to the client / worker sockets who have initiated the stream
    workerSocket.on('start-client-stream', () => {
        // Do not start a stream if there currently is one
        if (state.stream !== null) {
            workerSocket.emit('stream-active', true);
            return;
        }

        // Start the stream and emit the data as it is received
        startStream(workerSocket, managerIO);
        state.stream.on('data', (data) => {
            // Do no emit the data to a workerSocket that is no longer connected
            if (workerSocket.connected) {
                statusEvent(data, workerSocket);
            }
        });
    });

    // If there is currently a stream open
    if (state.stream !== null) {
        console.log('New worker has connected', workerSocket.id);
        stream.on('data', (data) => {
            statusEvent(data, workerSocket);
        });

        state.stream.on('end', () => {
            workerSocket.emit('stream-closed');
        });
    }

    workerSocket.on('disconnect', () => {
        console.log(`Manager disconnected from worker: worker id ${workerSocket.id}`);
    });
});
