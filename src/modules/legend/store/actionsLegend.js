import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
        "configJson.Portalconfig.legend",
        "configJson.Portalconfig.menu.legend",
        "configJson.Portalconfig.menu.tools.children.legend"
    ],
    actions = {
        /**
         * Sets the config-params of this tool into state.
         * @param {object} context the context Vue instance
         * @returns {boolean} false, if config does not contain the tool
         */
        getLegendConfig: context => {
            return fetchFirstModuleConfig(context, configPaths, "Legend");
        },

        /**
         * Shows or hides the legend.
         * @param {Object} param0 State
         * @param {Boolean} showLegend Flag if legend should be shown or not
         * @returns {void}
         */
        setShowLegend: function ({state}, showLegend) {
            state.showLegend = showLegend;
        },

        /**
         * Adds the legend of one layer to the legends in the store
         * @param {Object} param0 State
         * @param {Object} legendObj Legend object of one layer
         * @returns {void}
         */
        addLegend: function ({state}, legendObj) {
            const legends = state.legends;

            legends.push(legendObj);
            state.legends = legends;
        },

        /**
         * Sorts the Legend Entries by position descending
         * @param {Object} param0 State
         * @returns {void}
         */
        sortLegend: function ({state}) {
            state.legends.sort(function (a, b) {
                return b.position - a.position;
            });
        },

        /**
         * Removes a layer legend from the legends in the store by given id.
         * @param {Object} param0 State
         * @param {String} id Id of layer.
         * @returns {void}
         */
        removeLegend: function ({state}, id) {
            state.legends = state.legends.filter((legendObj) => {
                return legendObj.id !== id;
            });
        },

        setLayerIdForLayerInfo: function ({state}, id) {
            state.layerIdForLayerInfo = id;
        },
        setLegendForLayerInfo: function ({state}, legendObj) {
            state.layerInfoLegend = legendObj;
        }
    };

export default actions;
