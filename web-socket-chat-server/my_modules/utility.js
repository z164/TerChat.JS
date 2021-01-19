const loginCheck = (LoggedClients, ws) => {
    const currentUser = LoggedClients.find(el => el.socket === ws)
    const currentUserIndex = LoggedClients.findIndex(el => el.socket === ws)
    return [currentUser, currentUserIndex]
}
const activationCheck = (currentUser) => {
    return currentUser.data.verified
}
const getSocketFromName = (LoggedClients, name) => {
    const user = LoggedClients.find(el => el.data.name === name)
    if (user) {
        return user.socket
    }
}
const getNameFromSocket = (LoggedClients, ws) => {
    const user = LoggedClients.find(el => el.socket === ws)
    console.log(user)
    if(user) {
        return user.data.name
    }
}
const popFromArrayByName = (LoggedClients, name) => {
    return LoggedClients.filter(el => el.data.name !== name)
}
module.exports = {
    loginCheck,
    activationCheck,
    getSocketFromName,
    getNameFromSocket,
    popFromArrayByName
}