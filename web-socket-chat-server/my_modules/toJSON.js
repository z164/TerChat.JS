const toJSON = (body, props) => {
    return JSON.stringify({
        body: body,
        props: props
    })
}

module.exports = toJSON