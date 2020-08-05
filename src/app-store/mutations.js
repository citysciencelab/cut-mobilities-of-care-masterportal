
// beachten, dass es mehrer Pfade für die Tools geben kann. Alle müssen angegeben werden.
const deprecatedCode = {
    "toolTip": ["Portalconfig.portalTitle.tooltip"],
    "supplyCoord": ["Portalconfig.menu.coord", "Portalconfig.menu.tools.children.coord"]
};

/**
 * Function to check if the deprecated parameters could be specified for more than one location e.g. they (location of the parameter or tool) have multiple possible paths.
 * Furthermore the function checks whether the given paths for the parameters are defined or undefined.
 * @param {String} deprecatedPath - dotted string. The path in the config of the old and deprecated parameter.
 * @param {config} config - the config.json.
 * @returns {Object} - returns a new config.json without the deprecated parameters. They were replaced by the actual ones.
*/
function checkWhereDeprecated (deprecatedPath, config) {
    let updatedConfig = {...config};

    Object.entries(deprecatedPath).forEach((entry) => {
        const currentCode = entry[0];

        if (entry[1].length === 1) {
            const deprecatedParameters = getDeprecatedParameters(entry[1][0], config);

            updatedConfig = findDeprecatedCode(currentCode, deprecatedParameters, config);
        }
        else {
            for (const path of entry[1]) {
                const deprecatedParameters = getDeprecatedParameters(path, config);

                if (deprecatedParameters.output !== undefined) {
                    updatedConfig = findDeprecatedCode(currentCode, deprecatedParameters, config);
                }
            }
        }
    });
    return updatedConfig;
}

/**
 * Function to determine:
 * Firstly: the path as dotted string.
 * Secondly: the output given by the config.json for the path with the deprecated parameter.
 * Thirdly: the deprecated key/parameter itself.
 * @param {Array} entry - Array with the single "steps" / elements of the deprecated path.
 * @param {Object} config - The config.json.
 * @returns {Object} - returns an object with the three mentioned above parameters.
*/
function getDeprecatedParameters (entry, config) {
    const splittedPath = entry.split("."),
        output = splittedPath.reduce((object, index) => object[index], config),
        deprecatedKey = splittedPath[splittedPath.length - 1];

    return {
        "splittedPath": splittedPath,
        "output": output,
        "deprecatedKey": deprecatedKey
    };
}

/**
 * Function to find and replace the old deprecated path.
 * Inserts the new and current key into the config instead of the deprecated parameter.
 * The deprecated parameter is deleted. The content is allocated to the new key.
 * @param {String} currentParameter - the new current parameter to repalce the deprecated parameter.
 * @param {Object} deprecatedParameters - this object contains the path with the deprecated parameter, the output/content of the deprecated parameter and the deprecated parameter itself.
 * @param {Object} config - the config.json.
 * @returns {Object} - returns a updated config where the deprecated parameters are replaced by the new and current ones.
*/
function findDeprecatedCode (currentParameter, deprecatedParameters, config) {
    const updatedConfig = {...config},
        path = deprecatedParameters.splittedPath,
        output = deprecatedParameters.output,
        deprecatedKey = deprecatedParameters.deprecatedKey;
    let current = updatedConfig;

    path.pop();
    path.push(currentParameter);
    path.forEach((element, index) => {
        if (index === path.length - 1 && output !== undefined) {
            current[currentParameter] = output;
            delete current[deprecatedKey];
        }
        else {
            if (!current[element]) {
                current[element] = {};
            }
            current = current[element];
        }
    });
    // });

    return updatedConfig;
}

export default {
    /**
     * Sets config.json.
     * @param {object} state store state
     * @param {object} config config.json
     * @returns {void}
     */
    setConfigJson (state, config) {
        state.configJson = checkWhereDeprecated(deprecatedCode, config);
    },
    /**
     * Sets config.js.
     * @param {object} state store state
     * @param {object} config config.js
     * @returns {void}
     */
    setConfigJs (state, config) {
        state.configJs = config;
    },
    /**
     * Sets mobile flag.
     * @param {object} state store state
     * @param {boolean} mobile whether browser resolution indicates mobile device
     * @returns {void}
     */
    setMobile (state, mobile) {
        state.mobile = mobile;
    },
    /**
     * Sets i18NextInitialized flag. Is done afetr languages for addons are loaded.
     * @param {object} state store state
     * @param {boolean} isInitialized whether i18Next is initialized
     * @returns {void}
     */
    setI18Nextinitialized (state, isInitialized) {
        state.i18NextInitialized = isInitialized;
    }
};
