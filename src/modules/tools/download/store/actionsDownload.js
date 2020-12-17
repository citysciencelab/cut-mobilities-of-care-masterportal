import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import {GeoJSON, GPX} from "ol/format.js";

import {transformLine, transformPoint, transformPolygon} from "../utils/transformGeometry";
import convertFeaturesToKml from "./actions/convertFeaturesToKml";

const actions = {
    back ({commit, dispatch}) {
        commit("setActive", false);
        dispatch("reset");

        dispatch("Tools/Draw/setIsActive", true, {root: true});
    },
    convertFeatures ({state, dispatch}, format) {
        const convertedFeatures = [];

        state.features.forEach(feature => {
            const cloned = feature.clone(), // TODO: Is this really needed?
                transCoords = dispatch("transformCoordinates", cloned.getGeometry());

            // TODO: Why is this needed?
            if (transCoords.length === 3 && transCoords[2] === 0) {
                transCoords.pop();
            }

            cloned.getGeometry().setCoordinates(transCoords, "XY");
            convertedFeatures.push(cloned);
        });

        return format.writeFeatures(convertedFeatures);
    },
    convertFeaturesToKml,
    download ({state, commit, dispatch}) {
        const validatedFile = dispatch("validateFileName");

        if (state.isInternetExplorer) {
            window.navigator.msSaveOrOpenBlob(state.blob, validatedFile);
        }
        else {
            commit("setFileContent", validatedFile);
        }
    },
    prepareData ({state, commit, dispatch}) {
        let features = "";

        switch (state.selectedFormat) {
            case "GEOJSON":
                features = dispatch("convertFeatures", new GeoJSON());
                break;
            case "GPX":
                features = dispatch("convertFeatures", new GPX());
                break;
            case "KML":
                // TODO(roehlipa): Implement convertFeaturesToKml
                features = dispatch("convertFeaturesToKml");
                break;
            case "none":
                // TODO: Is this commit even needed?
                commit("setSelectedFormat", "");
                break;
            default:
                break;
        }
        commit("setDataString", features);
    },
    prepareDownload ({state, commit, dispatch}) {
        const {dataString} = state,
            fileName = dispatch("validateFileName"),
            isIE = Radio.request("Util", "isInternetExplorer");

        commit("setIsInternetExplorer", isIE);
        if (fileName) {
            if (isIE) {
                commit("setBlob", new Blob([dataString]));
            }
            else {
                const url = `data:text/plain;charset=utf-8,%EF%BB%BF${encodeURIComponent(dataString)}`;

                commit("setFileUrl", url);
            }
            commit("setDisableDownload", false); // TODO: If this doesn't work directly, it needs to be a computed property in the Component
        }
        else {
            commit("setDisableDownload", true);
        }
    },
    reset ({commit}) {
        // TODO(roehlipa): Rather use a deep copy of the initial state to reset the values?
        commit("setDataString", "");
        commit("setFeatures", []);
        commit("setFileName", "");
        commit("setFormats", []);
        commit("setSelectedFormat", "");
    },
    setActive ({state, commit, dispatch}, active) {
        commit("setActive", active);

        if (active) {
            const {features} = state;
            if (features.length === 0) {
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.createFirst"), {root: true});
                return;
            }
            features.forEach(feature => {
                const geometry = feature.getGeometry();

                // TODO(roehlipa): Why is this needed?
                if (geometry instanceof Circle) {
                    feature.setGeometry(fromCircle(geometry));
                }
            });
            commit("setFeatures", features);

            // TODO(roehlipa): Is there an equivalent in vue?
            Radio.trigger("ModelList", "setActiveToolsToFalse", Radio.request("ModelList", "getModelByAttributes", {id: "download"}));
        }
    },
    setFileName ({commit, dispatch}, evt) {
        const val = evt.currentTarget.value;

        commit("setFileName", val);
        dispatch("prepareDownload");
    },
    setSelectedFormat ({commit, dispatch}, evt) {
        const outputFormat = evt.currentTarget.value;

        commit("setSelectedFormat", outputFormat);
        dispatch("prepareData");
        dispatch("prepareDownload");
    },
    transformCoordinates ({dispatch}, geometry) {
        const coords = geometry.getCoordinates();

        switch (geometry.getType()) {
            case "LineString":
                return transformLine(coords);
            case "Point":
                return transformPoint(coords);
            case "Polygon":
                return transformPolygon(coords);
            default:
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.unknownGeometry", {geometry: geometry.getType()}), {root: true});
                return [];
        }
    },
    validateFileName ({state}) {
        const {fileName, selectedFormat} = state;
        let validatedFileName = "";

        if (fileName.length > 0 && selectedFormat.length > 0) {
            const suffix = `.${selectedFormat.toLowerCase()}`;

            if (!fileName.toLowerCase().endsWith(suffix)) {
                validatedFileName = fileName + suffix;
            }
            else {
                validatedFileName = fileName;
            }
        }
        return validatedFileName;
    }
};

export default actions;
