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
let ws
const connect = (url) => {
    ws = new WebSocket(url)
}
connect('ws://localhost:3000')
ws.onerror = (err) => {
    history.append(`<span>Error connecting to ${err.target.url}`)
}
ws.onopen = () => {}
ws.onmessage = (e) => {
    const message = e.data
    const [body, author] = parseMessage(message)
    history.append(`<span>${author === '' ? 'Server' : author}: ${body}</span>`)
    content.scrollTop(999)
}

// Enter press event listener
currentLine.on('keypress', function (e) {
    if (e.which == 13) {
        e.preventDefault();
        history.append(`<span>z164@z164:~$ ${currentLine.text().trim()}</span>`)
        toJSON(currentLine.text().trim())
        currentLine.text(' ')
    }
});

// Convert command in terminal to JSON and send it to server
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

const parseMessage = (message) => {
    const messageData = message.split('|')
    let [data, props] = messageData
    let author = ''
    data = data.trim()
    if (props) {
        props = props.trim()
        props = props.split('--')
        const propsMap = props.map(el => {
            const arr = el.split(' ')
            const [name, ...body] = arr
            return {
                name: name,
                body: body
            }
        })
        propsMap.forEach((el) => {
            switch (el.name) {
                case 'name':
                    if (el.body[0] === 'logout') {
                        $('.terminal-header').text('Not logged in')
                    } else {
                        $('.terminal-header').text(`Currently logged in as [${el.body[0]}]`)
                    }
                    break
                case 'author':
                    author = el.body[0]
                    break
                default:
                    ''
            }
        })
    }
    return [data, author]
}