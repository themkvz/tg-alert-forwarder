function isTargetCity(str, regex) {
    const resultRegex = new RegExp(regex, 'ig');

    return resultRegex.test(str);
}

function detectAlertStatus(str, alertRegex, clearRegex) {
    const alertPattern = new RegExp(`${alertRegex}`, 'ig');
    const clearPattern = new RegExp(`${clearRegex}`, 'ig');

    const matchAlert = alertPattern.test(str)
    const matchClear = clearPattern.test(str)

    if (matchAlert && !matchClear) {
        return 'alert';
    } else if (!matchAlert && matchClear) {
        return 'clear';
    }

    return false;
}

module.exports ={
    isTargetCity,
    detectAlertStatus
}