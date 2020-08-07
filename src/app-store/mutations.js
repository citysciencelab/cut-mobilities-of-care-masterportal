
// The object deprecatedCode stores the current respectively new parameters and the related deprecated parameters.
// The key describes the current parameter or more precisely the path to the new/current path.
// The corresponding value describes the old path with the deprecated parameter.
// Later on the algorithm takes the old path, estimates the content and rewrites the content to the new path / new parameter.
// The old deprecated path will be removed.
// Please notice that the replacement only effects the state. This means that the changes only have impact on the vue-components.
// Nevertheless you can or even should specify deprecated backbone parameters here.

const deprecatedParams = {
    "Portalconfig.portalTitle.title": ["Portalconfig.PortalTitle"],
    "Portalconfig.portalTitle.logo": ["Portalconfig.PortalLogo"],
    "Portalconfig.portalTitle.link": ["Portalconfig.LogoLink"],
    "Portalconfig.portalTitle.toolTip": ["Portalconfig.LogoToolTip", "Portalconfig.portalTitle.tooltip"],
    // "filter": ["Portalconfig.menu.wfsFeatureFilter", "Themenconfig.Fachdaten.Layer.extendedFilter"], // nicht die config ändern, sonder eine warnung ausgeben, dass diese Module nicht mehr aktuell sind und der filter stattdessen konfiguriert werden muss!
    "Portalconfig.searchBar.bkg.zoomToResultOnHover": ["Portalconfig.searchBar.bkg.zoomToResult"],
    "Portalconfig.treeType": ["Portalconfig.Baumtyp"],
    "Portalconfig.controls.overviewMap.layerId": ["Portalconfig.controls.overviewMap.baselayer"],
    "Portalconfig.mapView.startResolution": ["Portalconfig.mapView.resolution"],
    "Portalconfig.searchbar.startZoomLevel": ["Portalconfig.searchbar.zoomLevel"]
};

/**
 * Function to check if the deprecated parameters could be specified for more than one location e.g. they (location of the parameter or tool) have multiple possible paths.
 * Furthermore the function checks whether the given paths for the parameters are defined or undefined.
 * @param {String} deprecatedPath - dotted string. The path in the config of the old and deprecated parameter.
 * @param {config} config - the config.json.
 * @returns {Object} - returns a new config.json without the deprecated parameters. They were replaced by the actual ones.
*/
function checkWhereDeprecated (deprecatedPath, config) {
    let parameters = {},
        updatedConfig = {...config};

    Object.entries(deprecatedPath).forEach((entry) => {
        parameters = getDeprecatedParameters(entry, config);
        if (parameters.output !== undefined) {
            updatedConfig = replaceDeprecatedCode(parameters, updatedConfig);
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
    let parameters = {};

    try {
        const newSplittedPath = entry[0].split(".");
        let oldSplittedPath = "",
            output = "",
            deprecatedKey = "";

        for (const oldPathes of entry[1]) {
            oldSplittedPath = oldPathes.split(".");
        }

        output = oldSplittedPath.reduce((object, index) => object[index], config);
        deprecatedKey = oldSplittedPath[oldSplittedPath.length - 1];

        parameters = {
            "newSplittedPath": newSplittedPath,
            "oldSplittedPath": oldSplittedPath,
            "output": output,
            "deprecatedKey": deprecatedKey
        };
        return parameters;
    }
    catch {
        return parameters;
    }
}

/**
 * Function to find and replace the old deprecated path.
 * Inserts the new and current key into the config instead of the deprecated parameter.
 * The deprecated parameter is deleted. The content is allocated to the new key.
 * @param {Array} parameters - contains the new current parameter to repalce the deprecated parameter. Contains also an object wich lists the path of the deprecated parameter, the output/content of the deprecated parameter and the deprecated parameter itself.
 * @param {Object} config - the config.json.
 * @returns {Object} - returns a updated config where the deprecated parameters are replaced by the new and current ones.
*/
function replaceDeprecatedCode (parameters, config) {
    const updatedConfig = {...config},
        output = parameters.output,
        deprecatedKey = parameters.deprecatedKey,
        splittedCurrentPath = parameters.newSplittedPath;
    let current = updatedConfig;

    splittedCurrentPath.forEach((element, index) => {
        if (index === splittedCurrentPath.length - 1 && output !== undefined) {
            current[element] = output;
            console.warn(parameters.deprecatedKey + " is deprecated. Instead, please use the following path/parameter: " + String(parameters.newSplittedPath).replace(/,/g, ".") + " in the config.json. For this session it is automatically replaced.");
        }
        else {
            if (!current[element]) {
                current[element] = {};
            }
            current = current[element];
        }
        delete current[deprecatedKey];
    });

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
        state.configJson = checkWhereDeprecated(deprecatedParams, config);
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
