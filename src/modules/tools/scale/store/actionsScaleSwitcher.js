import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
        "configJson.Portalconfig.menu.tools.children.scaleSwitcher"
    ],
    actions = {
        /**
         * Sets the config-params of this tool into state.
         * @param {object} context the context Vue instance
         * @returns {boolean} false, if config does not contain the tool
         */
        initialize: context => {
            return fetchFirstModuleConfig(context, configPaths, "ScaleSwitcher");
        },
        /**
         * Checks if this tool should be open initially controlled by the url param "isinitopen".
         * @returns {void}
         */
        activateByUrlParam: ({rootState, commit}) => {
            const mappings = ["scaleswitcher"];

            if (rootState.queryParams instanceof Object && rootState.queryParams.isinitopen !== undefined && mappings.indexOf(rootState.queryParams.isinitopen.toLowerCase()) !== -1) {
                commit("setActive", true);
            }
        },
        /**
        * Sets the active property of the state to the given value.
        * Also starts processes if the tool is be activated (active === true).
        * @param {boolean} active Value deciding whether the tool gets activated or deactivated.
        * @returns {void}
        */
        setActive ({commit}, active) {
            commit("setActive", active);
        }
    };

export default actions;
