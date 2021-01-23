const utility = require('../utility')
const toJSON = require('../toJSON')
const moment = require('moment')

const w = (LoggedClients, ws, props, body) => {
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

module.exports = w