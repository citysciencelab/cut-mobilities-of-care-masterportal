import {mobilityModes} from "../../../shared/constants/mobilityData";

const interactionTypes = {
        DRAW: "draw",
        MODIFY: "modify"
    },
    mobilityModeColors = {
        [mobilityModes.BICYCLE]: {
            hex: "#e91e63",
            rgb: "233, 30, 99",
            strokeHex: "#8f0e3a"
        },
        [mobilityModes.BUS]: {
            hex: "#fe9d0e",
            rgb: "254, 157, 14",
            strokeHex: "#a05f00"
        },
        [mobilityModes.CAR]: {
            hex: "#9c27b0",
            rgb: "156, 39, 176",
            strokeHex: "#5d1769"
        },
        [mobilityModes.TRAIN]: {
            hex: "#4caf50",
            rgb: "76, 175, 80",
            strokeHex: "#2d6930"
        },
        [mobilityModes.WALK]: {
            hex: "#ffcc00",
            rgb: "255, 204, 0",
            strokeHex: "#997a00"
        },
        [mobilityModes.POI]: {
            hex: "#3F51B5",
            rgb: "63, 81, 181",
            strokeHex: "#fff"
        }
    },
    mobilityModeCSSColorVariables = Object.entries(mobilityModeColors).reduce(
        (variables, [mobilityMode, color]) => ({
            ...variables,
            ["--mobility-mode-" + mobilityMode + "-color-hex"]: color.hex,
            ["--mobility-mode-" + mobilityMode + "-color-rgb"]: color.rgb
        }),
        {}
    ),
    mobilityModeIcons = {
        [mobilityModes.BICYCLE]: "directions_bike",
        [mobilityModes.BUS]: "directions_bus",
        [mobilityModes.CAR]: "directions_car",
        [mobilityModes.TRAIN]: "directions_transit",
        [mobilityModes.WALK]: "directions_walk",
        [mobilityModes.POI]: "fmd_good"
    },
    drawingModes = {
        // matches the open layers GeometryType
        POINT: "Point",
        LINE: "LineString",
        AREA: "Polygon"
    },
    drawingModeIcons = {
        [drawingModes.POINT]: "place",
        [drawingModes.LINE]: "route",
        [drawingModes.AREA]: "texture"
    },
    annotationColor = {
        fill: "#66afe9",
        stroke: "#196daf"
    },
    views = {
        INTRO_VIEW: 0,
        PERSONAL_DATA_VIEW: 1,
        DAILY_ROUTINE_VIEW: 2,
        ANNOTATIONS_VIEW: 3,
        CLOSING_VIEW: 4
    },
    drawingViews = [views.DAILY_ROUTINE_VIEW, views.ANNOTATIONS_VIEW];

export {
    interactionTypes,
    mobilityModeColors,
    mobilityModeCSSColorVariables,
    mobilityModeIcons,
    drawingModes,
    drawingModeIcons,
    annotationColor,
    views,
    drawingViews
};
