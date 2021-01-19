const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config()

const codeGenerator = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


const email = (name, email) => {

    const code = codeGenerator(5)
    const result = `<h1>Hello, ${name}</h1>
    <p>Your confirmation code from <strong>TerChat.js</strong> is ${code}</p>`

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const mailOptions = {
        from: '"TerChat.js service" <zigrainchan@gmail.com>',
        to: email,
        subject: 'TerChat.js E-mail confirmation',
        text: code,
        html: result
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            return console.error(err)
        }
        console.log(info)
    })

    return code
}

module.exports = email