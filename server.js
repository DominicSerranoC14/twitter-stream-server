'use strict';

const express = require('express');
const { Server } = require('http');
const socketio = require('socket.io');
const app = express();
const server = Server(app);
const managerIO = socketio(server);
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const socketEventHandlers = require('./manager/socketEventHandlers.js');

// This route is to keep the heroku dyno from idling during usage
app.get('/ping-dyno', (req, res) => {
    console.log('Dyno pinged!');
    res.end();
});

// // Server is Listening
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

managerIO.on('connection', (socket) => {
    socketEventHandlers(socket, managerIO);
});