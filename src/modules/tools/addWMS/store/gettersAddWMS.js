import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import AddWMSState from "./stateAddWMS";

const getters = {
    ...generateSimpleGetters(AddWMSState)
};

export default getters;
