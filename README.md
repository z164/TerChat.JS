# TerChat.js

### Hello there!

This is documentation for **TerChat.js** application

#### What is TerChat.js?

**TerChat.js** is Linux Terminal like chat, based on **Web Socket** technology

#### What do i need to run server on my machine?

You will need to create and fill your  `.env`  file

`URI = link to your mongoDB connection`

`SMTP_USER = your SMTP server username`

`SMTP_PASS = your SMTP server password`

`TWITCH_USER = your twitch account username `

`TWITCH_OAUTH = your twitch access token`

After cloning this repository to your local machine use

`cd web-socket-chat-server`

`npm install`

`npm start`

This will run server on ***localhost:3000*** address

#### Ok, thank you, can i have a list of commands for this chat?

**Here it goes**

`register EMAIL NAME PASSWORD` - the first command you need to register your account. Please use correct email cause it will be verified

`login NAME PASSWORD` - login into existing account

`activate --request` - email with code that you will need to activate your account would be sent to you

`activate --confirm CODE` - if code is correct your account will be verified and you will gain access to all the TerChat.js features

`all MESSAGE` - send message to public chat (appears at the right side of terminal)

`w --NAME MESSAGE` - send whisper (private message) to user, whose name you mentioned (supports multiple users messaging `--NAME --NAME2`)

`info --show` - shows information of your account

`info --edit FIELD VALUE` - edits information field of your account with value your mentioned

`online` - shows list of all online users

`online --NAME ` - checks if user is online 

`ban --NAME SECONDS` - admin only command, that prevents user from using `all` command if seconds aren't mentioned 600 is a default value, that will append to ban

`twitch --add CHANNEL` - translates twitch chat of specific channel to your terminal

`twitch --remove CHANNEL` - removes twitch chat of specific channel from your terminal

`logout` - logout from current account

#### Am i ready to go now?

**Seems like yeah**, documentation will be updated if something will change. (Actually at the moment it doesn't even include all the features. Feel free to find them out :) )

