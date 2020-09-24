/**
 * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
 * @param  {String} value - feature attribute values
 * @returns {string} punctuated value
 */
function punctuate (value) {
    const pattern = /(-?\d+)(\d{3})/,
        stringValue = value.toString();

    let decimals,
        predecimals = stringValue;

    if (stringValue.indexOf(".") !== -1) {
        predecimals = stringValue.split(".")[0];
        decimals = stringValue.split(".")[1];
    }
    while (pattern.test(predecimals)) {
        predecimals = predecimals.replace(pattern, "$1.$2");
    }
    if (decimals) {
        return predecimals + "," + decimals;
    }
    return predecimals;
}
export default punctuate;
