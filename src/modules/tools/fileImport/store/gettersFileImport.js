
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import fileImportState from "./stateFileImport";

const getters = {
    ...generateSimpleGetters(fileImportState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
