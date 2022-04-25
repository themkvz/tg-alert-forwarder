const {isTargetCity, detectAlertStatus} = require('./utils');

const cityRegex = `Шепетів[ск]|Хмельницьк`
const alertRegex = '🔴'
const clearRegex = '🟢'

const testFalsyStrings = [
    '🔴 18:49 Повітряна тривога в Черкаська область',
    '🔴 18:29 Повітряна тривога в м. Южноукраїнськ та Южноукраїнська територіальна громада',
    'Повітряна тривога в м. Южноукраїнськ 🔴',
]
const testTruthyStrings = [
    '🟢 19:58 Відбій тривоги в Шепетівський район.',
    '🟢 19:58 Відбій тривоги в Хмельницькій області.',
    'Шепетівка тривога 🟢',
]

test.each(testFalsyStrings) (
    'Target city NOT contains in string',
    str => {
        expect(isTargetCity(str, cityRegex)).toBeFalsy();
    }
);

test.each(testTruthyStrings) (
    'Target city contains in string',
    str => {
        expect(isTargetCity(str, cityRegex)).toBeTruthy();
    }
);

test.each(testFalsyStrings) (
    'Is alert status',
    str => {
        expect(detectAlertStatus(str, alertRegex, clearRegex))
            .toBe('alert');
    }
);

test.each(testTruthyStrings) (
    'Is clear status',
    str => {
        expect(detectAlertStatus(str, alertRegex, clearRegex))
            .toBe('clear');
    }
);

test('Not found status', () => {
    expect(detectAlertStatus(' ', alertRegex, clearRegex)).toBeFalsy();
})