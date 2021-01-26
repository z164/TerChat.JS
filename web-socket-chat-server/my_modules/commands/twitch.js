const utility = require('../utility')
const toJSON = require('../toJSON')

const twitchRequirements = require('../twitch');

const twitch = (LoggedClients, ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    twitchRequirements.init(body, ws)
}

module.exports = twitch