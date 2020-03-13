import state from "./state";

const getters = {
    ...Object.keys(state)
        .reduce((acc, key) => ({
            ...acc,
            [key]: s => s[key]
        }), {}),
    maximumZoomLevelActive: (_, g) => g.zoomLevel === g.maxZoomLevel,
    minimumZoomLevelActive: (_, g) => g.zoomLevel === g.minZoomLevel,
    scaleWithUnit: (_, g) => `${g.scale} ${g.projectionUnits || ""}`,
    scaleToOne: (_, g) => `1 : ${g.scale}`,
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits()
};

export default getters;
