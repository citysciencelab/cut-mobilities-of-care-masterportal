/**
 * Retrieves a value from an object by dot or array syntax, like this:
 *  - const ex = {drinks: {milk: {fresh: "tasty"}}};
 *  - getByDotSyntax(ex, "drinks.milk.fresh") === "tasty"
 *  - getByDotSyntax(ex, ["drinks", "milk", "fresh"]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", "milk.fresh"]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", ["milk", "fresh"]]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", ["milk.fresh"]]) === "tasty"
 *
 * @Todo Needs to be a helper, should not be here
 * @param {object} obj - The object to search in
 * @param {array|string} path - Array or String with the key.
 * @param {string} separator - Charactor to separate multiple keys
 * @returns {mixed} Retrieved value or undefined, if nothing found
 */
function getByDotSyntax (obj, path, separator = ".") {
    const pathArray = createKeyPathArray(path);

    if (pathArray === false) {
        console.warn("Invalid path parameter given for \"getByDotSyntax()\":", path);
        return undefined;
    }

    return getByArraySyntax(obj, pathArray, separator);
}
export {getByDotSyntax};

/**
 * Retrieves a value from an object by array syntax, like this:
 *  - const ex = {drinks: {milk: {fresh: "tasty"}}};
 *  - getByArraySyntax(ex, ["drinks", "milk", "fresh"]) === "tasty"
 *
 * @param {object} obj - The object to search in
 * @param {array} pathArray - Array with path keys
 * @returns {mixed} Retrieved value or undefined, if nothing found
 */
function getByArraySyntax (obj, pathArray) {
    const step = pathArray.shift();

    if (obj instanceof Object === false || obj[step] === undefined) {
        return undefined;
    }

    if (pathArray.length === 0) {
        return obj[step];
    }

    return getByArraySyntax(obj[step], pathArray);
}

/**
 * Creates flat array of strings out of a variety of possible path arrays or strings.
 *  - createKeyPathArray("drinks.milk.fresh")
 *  - createKeyPathArray(["drinks", "milk", "fresh"])
 *  - createKeyPathArray(["drinks", "milk.fresh"])
 *  - createKeyPathArray(["drinks", ["milk", "fresh"]])
 *  - createKeyPathArray(["drinks", ["milk.fresh"]])
 * all return ["drinks", "milk, "fresh"]
 *
 * If Arrays dont contain Strings or Arrays, it returns false.
 * If Strings start or end with the separator, it returns false.
 *
 * @param {array|string} path - Array or String with the key path.
 * @param {string} separator - Charactor to separate multiple keys
 * @returns {array|boolean} Array of path strings or false
 */
function createKeyPathArray (path, separator = ".") {
    let result = [];

    if (typeof path === "string") {
        result = path.split(separator);

        for (const pathPart1 of result) {
            if (pathPart1 === "") {
                return false;
            }
        }

        return result;
    }
    else if (!Array.isArray(path)) {
        return false;
    }

    for (const pathPart2 of path) {
        const resultRec = createKeyPathArray(pathPart2, separator);

        if (resultRec === false) {
            return false;
        }

        result = [...result, ...resultRec];
    }

    return result;
}

/**
 * Deep merges module config objects into the module's state.
 * Module configs must be objects.
 * Module must have default values for those properties.
 *
 * @param {object} rootState - The Root state object
 * @param {array} configPaths - Array of paths to search for in root state
 * @param {string} moduleName - Name of the module
 * @returns {boolean} True, if successfully merged
 */
function fetchFirstModuleConfig (rootState, configPaths, moduleName) {
    const missingSources = [],
        missingDefaultValues = [];

    let success = false;

    for (const path of configPaths) {
        const source = getByDotSyntax(rootState, path);

        if (source === undefined) {
            missingSources.push(createKeyPathArray(path));
            continue;
        }

        // Config Source must be an object in order to set those into the module state
        if (source instanceof Object === false || Array.isArray(source)) {
            console.error("Config für \"" + moduleName + "\" wurde ignoriert, da sie kein Object ist.", source);
            console.warn("Pfad der fehlerhaften Config:", createKeyPathArray(path));
            continue;
        }

        // Check for missing default values in module state
        for (const sourceProp in source) {
            if (rootState[moduleName][sourceProp] === undefined) {
                missingDefaultValues.push(sourceProp);
            }
        }
        if (missingDefaultValues.length > 0) {
            console.error("Config für \"" + moduleName + "\" wurde ignoriert, da Standardwerte fehlen.", missingDefaultValues);
            console.warn("Pfad der fehlerhaften Config:", createKeyPathArray(path));
            continue;
        }

        rootState[moduleName] = deepMerge(source, rootState[moduleName]);
        success = true;

        // only use the first found config
        break;
    }

    if (missingSources.length > 0) {
        console.warn("Config für \"" + moduleName + "\" wurde an folgenden Orten nicht gefunden.", missingSources);
    }

    if (!success) {
        // here a fallback option may be added
        // success = fallbackFetchRecursive(rootState, moduleName);
    }

    if (!success) {
        console.warn("Config für \"" + moduleName + "\" wurde nicht geladen.");
    }

    return success;
}
export {fetchFirstModuleConfig};

/**
 * Deep merges one object into another. If given source param is no object or an Array, nothing happens.
 * @param {object} source - Source object to merge into target object
 * @param {object} target - Target object that will be modified
 * @returns {object} - The resulting merged object
 */
function deepMerge (source, target) {
    if (source instanceof Object === false || Array.isArray(source)) {
        return target;
    }

    if (target instanceof Object === false) {
        return {...source};
    }

    for (const key in source) {
        if (source[key] instanceof Object === false) {
            target[key] = source[key];
        }
        else {
            target[key] = deepMerge(source[key], target[key]);
        }
    }

    return target;
}
export {deepMerge};

