import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
        "configJson.Portalconfig.legend"
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
        setShowLegend: function ({commit}, showLegend) {
            commit("showLegend", showLegend);
        },
        addLegend: function ({state}, legendObj) {
            let legends = state.legends;

            legends.push(legendObj);
            // legends = legends.sort(function (a, b) {
            //     let sortVal = 0;

            //     if (a.position < b.position) {
            //         sortVal = -1;
            //     }
            //     if (a.position > b.position) {
            //         sortVal = 1;
            //     }
            //     return sortVal;
            // });
            state.legends = legends;
        },
        removeLegend: function ({state}, id) {
            state.legends = state.legends.filter((legendObj) => {
                return legendObj.id !== id;
            });
        }
    };

export default actions;
