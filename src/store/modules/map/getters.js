import state from "./state";

const getters = {
    ...Object.keys(state)
        .reduce((acc, key) => ({
            ...acc,
            [key]: s => s[key]
        }), {}),
    maximumZoomLevelActive: (_, g) => g.zoomLevel === g.maxZoomLevel,
    minimumZoomLevelActive: (_, g) => g.zoomLevel === g.minZoomLevel,
    scaleWithUnit: (_, g) => `[placeholder] ${g.projectionUnits || ""}`, // TODO
    scaleToOne: (_, {scale}) => `1 : ${(scale > 100 ? Math.round(scale / 100) * 100 : Math.round(scale)).toLocaleString()}`,
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits()
};

export default getters;
