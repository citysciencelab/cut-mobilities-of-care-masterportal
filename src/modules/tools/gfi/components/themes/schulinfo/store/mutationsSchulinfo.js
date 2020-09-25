import {generateSimpleMutations} from "../../../../../../../app-store/utils/generators";
import schulinfoState from "./stateSchulinfo";

const mutations = {
    ...generateSimpleMutations(schulinfoState)
};

export default mutations;
