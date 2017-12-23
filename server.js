'use strict';

const express = require('express');
const { Server } = require('http');
const socketio = require('socket.io');
const app = express();
const server = Server(app);
const managerIO = socketio(server);
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const state = require('./manager/streamState.js');
const streamEventHandler = require('./manager/streamEventHandler.js');

// This route is to keep the dyno from idling during usage
app.get('/ping-dyno', (req, res) => {
    console.log('Dyno pinged!');
    res.end();
});

// // Server is Listening
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

managerIO.on('connection', (socket) => {
    console.log(`Client connected to server: ${socket.id}`);

    // Add newly connected socket to a room
    socket.join('main-stream');

    // Tell each client that there is a stream active and disable the stream button
    managerIO.to('main-stream').emit('stream-active', state.isActive);

    socket.on('start-stream', () => {
        streamEventHandler(socket, managerIO);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected from server: ${socket.id}`);
    });
});
