const dotenv = require('dotenv');
const tmi = require('tmi.js')

const toJSON = require('./toJSON')

dotenv.config()

const init = (channels, ws) => {
    const opts = {
        identity: {
            username: process.env.TWITCH_USER,
            password: process.env.TWITCH_OAUTH
        },
        channels: [
            ...channels
        ]
    };
    const client = new tmi.Client(opts)
    client.on('message', (target, context, message, self) => {
        ws.send(toJSON(`${context.username}: ${message}`, [`author ${target.slice(1)}`]));
    })
    client.connect()
}
module.exports = {
    init
}