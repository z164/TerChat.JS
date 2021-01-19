const ws = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const email = require('./my_modules/email');
const utility = require('./my_modules/utility');
const User = require('./DataBase/User');

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
    switch (messageJSON.command) {
        case 'login':
            login(ws, messageJSON.props, messageJSON.body);
            break;
        case 'register':
            register(ws, messageJSON.props, messageJSON.body);
            break;
        case 'logout':
            logout(ws, messageJSON.props, messageJSON.body);
            break;
        case 'activate':
            activate(ws, messageJSON.props, messageJSON.body);
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
    const [email, name, password] = body
    User.create({
        email: email,
        name: name,
        password: password
    }, (err) => {
        if (err) {
            console.error(err);
        } else {
            ws.send(toJSON('User created succesfully. Please confirm your email before you can use all the features of TerChat'))
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
        if (res.length === 0) {
            ws.send(toJSON('Failure'))
            return
        }
        // Pushing websocket and user info from mongoDB to array of current clients
        LoggedClients.push({
            socket: ws,
            data: res[0]
        })
        ws.send(toJSON('Succesfully logged in!',[`name ${name}`]))
        server.clients.forEach(el => el.send(toJSON(`${name} has joined the chat!`, ['right'])))
        ws.on('close', () => {
            const name = utility.getNameFromSocket(LoggedClients, ws)
            server.clients.forEach(el => el.send(toJSON(`${name} had left us!`, ['right'])))
            LoggedClients = utility.popFromArrayByName(LoggedClients, name) /// BRING IT BACK TO CONST!!!! (OPTIONALY :) )
        })
    })
}
const logout = (ws, props, body) => {
    const index = LoggedClients.findIndex(el => el.socket === ws)
    LoggedClients.splice(index, 1)
    ws.send(toJSON('Logged out', ['name logout']))
    // server.clients.forEach(el => {
    //     el.send(toJSON(`${utility.getNameFromSocket(LoggedClients, ws)} had left us!`, ['right']))
    // })
}

const all = (ws, props, body) => {
    const [ currentUser ]  = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if(!utility.activationCheck(currentUser)) {
        ws.send(toJSON('Please, activate your account before you can use this command'))
        return
    }
    server.clients.forEach((el) => {
        el.send(toJSON(`${body.join(' ')}`, [`author ${currentUser.data.name}`, 'right']))
    })
}

const w = (ws, props, body) => {
    const [currentUser, currentUserIndex] = utility.loginCheck(LoggedClients, ws)
    const cutProps = props.map(el => el.slice(2))
    cutProps.forEach(el => {
        const socket = utility.getSocketFromName(LoggedClients, el)
        socket.send(toJSON(`${body.join(' ')}`, [`author ${currentUser.data.name}`, 'right', 'whisper']))
    })
}

const activate = (ws, props, body) => {
    const [currentUser, currentUserIndex] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (props.includes('--request') && !currentUser.data.verified) { // If prop --request is passed, a random 5 digit code is generated and sent it to user's, email
        const code = email(currentUser.data.name, currentUser.data.email) // Email module returns code, that was sent
        currentUser.code = code // Code appends as a currentUser prop
        LoggedClients.splice(currentUserIndex, 1, currentUser) // Item gets overwritten in LoggedClients array
        return
    } else if (props.includes('--confirm')) { // When confirm prop is recieved code should appear in body of command
        if(currentUser.code === body[0]) { // If body recieved is equal to currentUser's code, then user is verified
            User.findOneAndUpdate({ _id: currentUser.data._id }, { verified: true }, (err,res) =>{
                if(err) {
                    console.error(err)
                }
                ws.send(toJSON('Your account was activated!'))
            })
        }
    }
}

const toJSON = (body, props) => {
    return JSON.stringify({
        body: body,
        props: props
    })
}