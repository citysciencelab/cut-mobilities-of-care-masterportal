import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

const configPaths = [
        "configJs.footer"
    ],
    actions = {
        initialize: context => {
            return fetchFirstModuleConfig(context, configPaths, "Footer");
        }
    };

export default actions;
