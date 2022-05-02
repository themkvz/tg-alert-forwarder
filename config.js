module.exports = {
    showOriginalMsg: false, // bool forward original message from source channel
    alertMsg: 'тривога!', // string message
    clearMsg: 'Відбій!', // string message
    alertRegex: '🔴', // regex clear marker
    clearRegex: '🟢', // regex clear marker
    cityRegex: '', // regex target city marker
    sourceChannels: ['air_alert_ua'], // array of string channel names
    targetChannel: '', // string channel name
    alertMedia: './media/alert.jpg', // string relative path
    clearMedia: './media/clear.jpg', // string relative path
}