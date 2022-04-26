module.exports = {
    showOriginalMsg: false, // bool forward original message from source channel
    alertMsg: 'Повітряна тривога!', // string message
    clearMsg: 'Відбій повітряної тривоги!', // string message
    alertRegex: '🔴', // regex clear marker
    clearRegex: '🟢', // regex clear marker
    cityRegex: 'Шепетів[сцк]|Хмельницьк', // regex target city marker
    sourceChannels: ['air_alert_ua'], // array of string channel names
    targetChannel: '', // string channel name
    alertMedia: './media/alert.jpg', // string relative path
    clearMedia: './media/clear.jpg', // string relative path
}