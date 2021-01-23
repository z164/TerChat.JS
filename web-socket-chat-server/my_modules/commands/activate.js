const utility = require('../utility')
const toJSON = require('../toJSON')
const email = require('../email')

const User = require('../../DataBase/User')

const activate = (LoggedClients, ws, props, body) => {
    const [currentUser, currentUserIndex] = utility.loginCheck(LoggedClients, ws)
    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (props.includes('--request') && !currentUser.data.verified) { // If prop --request is passed, a random 5 digit code is generated and sent it to user's, email
        const code = email(currentUser.data.name, currentUser.data.email) // Email module returns code, that was sent
        currentUser.code = code // Code appends as a currentUser prop
        LoggedClients.splice(currentUserIndex, 1, currentUser) // Item gets overwritten in LoggedClients array
        ws.send(toJSON(`Code was sent to ${currentUser.data.email}. Please use 'activate --confirm CODE'`))
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

module.exports = activate