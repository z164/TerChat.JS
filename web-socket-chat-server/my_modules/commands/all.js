const utility = require('../utility')
const toJSON = require('../toJSON')

const moment = require('moment');
const Ban = require('../../DataBase/Ban')
const Message = require('../../DataBase/Message')


const all = (server, LoggedClients, ws, props, body) => {
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
        if (ban) {
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

module.exports = all