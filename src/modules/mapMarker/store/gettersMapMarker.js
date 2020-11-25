import mapMarkerState from "./stateMapMarker";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(mapMarkerState)
};

export default getters;
