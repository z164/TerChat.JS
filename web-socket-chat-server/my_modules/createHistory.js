const toJSON = require('./toJSON')

const Message = require('../DataBase/Message')
const moment = require('moment');

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

module.exports = createHistory