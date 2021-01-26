const utility = require('../utility')
const toJSON = require('../toJSON')
const moment = require('moment')

const User = require('../../DataBase/User')

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
    } else if (props.includes('--edit')) {
        let [field, data] = body
        let prevState
        switch (field) {
            case 'name':
                prevState = currentUser.data.name
                data = {
                    name: data
                }
                break
            case 'email':
                prevState = currentUser.data.email
                data = {
                    email: data
                }
                break
            case 'password':
                prevState = currentUser.data.password
                data = {
                    password: data
                }
                break
        }
        User.findOneAndUpdate({
            _id: currentUser.data._id
        }, data, (err, res) => {
            if(err) {
                console.error(err)
            }
            ws.send(toJSON(`Changed ${field} state from ${prevState} to ${data}`))
        })
    }
}

module.exports = info