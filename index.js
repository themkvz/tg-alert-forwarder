const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require('telegram/events');
const { isTargetCity, detectAlertStatus } = require('./utils');
const input = require("input");
// const QRCode = require('qrcode')
require('dotenv').config()

const {
    API_ID,
    API_HASH,
    TG_PASS,
    TG_PHONE,
    POSTED_CHANNEL,
    WATCHED_CHANNEL,
    CITY_REGEX,
    ALERT_REGEX,
    CLEAR_REGEX,
    ALERT_MSG,
    CLEAR_MSG
} = process.env;

const watchedChannels = WATCHED_CHANNEL.split(" ");

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
    watchedChannels.forEach(async channel => {
        await client.invoke(new Api.channels.JoinChannel({
            channel,
        }));
    })

    async function postMessage(filePath, msg, originalText) {
        await client.sendMessage(POSTED_CHANNEL, {
            file: filePath
        });

        await client.sendMessage(POSTED_CHANNEL, {
            message: `${msg}\n\n${originalText}`,
        });
    }

    async function eventPrint(event) {
        const message = event.message;

        if (!isTargetCity(message.text, CITY_REGEX)) {
            return
        }

        console.log('It\'s target city');

        const alertStatus = detectAlertStatus(message.text, ALERT_REGEX, CLEAR_REGEX);

        switch (alertStatus) {
            case 'alert':
                postMessage('./media/alert.jpg', ALERT_MSG, message.text);
                break;
            case 'clear':
                postMessage('./media/clear.jpg', CLEAR_MSG, message.text);
                break;
            default:
                break;
        }
    }

    // Add listener
    client.addEventHandler(
        eventPrint, new NewMessage({
            chats: watchedChannels
        })
    );
})()