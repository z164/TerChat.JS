const ws = require('ws');
const mongoose = require('mongoose');
const moment = require('moment')
const dotenv = require('dotenv');
const email = require('./my_modules/email');
const utility = require('./my_modules/utility');
const User = require('./DataBase/User');
const Message = require('./DataBase/Message')
const Ban = require('./DataBase/Ban')

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
            login(ws, props, body);
            break;
        case 'register':
            register(ws, props, body);
            break;
        case 'logout':
            logout(ws, props, body);
            break;
        case 'activate':
            activate(ws, props, body);
            break;
        case 'all':
            all(ws, props, body);
            break;
        case 'w':
            w(ws, props, body);
            break;
        case 'online':
            online(ws, props, body);
            break;
        case 'info':
            info(ws, props, body);
            break;
        case 'ban':
            ban(ws, props, body);
            break;
        default:
            ws.send(toJSON(`${command}: command not found`))
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
            ws.send(toJSON('User created successfully. Please confirm your email before you can use all the features of TerChat'))
        }
    })
}

const login = (ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (currentUser) {
        ws.send(toJSON('You are already logged in. Use logout command to switch to another account'))
        return
    }
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
        ws.send(toJSON('Successfully logged in!', [`name ${name}`]))
        server.clients.forEach(el => el.send(toJSON(`${name} has joined the chat!`, ['right'])))
        ws.on('close', () => {
            const name = utility.getNameFromSocket(LoggedClients, ws)
            server.clients.forEach(el => el.send(toJSON(`${name} had left us!`, ['right'])))
            LoggedClients = utility.popFromArrayByName(LoggedClients, name) /// BRING IT BACK TO CONST!!!! (OPTIONALY :) )
        })
    })
}
const logout = (ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('You are not logged in!'))
        return
    }
    const index = LoggedClients.findIndex(el => el.socket === ws)
    LoggedClients.splice(index, 1)
    ws.send(toJSON('Logged out', ['name logout']))
    server.clients.forEach(el => {
        el.send(toJSON(`${currentUser.data.name} had left us!`, ['right']))
    })
}

const all = (ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    const date = Date.now()
    let isBanned = false
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (!utility.activationCheck(currentUser)) {
        ws.send(toJSON('Please, activate your account before you can use this command'))
        return
    }
    Ban.findOne({
        user: currentUser.data._id
    }).then((ban) => {
        if (!ban) {
            return;
        }
        if (ban.dateOfExpiration > Date.now()) {
            isBanned = true
            const ms = moment(ban.dateOfExpiration).diff(moment(new Date))
            const date = moment(ms)
            ws.send(toJSON(`You are banned for ${date.format('mm:ss')}<br>This means your ban will expire at <b>${moment(ban.dateOfExpiration).format('MMMM, DD, HH:mm')}</b>`))
        } else {
            Ban.findByIdAndDelete(ban._id, (err, res) => {
                if (err) {
                    console.error(err)
                }
            })
        }
        if (isBanned) {
            return
        }
        Message.create({
            user: currentUser.data._id,
            message: body.join(' '),
            date: date
        }, (err) => {
            if (err) {
                console.error(err)
            }
        })
        server.clients.forEach((el) => {
            el.send(toJSON(`${body.join(' ')}`, [`author ${currentUser.data.name}`, 'right', `time ${moment(date).format('HH, mm')}`]))
        })
    })

}

const w = (ws, props, body) => {
    const [currentUser, currentUserIndex] = utility.loginCheck(LoggedClients, ws)
    const cutProps = props.map(el => el.slice(2))
    cutProps.forEach(el => {
        const socket = utility.getSocketFromName(LoggedClients, el)
        if (!socket) {
            ws.send(toJSON(`User you mentioned is either offline or does not exist`))
            return
        }
        socket.send(toJSON(`${body.join(' ')}`, [`author ${currentUser.data.name}`, 'right', 'whisper', `time ${moment(Date.now()).format('HH, mm')}`]))
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
        if (currentUser.code === body[0]) { // If body recieved is equal to currentUser's code, then user is verified
            User.findOneAndUpdate({
                _id: currentUser.data._id
            }, {
                verified: true
            }, (err, res) => {
                if (err) {
                    console.error(err)
                }
                ws.send(toJSON('Your account was activated!'))
            })
        }
    }
}

const online = (ws, props, body) => {
    let res = []
    LoggedClients.forEach(el => res.push(el.data.name))
    const count = res.length
    res = `<br>${res.join('<br>')}`
    ws.send(toJSON(`Users online - ${count}${res}`))
}

const info = (ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (props.includes('--show')) {
        const {
            permissions,
            verified,
            date,
            _id,
            email,
            name,
            password
        } = currentUser.data
        ws.send(toJSON(`Name: ${name}`))
        ws.send(toJSON(`Email: ${email}`))
        ws.send(toJSON(`Verified: ${verified}`))
        ws.send(toJSON(`Permissions: ${permissions}`))
        ws.send(toJSON(`Registration date: ${moment(date).format('MMMM, DD, YYYY')} (${moment(date).fromNow()})`))
    }
}

const toJSON = (body, props) => {
    return JSON.stringify({
        body: body,
        props: props
    })
}

const createHistory = (ws) => {
    Message.find({})
        .populate('user')
        .exec((err, message) => {
            if (err) {
                return console.error(err)
            }
            message.forEach(el => {
                const fullTime = moment(el.date).format('MMMM, DD, HH, mm')
                const hoursAndMinutes = moment(el.date).format('HH, mm')
                const condition = moment(el.date).format('MMMM, DD, YYYY') === moment(Date.now()).format('MMMM, DD, YYYY')
                ws.send(toJSON(el.message, [`author ${el.user.name}`, 'right', `time ${ condition ? hoursAndMinutes : fullTime }`]))
            })
        })
}

const ban = (ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (utility.isAdmin(currentUser)) {
        ws.send(toJSON('You have no permissions to use this command'))
        return
    }
    const cutProps = props.map(el => el.slice(2))
    const dateOfExpiration = new Date()
    dateOfExpiration.set
    cutProps.forEach(el => {
        User.findOne({
            name: el
        }, (err, user) => {
            Ban.create({
                user: user._id,
            }, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        })
    })
}