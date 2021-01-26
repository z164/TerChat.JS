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
let ws, currentUser, lastCommand
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
    let [body, author, side, whisper, time] = parseMessage(message)
    const whisperSound = new Audio('./sound/whisper.ogg')
    if (whisper) {
        author = `${author} whispered you`
        whisperSound.play()
    }
    if (side) {
        const isUserMentioned = body.includes(currentUser) && author !== currentUser
        const highlightMessage = 'style="background-color: #FFFFFF; color: #000000; border-radius: 3px"'
        const isMessageFromServer = author === ''
        const spanOfTime = `<span style="float:right">${time}</span>`
        chat.append(`<span ${isUserMentioned ? highlightMessage : ''}><b>${spanOfTime}${isMessageFromServer ? 'Server' : `${author}`}</b>:<br>${body}</span>`)
        chat.scrollTop(99999)
    } else {
        history.append(`<span><b>${author === '' ? 'Server' : author}</b>: ${body}</span>`)
    }
    commands.scrollTop(99999)
}

// Enter press event listener
currentLine.on('keydown', function (e) {
    if (e.which == 13) {
        e.preventDefault();
        lastCommand = currentLine.text().trim() // last command variable created to implement ArrowUp event later. Now its unnessesary
        history.append(`<span>z164@z164:~$ ${lastCommand}</span>`)
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
        rightSide = false,
        time = ''
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
                    [currentUser] = el.body
                    if (currentUser === 'logout') {
                        $('.terminal-header').text('Not logged in.')
                    } else {
                        $('.terminal-header').text(`Currently logged in as [${currentUser}]`)
                    }
                    break
                case 'author':
                    [author] = el.body
                    break
                case 'right':
                    rightSide = true
                    break
                case 'whisper':
                    whisper = true
                    break
                case 'time':
                    if (el.body.length === 2) {
                        const [hours, minutes] = el.body
                        time = `${hours.slice(0, 2)}:${minutes}`
                    } else {
                        const [month, day, hours, minutes] = el.body
                        time = `${month} ${day.slice(0,2)} | ${hours.slice(0,2)}:${minutes}`
                    }
                    break
                default:
                    ''
            }
        })
    }
    if (body) {
        body = body.replaceAll('LUL', '<img src="https://static-cdn.jtvnw.net/emoticons/v1/425618/1.0">')
        body = body.replaceAll('BloodTrail', '<img src="https://static-cdn.jtvnw.net/emoticons/v1/69/1.0"')
    }
    return [body, author, rightSide, whisper, time]
}