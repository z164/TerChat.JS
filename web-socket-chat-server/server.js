const ws = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./DataBase/User');

dotenv.config();

const server = new ws.Server({
    port: 3000
})

// Array to differentiate clients

const LoggedClients = []


mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to db')
})


server.on('connection', (ws) => {
    ws.send(`Connected to server.`)
    ws.send(`To login use 'login NAME PASSWORD' command.`)
    ws.send(`To sign up use 'register' command.`)
    ws.on('message', (message) => {
        parseCommand(message, ws)
    })
})


const parseCommand = (message, ws) => {

    const messageJSON = JSON.parse(message)
    console.log(messageJSON)
    switch (messageJSON.command) {
        case 'login':
            login(ws, messageJSON.props, messageJSON.body);
            break;
        case 'register':
            register(ws, messageJSON.props, messageJSON.body);
            break;
        case 'all':
            all(ws, messageJSON.props, messageJSON.body);
            break;
        case 'w':
            w(ws, messageJSON.props, messageJSON.body);
            break;
        default:
            ws.send(`${messageJSON.command}: command not found`)
            break;
    }
}

const register = (ws, props, body) => {
    const [email, password, name] = body
    User.create({
        email: email,
        password: password,
        name: name
    }, (err) => {
        if (err) {
            console.error(err);
        } else {
            ws.send('User created succesfully. Please confirm your email before you can login into your account')
        }
    })
}

const login = (ws, props, body) => {
    const [name, password] = body
    User.find({
        name: name,
        password: password
    }, (err, res) => {
        if (err) {
            console.error(err)
        }
        LoggedClients.push({
            socket: ws,
            data: res[0]
        })
        ws.send('Succesfully logged in!')
    })
}

const all = (ws, props, body) => {
    const currentUser = LoggedClients.find(el => el.socket === ws)
    if(!currentUser) {
        el.send(`Please, use login / register command first!`)
    }
    server.clients.forEach((el) => {
        el.send(`${currentUser.data.name}: ${body.join(' ')}`)
    })
}