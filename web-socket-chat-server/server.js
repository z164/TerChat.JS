const ws = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const email = require('./my_modules/email');
const validate = require('./my_modules/validation');
const User = require('./DataBase/User');

dotenv.config();

const server = new ws.Server({
    port: 3000
})

// Array to differentiate clients
const LoggedClients = []

// Connection to MongoDB
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, () => {
    console.log('connected to db')
})

// Event listener for connection to server
server.on('connection', (ws) => {
    ws.send(`Connected to server.`)
    ws.send(`To login use 'login NAME PASSWORD' command.`)
    ws.send(`To sign up use 'register' command.`)
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
            ws.send('User created succesfully. Please confirm your email before you can use all the features of TerChat')
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
            ws.send('Failure')
            return
        }
        // Pushing websocket and user info from mongoDB to array of current clients
        LoggedClients.push({
            socket: ws,
            data: res[0]
        })
        ws.send(`Succesfully logged in! | name ${name}--check`)
    })
}

const logout = (ws, props, body) => {
    const index = LoggedClients.findIndex(el => el.socket === ws)
    LoggedClients.splice(index, 1)
    ws.send('Logged out | name logout')
}

const all = (ws, props, body) => {
    const [ currentUser ]  = validate.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(`Please, use login / register command first!`)
        return
    }
    if(!validate.activationCheck(currentUser)) {
        ws.send('Please, activate your account before you can use this command')
        return
    }
    server.clients.forEach((el) => {
        el.send(`${body.join(' ')}| author ${currentUser.data.name}`)
    })
}

const w = (ws, props, body) => {
    const [currentUser, currentUserIndex] = validate.loginCheck(LoggedClients, ws)
    
    
}

const activate = (ws, props, body) => {
    const [currentUser, currentUserIndex] = validate.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(`Please, use login / register command first!`)
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
                ws.send('Your account was activated!')
            })
        }
    }
}