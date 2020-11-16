/**
 * parses a string: replaces letters and uppercases the very first letter (by default)
 * @info common wfs data in the MP has keys that will be comfortable to read with the default options of this function
 * @param {String} value the string (the key of wfs or other data) to parse and "beautify"
 * @param {Object} [optionsOpt={}] options to give if you wish to alter the behavior
 * @param {Boolean} [optionsOpt.uppercase=true] if you wish not to use uppercase of the very first letter, set this to false
 * @param {Object} [optionsOpt.replacements={"_": " "}] an object with key/value pairs for alternative replacements (e.g. {"_": " ", "+": " "})
 * @returns {String}  a new string with the given replacements, the very first letter may be uppercase based on options
 */
export default function beautifyKey (value, optionsOpt = null) {
    if (typeof value !== "string") {
        return "";
    }

    const options = Object.assign({
        uppercase: true,
        replacements: {"_": " "}
    }, optionsOpt);
    let result = value;

    if (typeof options.replacements === "object" && options.replacements !== null) {
        Object.keys(options.replacements).forEach(key => {
            if (typeof options.replacements[key] !== "string") {
                return;
            }

            result = result.split(key).join(options.replacements[key]);
        });
    }

    if (options.uppercase) {
        result = result.charAt(0).toUpperCase() + result.substring(1);
    }

    return result;
}
