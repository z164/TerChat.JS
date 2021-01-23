const toJSON = require('../toJSON')

const online = (LoggedClients, ws, props, body) => {
    let res = []
    LoggedClients.forEach(el => res.push(el.data.name))
    const count = res.length
    res = `<br>${res.join('<br>')}`
    ws.send(toJSON(`Users online - ${count}${res}`))
}

module.exports = online