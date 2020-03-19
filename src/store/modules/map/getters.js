import state from "./state";
import {generateSimpleGetters} from "../../utils/generators";

const getters = {
    ...generateSimpleGetters(state),
    layerById: (_, g) => id => g.layers[id],
    maximumZoomLevelActive: (_, g) => g.zoomLevel === g.maxZoomLevel,
    minimumZoomLevelActive: (_, g) => g.zoomLevel === g.minZoomLevel,
    scaleWithUnit: (_, g) => `[placeholder] ${g.projectionUnits || ""}`, // TODO - can probably read hot to do this from ScaleLine
    scaleToOne: (_, {scale}) => `1 : ${(scale > 100 ? Math.round(scale / 100) * 100 : Math.round(scale)).toLocaleString()}`,
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits()
};

export default getters;
