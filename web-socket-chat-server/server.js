const ws = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const toJSON = require('./my_modules/toJSON')
const createHistory = require('./my_modules/createHistory')

const activate = require('./my_modules/commands/activate')
const all = require('./my_modules/commands/all')
const ban = require('./my_modules/commands/ban')
const info = require('./my_modules/commands/info')
const login = require('./my_modules/commands/login')
const logout = require('./my_modules/commands/logout')
const online = require('./my_modules/commands/online')
const register = require('./my_modules/commands/register')
const w = require('./my_modules/commands/w')
const twitch = require('./my_modules/commands/twitch')

dotenv.config();

const server = new ws.Server({
    port: 3000
})

// Array to differentiate clients
let LoggedClients = [] // BRING IT BACK TO CONST !!!!

// Connection to MongoDB
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, () => {
    console.log('MongoDB cluster connection established')
})

// Event listener for connection to server
server.on('connection', (ws) => {
    ws.send(toJSON('Connected to server'))
    ws.send(toJSON('To login use "login NAME PASSWORD" command.'))
    ws.send(toJSON('To register use "register EMAIL NAME PASSWORD" command.'))
    createHistory(ws)
    ws.on('message', (message) => {
        parseCommand(message, ws)
    })
    ws.on('close', (e) => {

    })
})

// Parsing command that came from client
const parseCommand = (message, ws) => {
    const messageJSON = JSON.parse(message)
    console.log(messageJSON)
    const {
        command,
        props,
        body
    } = messageJSON
    switch (command) {
        case 'login':
            login(server, LoggedClients, ws, props, body);
            break;
        case 'register':
            register(ws, props, body);
            break;
        case 'logout':
            logout(server, LoggedClients, ws, props, body);
            break;
        case 'activate':
            activate(LoggedClients, ws, props, body);
            break;
        case 'all':
            all(server, LoggedClients, ws, props, body);
            break;
        case 'w':
            w(LoggedClients, ws, props, body);
            break;
        case 'online':
            online(LoggedClients, ws, props, body);
            break;
        case 'info':
            info(LoggedClients, ws, props, body);
            break;
        case 'ban':
            ban(LoggedClients, ws, props, body);
            break;
        case 'twitch':
            twitch(LoggedClients, ws, props, body);
            break;
        default:
            ws.send(toJSON(`${command}: command not found`))
            break;
    }
}