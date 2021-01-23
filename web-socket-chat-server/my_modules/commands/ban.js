const utility = require('../utility')
const toJSON = require('../toJSON')

const Ban = require('../../DataBase/Ban')
const User = require('../../DataBase/User')


const ban = (LoggedClients, ws, props, body) => {
    const [currentUser] = utility.loginCheck(LoggedClients, ws)
    const [seconds] = body

    if (!currentUser) {
        ws.send(toJSON('Please, use login / register command first!'))
        return
    }
    if (utility.isAdmin(currentUser)) {
        ws.send(toJSON('You have no permissions to use this command'))
        return
    }
    const cutProps = props.map(el => el.slice(2))
    let dateOfExpiration = new Date()
    if (seconds) {
        dateOfExpiration.setSeconds(dateOfExpiration.getSeconds() + parseInt(seconds))
    } else { 
        dateOfExpiration.setSeconds(dateOfExpiration.getSeconds() + 600)
    }
    cutProps.forEach(el => {
        User.findOne({
            name: el
        }, (err, user) => {
            Ban.create({
                user: user._id,
                dateOfExpiration: dateOfExpiration
            }, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        })
    })
}

module.exports = ban