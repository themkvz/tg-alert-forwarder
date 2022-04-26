const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require('telegram/events');
const { isTargetCity, detectAlertStatus } = require('./utils');
const input = require("input");
// const QRCode = require('qrcode')
require('dotenv').config()
const config = require('./config')

const {
    API_ID,
    API_HASH,
    TG_PASS,
    TG_PHONE
} = process.env;

const storeSession = new StoreSession("session");
const client = new TelegramClient(
    storeSession, +API_ID, API_HASH, {}
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

    // Need fixed
    // if (!await client.isUserAuthorized()) {
    //     const user = await client.signInUserWithQrCode({ apiId: +API_ID, apiHash: API_HASH },
    //         {
    //             onError: async p1 => {
    //                 console.log("error", p1);
    //                 // true = stop the authentication processes
    //                 return true;
    //             },
    //             qrCode: async (code) => {
    //                 const qrString = `tg://login?token=${code.token.toString("base64url")}`
    //                 console.log(qrString);

    //                 QRCode.toString(qrString,{type:'terminal'}, (_, qr) => {
    //                     console.log(qr)
    //                 });
    //             },
    //             password: async () => TG_PASS
    //         }
    //     );
    // }

    console.log('Connected!');

    // Subscribe to channels
    config.sourceChannels.forEach(async channel => {
        await client.invoke(new Api.channels.JoinChannel({
            channel,
        }));
    })

    async function postMessage(file, msg, originalText) {
        await client.sendMessage(config.targetChannel, {
            file
        });

        await client.sendMessage(config.targetChannel, {
            message: config.showOriginalMsg 
                ? `${msg}\n\n${originalText}`
                : msg,
        });
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