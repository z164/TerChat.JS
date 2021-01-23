const utility = require('../utility')
const toJSON = require('../toJSON')
const moment = require('moment')

const info = (LoggedClients, ws, props, body) => {
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

module.exports = info