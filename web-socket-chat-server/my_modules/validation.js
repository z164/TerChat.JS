const loginCheck = (LoggedClients, ws) => {
    const currentUser = LoggedClients.find(el => el.socket === ws)
    const currentUserIndex = LoggedClients.findIndex(el => el.socket === ws)
    return [currentUser, currentUserIndex]
}
const activationCheck = (currentUser) => {
    return currentUser.data.verified
}
module.exports = {
    loginCheck,
    activationCheck
}