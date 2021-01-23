const User = require('../../DataBase/User')
const toJSON = require('../toJSON')

const register = (ws, props, body) => {
    const [email, name, password] = body
    User.create({
        email: email,
        name: name,
        password: password
    }, (err) => {
        if (err) {
            console.error(err);
        } else {
            ws.send(toJSON('User created successfully. Please confirm your email before you can use all the features of TerChat'))
        }
    })
}

module.exports = register