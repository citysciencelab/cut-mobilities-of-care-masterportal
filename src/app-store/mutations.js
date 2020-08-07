
// The object deprecatedCode stores the current respectively new parameters and the related deprecated parameters.
// The key describes the current parameter or more precisely the path to the new/current path.
// Please note, that the path is not the complete path. It is the path from the point where the new and old paths differ.
// The easiest case is for example "toolTip". Here the new parameter is written to the same place as the old parameter.
// Therefore the key is only "toolTip", the previous path is taken over from the old path.
// In the case "portalTitle.title" for example, the new parameter is written to a new (sub-)path.
// The old parameter is defined under "Portalconfig.PortalTitle". But the new parameter has to be written to "Portalconfig.portalTitle.title".
// This means, that not only the parameter "title" is new, also the subpath "portalTitle" is new and has to be inserted.
// So logically "portalTitle" and "title" are put together to one key called "portalTitle.title".
// There are some cases, where a tool e.g. "supplyCoord" can be defined at multiple places.
// Therefore define an array where all the possible paths are stored.
// Later the algorithm will detect which path is the correct and defined one. This path is used for the new parameter.

const deprecatedCode = {
    "portalTitle.title": ["Portalconfig.PortalTitle"],
    "portalTitle.logo": ["Portalconfig.PortalLogo"],
    "portalTitle.link": ["Portalconfig.LogoLink"],
    "portalTitle.toolTip": ["Portalconfig.LogoToolTip"],
    "toolTip": ["Portalconfig.portalTitle.tooltip"],
    "filter": ["Portalconfig.menu.wfsFeatureFilter", "Themenconfig.Fachdaten.Layer.extendedFilter"], // nicht die config ändern, sonder eine warnung ausgeben, dass diese Module nicht mehr aktuell sind und der filter stattdessen konfiguriert werden muss!
    "zoomToResultOnHover": ["Portalconfig.searchBar.bkg.zoomToResult"],
    "treeType": ["Portalconfig.Baumtyp"],
    "layerId": ["Portalconfig.controls.overviewMap.baselayer"],
    "startResolution": ["Portalconfig.mapView.resolution"],
    "startZoomLevel": ["Portalconfig.searchbar.zoomLevel"]
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
        if (entry[1].length === 1) {
            parameters = getDeprecatedParameters(entry[1][0], config);
            if (parameters.output !== undefined) {
                parameters.currentCode = entry[0];
                updatedConfig = replaceDeprecatedCode(parameters, updatedConfig);
            }
        }
        else {
            for (const path of entry[1]) {
                parameters = getDeprecatedParameters(path, config);

                if (parameters.output !== undefined) {
                    parameters.currentCode = entry[0];
                    updatedConfig = replaceDeprecatedCode(parameters, updatedConfig);
                }
            }
        }
        // eine warning einbauen - modul deprecated. Bitte das und das bentuzen. Wurde automatisiert geändert zu XY.
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
        const splittedPath = entry.split("."),
            output = splittedPath.reduce((object, index) => object[index], config),
            deprecatedKey = splittedPath[splittedPath.length - 1];

        parameters = {
            "splittedPath": splittedPath,
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
        path = parameters.splittedPath,
        output = parameters.output,
        deprecatedKey = parameters.deprecatedKey,
        splittedCurrentPath = parameters.currentCode.split(".");
    let current = updatedConfig;

    path.pop();
    if (splittedCurrentPath.length === 1) {
        path.push(parameters.currentCode);
    }
    else {
        splittedCurrentPath.forEach((pathElement) => {
            path.push(pathElement);
        });
    }
    path.forEach((element, index) => {
        if (index === path.length - 1 && output !== undefined) {
            current[element] = output;
            console.warn(parameters.deprecatedKey + " is deprecated. Please use " + parameters.currentCode + " in the config.json instead. For this session it is automatically replaced.");
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
