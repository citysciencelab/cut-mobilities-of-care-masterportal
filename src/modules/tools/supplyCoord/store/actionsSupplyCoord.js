import {fetchFirstModuleConfig} from "../../../../utils/helper";

const configPaths = [
    "configJson.Portalconfig.menu.tools.children.coord"
];

export default {
    initialize: context => fetchFirstModuleConfig(context, configPaths, "coord")
};
