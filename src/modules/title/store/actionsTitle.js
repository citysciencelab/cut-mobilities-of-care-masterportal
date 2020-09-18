import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
    "configJson.Portalconfig.portalTitle"
];

export default {
    /**
     * Sets the config-params of this tool into state.
     * @param {object} context the context Vue instance
     * @returns {boolean} false, if config does not contain the tool
     */
    initialize: context => fetchFirstModuleConfig(context, configPaths, "portalTitle")
};
