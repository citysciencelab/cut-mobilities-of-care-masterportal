import {generateSimpleGetters} from "../../../../../../../app-store/utils/generators";
import schulinfoState from "./stateSchulinfo";

const getters = {
    ...generateSimpleGetters(schulinfoState),

    getSelectedProperty: state => () => {
        console.log(state.assignedFeatureProperties.find(property => property.isSelected === true));
        return state.assignedFeatureProperties.find(property => property.isSelected === true);
    }

};

export default getters;
