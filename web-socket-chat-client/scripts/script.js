const currentLine = $('.terminal-content-current')
const history = $('.terminal-content-history')
const content = $('.terminal-content')

// Keep current line in terminal always in focus
$('document').ready(() => {
    currentLine.focus()
})
currentLine.on('blur', () => {
    currentLine.focus()
})

// Connection to server and event listeners
ws = new WebSocket('ws://localhost:3000')
ws.onopen = () => {

}
ws.onmessage = (e) => {
    history.append(`<span>[Server]: ${e.data}`)
    content.scrollTop(999)
}

currentLine.on('keypress', function (e) {
    if (e.which == 13) {
        e.preventDefault();
        history.append(`<span>z164@z164:~$ ${currentLine.text().trim()}</span>`)
        toJSON(currentLine.text().trim())
        currentLine.text(' ')
    }
});

const toJSON = (message) => {
    const commandArray = message.split(' ')
    const command = commandArray.shift()
    const props = commandArray.filter((el) => el.startsWith('--'))
    const body = commandArray.filter((el) => !el.startsWith('--'))
    ws.send(JSON.stringify({
        command: command,
        props: props,
        body: body
    }))
}