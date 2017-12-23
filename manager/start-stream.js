'use strict';

const Twitter = require('twitter');
const { CK, CS, TK, TS } = require('./../auth/creds.js');
const timer = require('./seconds.js');
const state = require('./streamState.js');

const client = new Twitter({
  consumer_key: CK,
  consumer_secret: CS,
  access_token_key: TK,
  access_token_secret: TS
});

const options = {
    language: 'en',
    track: 'emotes,emote,gamewisp,twitchemoteartist',
};

// Connects with single socket and will emit to all sockets connected. This will limit many users from connecting.
// TODO once this is finished, create rooms / single stream channels?
const startStream = (socket, manager) => {
    state.stream = client.stream('statuses/filter', options);
    console.log('Stream started');
    const secondsInterval = setInterval(() => timer.increment(state.stream), 1000);

    // Log and emit errors to client
    state.stream.on('error', (error) => {
        console.log('Error', error);
        socket.emit('stream-error', error);
    });

    state.stream.on('end', (response) => {
        state.stream = null;
        clearInterval(secondsInterval);
        // Emit a 'stream-closed' event to the worker-socket connected
        socket.emit('stream-closed');
        console.log('Stream has ended', `${timer.seconds} seconds`);
    });
};

module.exports = { startStream };
