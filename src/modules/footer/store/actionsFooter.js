import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
        "configJs.footer"
    ],
    actions = {
        /**
         * Sets the config-params of this footer into state.
         * @param {object} context the context Vue instance
         * @returns {boolean} false, if config does not contain the footer
         */
        initialize: context => {
            return fetchFirstModuleConfig(context, configPaths, "Footer");
        }
    };

export default actions;
