const utility = require('../utility')
const toJSON = require('../toJSON')

const logout = (server, LoggedClients, ws, props, body) => {
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

module.exports = logout