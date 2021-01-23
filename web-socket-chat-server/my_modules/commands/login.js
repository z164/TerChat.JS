const User = require('../../DataBase/User');

const utility = require('../utility')
const toJSON = require('../toJSON')

const login = (server, LoggedClients, ws, props, body) => {
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

module.exports = login