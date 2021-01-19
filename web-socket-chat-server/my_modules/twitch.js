const dotenv = require('dotenv');
const tmi = require('tmi.js')

dotenv.config()

const init = (channels) => {
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
    client.on('message', messageHandler)
    client.connect()
}

const messageHandler = (target, context, message, self) => {
    if(self) {
        return
    }
    console.log(`[${target.slice(1)}] ${context.username}: ${message}`);
}

init(['alohadancetv'])