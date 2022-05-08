const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require('telegram/events');
const input = require('input');
require('dotenv').config()
const { isTargetCity, detectAlertStatus } = require('./utils');
const config = require('./config')

const {
    API_ID,
    API_HASH,
    TG_PASS,
    TG_PHONE
} = process.env;

const storeSession = new StoreSession("session");
const client = new TelegramClient(
    storeSession,
    +API_ID,
    API_HASH,
    { connectionRetries: 5 }
);

(async () => {
    // Connect
    await client.connect();

    // Auth
    await client.start({
        phoneNumber: async () => TG_PHONE,
        password: async () => TG_PASS,
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });

    console.log('Connected!');

    // Subscribe to channels
    config.sourceChannels.forEach(async channel => {
        await client.invoke(new Api.channels.JoinChannel({
            channel,
        }));
    })

    async function postMessage(file, msg, originalText) {
        config.targetChannels.forEach(async target => {
            await client.sendMessage(target, {
                file
            });
    
            await client.sendMessage(target, {
                message: config.showOriginalMsg
                    ? `${msg}\n\n${originalText}`
                    : msg,
            });
        })
    }

    async function eventPrint(event) {
        const message = event.message;

        if (!isTargetCity(message.text, config.cityRegex)) {
            return
        }

        console.log('It\'s target city');

        const alertStatus = detectAlertStatus(message.text, config.alertRegex, config.clearRegex);

        switch (alertStatus) {
            case 'alert':
                postMessage(config.alertMedia, config.alertMsg, message.text);
                break;
            case 'clear':
                postMessage(config.clearMedia, config.clearMsg, message.text);
                break;
            default:
                break;
        }
    }

    // Add listener
    client.addEventHandler(
        eventPrint, new NewMessage({
            chats: config.sourceChannels
        })
    );
})()