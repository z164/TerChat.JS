const utility = require('../utility')
const toJSON = require('../toJSON')

const twitchRequirements = require('../twitch');

const twitch = (LoggedClients, ws, props, body, TwitchClients) => {
    let client
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (props.includes('--add')) {
        client = twitchRequirements.init(body, ws)
    } else if (props.includes('--remove')) {
        const clientToDC = TwitchClients.find(el => {
            console.log(el.opts.channels, body)
            const [currentChannel] = el.opts.channels
            const [bodyChannel] = body
            console.log(currentChannel.slice(1), bodyChannel)
            return currentChannel.slice(1) === bodyChannel
        })
        clientToDC.disconnect().then(() =>{
            ws.send(toJSON('Twitch client disconnected, translating messages from twitch chat to TerChat is stopped!'))
        });
    }
    if (client) {
        return client
    }
}

module.exports = twitch