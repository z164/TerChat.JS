const currentLine = $('.terminal-content-current')
const history = $('.terminal-content-history')
const content = $('.terminal-content')
const chat = $('.terminal-content__chat')
const commands = $('.terminal-content__commands')
// Keep current line in terminal always in focus
$('document').ready(() => {
    currentLine.focus()
})
currentLine.on('blur', () => {
    currentLine.focus()
})

// Connection to server and event listeners
let ws, currentUser
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
    let [body, author, side, whisper] = parseMessage(message)
    const whisperSound = new Audio('./sound/whisper.ogg')
    if (whisper) {
        author = `${author} whispered you`
        whisperSound.play()
    }
    if (side) {
        chat.append(`<span ${body.includes(currentUser) && author !== currentUser ? 'style="background-color: #FFFFFF; color: #000000; border-radius: 3px"' : ''}><b>${author === '' ? 'Server' : author}</b>: ${body}</span>`)
        chat.scrollTop(999)
    } else {
        history.append(`<span><b>${author === '' ? 'Server' : author}</b>: ${body}</span>`)
    }
    commands.scrollTop(999)
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
    const messageData = JSON.parse(message)
    let {
        body,
        props
    } = messageData
    let author = '',
        whisper = false,
        rightSide = false
    if (props) {
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
                    currentUser = el.body[0]
                    if (el.body[0] === 'logout') {
                        $('.terminal-header').text('Not logged in.')
                    } else {
                        $('.terminal-header').text(`Currently logged in as [${el.body[0]}]`)
                    }
                    break
                case 'author':
                    author = el.body[0]
                    break
                case 'right':
                    rightSide = true
                    break
                case 'whisper':
                    whisper = true
                    break
                default:
                    ''
            }
        })
    }
    return [body, author, rightSide, whisper]
}