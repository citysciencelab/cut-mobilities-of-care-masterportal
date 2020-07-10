import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";
import {KML, GeoJSON, GPX} from "ol/format.js";

const configPaths = [
        "configJson.Portalconfig.menu.tools.children.kmlimport"
    ],
    supportedFormats = {
        kml: new KML({extractStyles: true}),
        gpx: new GPX(),
        geojson: new GeoJSON()
    };

/**
 * Checks given file suffix for any defined Format. Default mappings are defined in state and may be
 * overridden in config.
 * @param {String} filename - Name of the given file.
 * @param {String} selectedFiletype - The name of type of file. This represents a key of supportedFiletypes
 * and defines, how the format will be chosen. Either directly if it matches an available format and
 * supported file type. Or automatically, when set to "auto".
 * @param {Object} supportedFiletypes - Object of supported file types. This has to include a regex for each
 * file type, that will be used to determine the filetype when selectedFiletype is "auto". The defaults are
 * defined in state and may be overridden in config.
 * @param {Object} availableFormats - Object of available formats provided by Openlayers. These are hardcoded
 * in this file and this is only a param for the sake of avoiding global variables.
 * @returns {Object|Boolean} Returns the chosen openlayers format object or false on error.
 */
function getFormat (filename, selectedFiletype, supportedFiletypes, availableFormats) {
    if (selectedFiletype !== "auto") {
        if (availableFormats[selectedFiletype] === undefined) {
            console.warn("File import tool: Selected filetype \"" + selectedFiletype + "\" has no OL Format defined for it.");
            return false;
        }
        return availableFormats[selectedFiletype];
    }

    for (const formatKey in supportedFiletypes) {
        if (supportedFiletypes[formatKey].rgx === undefined) {
            continue;
        }

        if (filename.match(supportedFiletypes[formatKey].rgx) !== null) {
            if (availableFormats[formatKey] === undefined) {
                console.warn("File import tool: Filetype \"" + formatKey + "\" is defined as supported, but there isn't any OL Format defined for it.");
                continue;
            }
            return availableFormats[formatKey];
        }
    }
    return false;
}

export default {
    initialize: context => fetchFirstModuleConfig(context, configPaths, "kmlimport"),

    setActive: ({commit}, value) => {
        commit("active", value);
    },

    activateByUrlParam: ({rootState, commit}) => {
        const mappings = ["kmlimport"];

        if (rootState.queryParams instanceof Object && rootState.queryParams.isinitopen !== undefined && mappings.indexOf(rootState.queryParams.isinitopen.toLowerCase()) !== -1) {
            commit("active", true);
        }
    },

    setSelectedFiletype: ({commit}, newFiletype) => {
        commit("selectedFiletype", newFiletype);
    },

    importKML: ({state, dispatch}, datasrc) => {
        const
            vectorLayer = datasrc.layer,
            format = getFormat(datasrc.filename, state.selectedFiletype, state.supportedFiletypes, supportedFormats);

        let
            alertingMessage,
            features;

        if (format === false) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.kmlImport.alertingMessages.missingFormat")
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw);
        }
        catch (ex) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.kmlImport.alertingMessages.formatError")
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.kmlImport.alertingMessages.missingFileContent")
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        features.forEach(feature => {
            let geometries;

            if (feature.getGeometry().getType() === "GeometryCollection") {
                geometries = feature.getGeometry().getGeometries();
            }
            else {
                geometries = [feature.getGeometry()];
            }

            geometries.forEach(geometry => {
                geometry.transform("EPSG:4326", "EPSG:25832");
            });
        });

        vectorLayer.getSource().addFeatures(features);

        alertingMessage = {
            category: i18next.t("common:modules.alerting.categories.info"),
            content: i18next.t("common:modules.tools.kmlImport.alertingMessages.success", {filename: datasrc.filename})
        };

        dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
    }
};
